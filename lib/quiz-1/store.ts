import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import type { RecordRow, Session } from './types';
import { QuizError } from './types';

type Store = {
  get(code: string): Promise<RecordRow | null>;
  insert(data: Session): Promise<boolean>;
  replace(code: string, revision: number, data: Session): Promise<boolean>;
  remove(code: string, revision: number): Promise<boolean>;
  prune(): Promise<void>;
  hit(key: string, expiresAt: number): Promise<number>;
};
const cache = globalThis as typeof globalThis & { quizStore?: Promise<Store>; quizPrunedAt?: number };
export function storageConfigured() { return Boolean(process.env.QUIZ_DATABASE_URL) || (!process.env.VERCEL && (process.env.NODE_ENV !== 'production' || process.env.QUIZ_ALLOW_LOCAL === '1')); }
async function createStore(): Promise<Store> {
  if (process.env.QUIZ_DATABASE_URL) {
    const { default: postgres } = await import('postgres');
    const sql = postgres(process.env.QUIZ_DATABASE_URL, { max: 3, prepare: false, idle_timeout: 20, connect_timeout: 10 });
    return {
      async get(code) { const rows = await sql`select revision, data from quiz_private.sessions where code=${code}`; return rows.length ? { revision: Number(rows[0].revision), data: JSON.parse(rows[0].data) } : null; },
      async insert(data) { const rows = await sql`insert into quiz_private.sessions (code, revision, data, expires_at) values (${data.code}, 0, ${JSON.stringify(data)}, ${data.expiresAt}) on conflict do nothing returning code`; return rows.length === 1; },
      async replace(code, revision, data) { const rows = await sql`update quiz_private.sessions set data=${JSON.stringify(data)}, revision=revision+1 where code=${code} and revision=${revision} returning code`; return rows.length === 1; },
      async remove(code, revision) { const rows = await sql`delete from quiz_private.sessions where code=${code} and revision=${revision} returning code`; return rows.length === 1; },
      async prune() { await sql`delete from quiz_private.sessions where expires_at < ${Date.now()}`; await sql`delete from quiz_private.rate_limits where expires_at < ${Date.now()}`; },
      async hit(key, expiresAt) { const rows = await sql`insert into quiz_private.rate_limits (key, hits, expires_at) values (${key},1,${expiresAt}) on conflict (key) do update set hits=quiz_private.rate_limits.hits+1 returning hits`; return Number(rows[0].hits); },
    };
  }
  if (!storageConfigured()) throw new QuizError(503, 'Le quiz collectif attend la configuration de son stockage partagé. Contactez le formateur.');
  const { DatabaseSync } = await import('node:sqlite');
  const file = resolve(/* turbopackIgnore: true */ process.env.QUIZ_SQLITE_PATH || '.quiz-data/quiz.sqlite');
  await mkdir(dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
    CREATE TABLE IF NOT EXISTS sessions (code TEXT PRIMARY KEY, revision INTEGER NOT NULL, data TEXT NOT NULL, expires_at INTEGER NOT NULL);
    CREATE INDEX IF NOT EXISTS expiry ON sessions(expires_at);
    CREATE TABLE IF NOT EXISTS rate_limits (key TEXT PRIMARY KEY, hits INTEGER NOT NULL, expires_at INTEGER NOT NULL);`);
  return {
    async get(code) { const row = db.prepare('SELECT revision,data FROM sessions WHERE code=?').get(code); return row ? { revision: Number(row.revision), data: JSON.parse(String(row.data)) } : null; },
    async insert(data) { return db.prepare('INSERT OR IGNORE INTO sessions VALUES (?,0,?,?)').run(data.code, JSON.stringify(data), data.expiresAt).changes === 1; },
    async replace(code, revision, data) { return db.prepare('UPDATE sessions SET data=?,revision=revision+1 WHERE code=? AND revision=?').run(JSON.stringify(data), code, revision).changes === 1; },
    async remove(code, revision) { return db.prepare('DELETE FROM sessions WHERE code=? AND revision=?').run(code, revision).changes === 1; },
    async prune() { db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(Date.now()); db.prepare('DELETE FROM rate_limits WHERE expires_at < ?').run(Date.now()); },
    async hit(key, expiresAt) { const row = db.prepare('INSERT INTO rate_limits VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET hits=hits+1 RETURNING hits').get(key, expiresAt); return Number(row!.hits); },
  };
}
export async function store(): Promise<Store> {
  cache.quizStore ??= createStore().catch(error => { cache.quizStore = undefined; throw error; });
  const db = await cache.quizStore;
  if (Date.now() - (cache.quizPrunedAt || 0) > 60_000) { await db.prune(); cache.quizPrunedAt = Date.now(); }
  return db;
}
export async function readSession(code: string) {
  if (!/^\d{6}$/.test(code)) throw new QuizError(400, 'Le code de session contient six chiffres.');
  const row = await (await store()).get(code);
  if (!row || row.data.expiresAt <= Date.now()) throw new QuizError(404, 'Cette session est introuvable ou a expiré. Vérifiez le code auprès du formateur.');
  if (row.data.version !== 1) throw new QuizError(409, 'Cette session appartient à une ancienne version du quiz. Créez une nouvelle session.');
  return row;
}
// Compare-and-swap protects answers against concurrent submissions and host transitions,
// including when requests run on different serverless instances.
export async function mutateSession(code: string, change: (session: Session) => void): Promise<RecordRow> {
  const db = await store();
  for (let attempt = 0; attempt < 40; attempt++) {
    const row = await readSession(code);
    change(row.data);
    if (await db.replace(code, row.revision, row.data)) return { revision: row.revision + 1, data: row.data };
    await new Promise(resolve => setTimeout(resolve, Math.min(100, 5 * attempt) + Math.random() * 20));
  }
  throw new QuizError(409, 'Plusieurs réponses arrivent en même temps. Réessayez dans un instant.');
}
