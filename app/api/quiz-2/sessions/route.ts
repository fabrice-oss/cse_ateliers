import { newSession, newToken, secretMatches } from '@/lib/quiz-2/engine';
import { bodyOf, failure, json, rateLimit, setToken } from '@/lib/quiz-2/http';
import { storageConfigured, store } from '@/lib/quiz-2/store';
import { QuizError } from '@/lib/quiz-2/types';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET() {
  return json({ ready: storageConfigured() && (process.env.NODE_ENV !== 'production' || Boolean(process.env.QUIZ_HOST_KEY)), keyRequired: Boolean(process.env.QUIZ_HOST_KEY), local: !process.env.QUIZ_DATABASE_URL });
}
export async function POST(request: Request) {
  try {
    const body = await bodyOf(request);
    if (!process.env.QUIZ_HOST_KEY && process.env.NODE_ENV === 'production') throw new QuizError(503, 'L’accès formateur doit être configuré avant d’ouvrir les sessions.');
    await rateLimit(request, 'create');
    if (process.env.QUIZ_HOST_KEY && !secretMatches(String(body.key || ''), process.env.QUIZ_HOST_KEY)) throw new QuizError(403, 'La clé formateur est incorrecte.');
    const db = await store();
    const token = newToken();
    for (let i = 0; i < 10; i++) {
      const session = newSession(token);
      if (await db.insert(session)) return setToken(json({ code: session.code }, 201), session.code, 'host', token);
    }
    throw new QuizError(503, 'Impossible de créer une session. Réessayez.');
  } catch (error) { return failure(error); }
}
