import nextEnv from '@next/env';
import { readFile } from 'node:fs/promises';
import postgres from 'postgres';
nextEnv.loadEnvConfig(process.cwd());
if (!process.env.QUIZ_DATABASE_URL) throw new Error('Configurer QUIZ_DATABASE_URL avant de lancer la préparation PostgreSQL.');
const sql = postgres(process.env.QUIZ_DATABASE_URL, { max: 1, prepare: false });
try { await sql.unsafe(await readFile(new URL('./quiz-schema.sql', import.meta.url), 'utf8')); console.log('Schéma privé Quiz 1 prêt.'); }
finally { await sql.end(); }
