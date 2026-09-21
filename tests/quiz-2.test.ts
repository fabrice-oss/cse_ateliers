import assert from 'node:assert/strict';
import { test } from 'node:test';
import { control, hash, join, newSession, newToken, snapshot, submit } from '../lib/quiz-2/engine';
import { questions } from '../lib/quiz-2/questions';
import { QuizError } from '../lib/quiz-2/types';
const setup = () => { const host = newToken(), token = newToken(); const session = newSession(host); join(session, token); return { host, token, session }; };
test('30 questions distinctes, une réponse valide, références limitées aux diapositives 101–226', () => {
  assert.equal(questions.length,30);
  questions.forEach((q,i) => { assert.equal(q.id,i+1); assert.equal(q.choices.length,4); assert.equal(new Set(q.choices).size,4); assert.ok(q.correct >=0 && q.correct<4); assert.ok(q.explanation.length > 30); assert.ok(q.slides.match(/\d+/g)!.every(n => +n>=101 && +n<=226)); });
});
test('aucune réponse, explication, source ou jeton dans les vues avant révélation', () => {
  const { host,token,session }=setup(); control(session,host,'start',-1,'lobby');
  for (const role of ['participant','host'] as const) { const v=snapshot({data:session,revision:0},role,role==='host'?host:token); assert.equal(v.correction,null); assert.equal(v.counts,null); assert.deepEqual(v.results,[]); const raw=JSON.stringify(v); assert.ok(!raw.includes(questions[0].explanation)); assert.ok(!raw.includes(session.hostHash)); assert.ok(!raw.includes(hash(token))); assert.ok(!('correct' in v.question!)); }
});
test('un participant ne peut ni piloter, ni lire la vue formateur', () => {
  const { token,session }=setup(); assert.throws(()=>control(session,token,'start',-1,'lobby'),QuizError); assert.throws(()=>snapshot({data:session,revision:0},'host',token),QuizError);
});
test('rejoindre à nouveau conserve la participation et ne gonfle pas le compteur', () => {
  const { host,token,session }=setup(); control(session,host,'start',-1,'lobby'); submit(session,token,1,2); join(session,token); assert.equal(Object.keys(session.participants).length,1); assert.equal(session.participants[hash(token)].answers['1'],2);
});
test('réponse modifiable, comptée une fois, impossible avant ouverture ou après fermeture', () => {
  const { host,token,session }=setup(); assert.throws(()=>submit(session,token,1,0),QuizError); control(session,host,'start',-1,'lobby'); submit(session,token,1,0); submit(session,token,1,1); assert.equal(snapshot({data:session,revision:0},'host',host).answered,1); control(session,host,'close',0,'open'); assert.throws(()=>submit(session,token,1,2),QuizError); assert.equal(snapshot({data:session,revision:0},'participant',token).correction,null); control(session,host,'reveal',0,'closed'); const v=snapshot({data:session,revision:0},'host',host); assert.deepEqual(v.counts,[0,1,0,0]); assert.equal(v.correction?.correct,questions[0].correct);
});
test('les votes invalides, étrangers et portant sur une ancienne question sont rejetés', () => {
  const { host,token,session }=setup(); control(session,host,'start',-1,'lobby'); for(const choice of [-1,4,0.5,NaN]) assert.throws(()=>submit(session,token,1,choice),QuizError); assert.throws(()=>submit(session,newToken(),1,0),QuizError); assert.throws(()=>submit(session,token,2,0),QuizError);
});
test('un double clic ou une commande périmée ne saute aucune question', () => {
  const { host,session }=setup(); control(session,host,'start',-1,'lobby'); assert.throws(()=>control(session,host,'start',-1,'lobby'),QuizError); assert.throws(()=>control(session,host,'next',0,'open'),QuizError); control(session,host,'close',0,'open'); control(session,host,'reveal',0,'closed'); control(session,host,'next',0,'revealed'); assert.throws(()=>control(session,host,'next',0,'revealed'),QuizError); assert.equal(session.current,1); assert.equal(session.phase,'open');
});
test('30 questions parcourues, score et résultats finaux corrects pour plusieurs participants', () => {
  const { host,token,session }=setup(); const second=newToken(); join(session,second); control(session,host,'start',-1,'lobby');
  questions.forEach((q,i)=>{submit(session,token,q.id,q.correct);submit(session,second,q.id,(q.correct+1)%4);control(session,host,'close',i,'open');control(session,host,'reveal',i,'closed');control(session,host,'next',i,'revealed');});
  assert.equal(session.phase,'finished'); const first=snapshot({data:session,revision:0},'participant',token),other=snapshot({data:session,revision:0},'participant',second);assert.equal(first.score,30);assert.equal(other.score,0);assert.equal(first.results.length,30);assert.equal(first.participants,2);assert.throws(()=>join(session,newToken()),QuizError);join(session,token);
});
test('fin anticipée : seules les questions révélées comptent dans le bilan', () => {
  const { host,token,session }=setup(); control(session,host,'start',-1,'lobby');submit(session,token,1,questions[0].correct);control(session,host,'finish',0,'open');const v=snapshot({data:session,revision:0},'participant',token);assert.equal(v.results.length,0);assert.equal(v.score,0);assert.equal(v.correction,null);
});

test('stockage SQLite durable, révisions concurrentes et expiration', async () => {
  const { mkdtemp } = await import('node:fs/promises');
  const { tmpdir } = await import('node:os');
  const { join: pathJoin } = await import('node:path');
  const dir = await mkdtemp(pathJoin(tmpdir(), 'quiz2-test-'));
  process.env.QUIZ_SQLITE_PATH = pathJoin(dir, 'quiz.sqlite');
  const { store, readSession, mutateSession } = await import('../lib/quiz-2/store');
  const { DatabaseSync } = await import('node:sqlite');
  const db = await store();
  const { session, host } = setup();
  assert.ok(await db.insert(session));
  await Promise.all(Array.from({ length: 12 }, () => mutateSession(session.code, s => join(s, newToken()))));
  const row = await readSession(session.code);
  assert.equal(Object.keys(row.data.participants).length,13);
  assert.equal(await db.replace(session.code,0,session),false);
  const secondConnection = new DatabaseSync(process.env.QUIZ_SQLITE_PATH, { readOnly: true });
  const raw = secondConnection.prepare('SELECT data FROM sessions WHERE code=?').get(session.code);
  assert.equal(Object.keys(JSON.parse(String(raw!.data)).participants).length,13);
  secondConnection.close();
  await mutateSession(session.code, s => { s.expiresAt = Date.now() - 1000; });
  await assert.rejects(readSession(session.code), (e: unknown) => e instanceof QuizError && e.status === 404);
  assert.ok(await db.remove(session.code,row.revision+1));
  assert.ok(host);
});
