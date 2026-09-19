import assert from 'node:assert/strict';
import { test } from 'node:test';
const base = process.env.QUIZ_TEST_URL || 'http://127.0.0.1:3000';
function browser() {
  const cookies = new Map();
  return async (path, method = 'GET', body, extra = {}) => {
    const r = await fetch(base + path, { method, headers: { Origin: base, 'Content-Type': 'application/json', Cookie: [...cookies].map(([k,v])=>`${k}=${v}`).join('; '), ...extra }, ...(body===undefined?{}:{body:JSON.stringify(body)}) });
    for(const c of r.headers.getSetCookie()) { const [k,v]=c.split(';')[0].split('=');cookies.set(k,v); }
    return r;
  };
}
test('API complète : 12 participants concurrents, isolation, reprise, révocation et export', async()=>{
  const host=browser();let r=await host('/api/quiz-1/sessions','POST',{key:process.env.QUIZ_HOST_KEY||''}); assert.equal(r.status,201,await r.clone().text());const {code}=await r.json();const url=`/api/quiz-1/sessions/${code}`;
  try {
    const users=Array.from({length:12},browser);
    await Promise.all(users.map(async u=>assert.equal((await u(url,'POST',{action:'join'})).status,200)));
    let view=await (await host(url+'?role=host')).json();assert.equal(view.participants,12);assert.equal(view.phase,'lobby');
    assert.equal((await users[0](url+'?role=host')).status,403);
    assert.equal((await users[0](url,'POST',{action:'start',current:-1,phase:'lobby'})).status,403);
    assert.equal((await browser()(url)).status,401);
    assert.equal((await host(url,'POST',{action:'start',current:-1,phase:'lobby'}, {Origin:'https://foreign.invalid'})).status,403);
    assert.equal((await host(url,'POST',{action:'start',current:-1,phase:'lobby'})).status,200);
    await Promise.all(users.map(async(u,i)=>assert.equal((await u(url,'POST',{action:'answer',questionId:1,choice:i%4})).status,200)));
    view=await(await host(url+'?role=host')).json();assert.equal(view.answered,12);assert.equal(view.correction,null);assert.equal(view.counts,null);assert.ok(!JSON.stringify(view).includes('explanation'));
    assert.equal((await users[0](url,'POST',{action:'answer',questionId:1,choice:2})).status,200);
    assert.equal((await users[0](url,'POST',{action:'join'})).status,200);
    view=await(await users[0](url)).json();assert.equal(view.selected,2);assert.equal(view.participants,12);
    assert.equal((await host(url,'POST',{action:'close',current:0,phase:'open'})).status,200);
    assert.equal((await users[0](url,'POST',{action:'answer',questionId:1,choice:1})).status,409);
    assert.equal((await users[0](url+'?export=1')).status,403);
    assert.equal((await host(url,'POST',{action:'reveal',current:0,phase:'closed'})).status,200);
    view=await(await host(url+'?role=host')).json();assert.deepEqual(view.counts,[2,3,4,3]);assert.equal(view.correction.correct,1);
    const qr=await host(`/api/quiz-1/qr?code=${code}`);assert.equal(qr.status,200);assert.match(await qr.text(),/<svg/);
    assert.equal((await users[0](`/api/quiz-1/qr?code=${code}`)).status,403);
    assert.equal((await host(url,'POST',{action:'finish',current:0,phase:'revealed'})).status,200);
    view=await(await users[1](url)).json();assert.equal(view.results.length,1);assert.equal(view.score,1);
    const csv=await host(url+'?role=host&export=1');assert.equal(csv.status,200);assert.match(await csv.text(),/Bonne réponse/);
    assert.equal((await browser()(url,'POST',{action:'join'})).status,409);
    console.log(`Session ${code}: concurrence et contrôles d’accès validés.`);
  } finally {assert.equal((await host(url,'DELETE',{})).status,200);}
  assert.equal((await host(url+'?role=host')).status,404);
});
