import { control, join, newToken, requireHost, snapshot, submit } from '@/lib/quiz-2/engine';
import { bodyOf, failure, json, originOf, rateLimit, setToken, tokenFor } from '@/lib/quiz-2/http';
import { mutateSession, readSession, store } from '@/lib/quiz-2/store';
import { QuizError } from '@/lib/quiz-2/types';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
type Context = { params: Promise<{ code: string }> };
export async function GET(request: Request, context: Context) {
  try {
    const { code } = await context.params;
    const role = new URL(request.url).searchParams.get('role') === 'host' ? 'host' : 'participant';
    const row = await readSession(code);
    const view = snapshot(row, role, await tokenFor(code, role));
    if (new URL(request.url).searchParams.get('export') === '1') {
      requireHost(row.data, await tokenFor(code, 'host'));
      const ended = snapshot({ ...row, data: { ...row.data, phase: 'finished' } }, 'host', await tokenFor(code, 'host'));
      const lines: (string | number)[][] = [['Question', 'Énoncé', 'Choix', 'Réponses', 'Bonne réponse', 'Explication', 'Diapositives']];
      ended.results.forEach(r => r.question.choices.forEach((choice, i) => lines.push([r.question.id, r.question.text, choice, r.counts[i], i === r.correction.correct ? 'Oui' : 'Non', r.correction.explanation, r.correction.slides])));
      const csv = '\uFEFF' + lines.map(line => line.map(v => `"${String(v).replaceAll('"', '""')}"`).join(';')).join('\r\n');
      return new Response(csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="quiz-2-${code}.csv"`, 'Cache-Control': 'no-store, private' } });
    }
    const joinUrl = `${originOf(request)}/ateliers/quiz-2/rejoindre?code=${code}`;
    return json({ ...view, joinUrl, localOnly: ['localhost', '127.0.0.1', '[::1]'].includes(new URL(joinUrl).hostname) });
  } catch (error) { return failure(error); }
}
export async function POST(request: Request, context: Context) {
  try {
    const { code } = await context.params;
    const body = await bodyOf(request);
    if (body.action === 'join') {
      await rateLimit(request, 'join');
      const token = await tokenFor(code, 'participant') || newToken();
      await mutateSession(code, session => join(session, token));
      return setToken(json({ code }), code, 'participant', token);
    }
    if (body.action === 'answer') {
      const token = await tokenFor(code, 'participant');
      if (typeof body.questionId !== 'number' || typeof body.choice !== 'number') throw new QuizError(400, 'La réponse est invalide.');
      await mutateSession(code, session => submit(session, token, body.questionId as number, body.choice as number));
      return json({ saved: true });
    }
    const token = await tokenFor(code, 'host');
    if (typeof body.current !== 'number' || typeof body.phase !== 'string' || typeof body.action !== 'string') throw new QuizError(400, 'Commande formateur invalide.');
    await mutateSession(code, session => control(session, token, body.action as string, body.current as number, body.phase as string));
    return json({ ok: true });
  } catch (error) { return failure(error); }
}
export async function DELETE(request: Request, context: Context) {
  try {
    await bodyOf(request);
    const { code } = await context.params;
    const row = await readSession(code);
    requireHost(row.data, await tokenFor(code, 'host'));
    if (!await (await store()).remove(code, row.revision)) throw new QuizError(409, 'La session a évolué. Réessayez la suppression.');
    return json({ deleted: true });
  } catch (error) { return failure(error); }
}
