import 'server-only';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { hash, lifetime } from './engine';
import { store } from './store';
import { QuizError } from './types';
export const cookieName = (code: string, role: string) => `quiz1_${role}_${code}`;
export async function tokenFor(code: string, role: string) { return (await cookies()).get(cookieName(code, role))?.value || ''; }
export function json(data: unknown, status = 200) { return NextResponse.json(data, { status, headers: { 'Cache-Control': 'no-store, private', 'Vary': 'Cookie' } }); }
export function setToken(response: NextResponse, code: string, role: string, token: string) {
  response.cookies.set(cookieName(code, role), token, { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' && process.env.QUIZ_ALLOW_LOCAL !== '1', path: '/api/quiz-1', maxAge: lifetime / 1000 });
  return response;
}
export function originOf(request: Request) {
  const parsed = new URL(request.url);
  const host = request.headers.get('host');
  const origin = host ? new URL(`${parsed.protocol}//${host}`).origin : parsed.origin;
  return process.env.QUIZ_PUBLIC_URL ? new URL(process.env.QUIZ_PUBLIC_URL).origin : origin;
}
export async function bodyOf(request: Request): Promise<Record<string, unknown>> {
  const origin = request.headers.get('origin');
  const parsed = new URL(request.url);
  const host = request.headers.get('host');
  const allowed = new Set([parsed.origin, originOf(request), ...(host ? [`${parsed.protocol}//${host}`] : [])]);
  if (!origin || !allowed.has(origin)) throw new QuizError(403, 'Cette requête ne provient pas de l’application.');
  if (!request.headers.get('content-type')?.includes('application/json')) throw new QuizError(415, 'Format de requête invalide.');
  // Limit streaming bodies too (not only a user-supplied Content-Length).
  const reader = request.body?.getReader();
  if (!reader) throw new QuizError(400, 'Requête vide.');
  const chunks: Uint8Array[] = []; let size = 0;
  try {
    while (true) { const { done, value } = await reader.read(); if (done) break; size += value.length; if (size > 2048) { await reader.cancel(); throw new QuizError(413, 'Requête trop volumineuse.'); } chunks.push(value); }
    const body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error();
    return body;
  } catch (error) { if (error instanceof QuizError) throw error; throw new QuizError(400, 'Requête invalide.'); }
}
export async function rateLimit(request: Request, kind: 'create' | 'join') {
  const period = kind === 'create' ? 15 * 60_000 : 60_000;
  const bucket = Math.floor(Date.now() / period);
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'local';
  const key = hash(`${process.env.QUIZ_HOST_KEY || 'local'}:${kind}:${ip}:${bucket}`);
  const hits = await (await store()).hit(key, (bucket + 1) * period);
  if (hits > (kind === 'create' ? 10 : 600)) throw new QuizError(429, 'Trop de tentatives. Patientez avant de réessayer.');
}
export function failure(error: unknown) {
  if (error instanceof QuizError) return json({ error: error.message }, error.status);
  // Never log database URLs, tokens or raw provider errors.
  console.error('Quiz 1: opération indisponible', error instanceof Error ? error.name : 'UnknownError');
  return json({ error: 'Le service du quiz est temporairement indisponible. Réessayez dans un instant.' }, 503);
}
