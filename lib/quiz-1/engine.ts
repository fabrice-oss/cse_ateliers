import { createHash, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';
import { questions } from './questions';
import type { Correction, PublicQuestion, RecordRow, Session, Snapshot } from './types';
import { QuizError } from './types';
export const lifetime = 24 * 60 * 60 * 1000;
export const newToken = () => randomBytes(32).toString('hex');
export const hash = (value: string) => createHash('sha256').update(value).digest('hex');
export function secretMatches(a: string, b: string) { return timingSafeEqual(Buffer.from(hash(a)), Buffer.from(hash(b))); }
export function newSession(hostToken: string): Session {
  return { version: 1, code: String(randomInt(100000, 1000000)), hostHash: hash(hostToken), createdAt: Date.now(), expiresAt: Date.now() + lifetime, phase: 'lobby', current: -1, revealed: [], participants: {} };
}
export function requireHost(session: Session, token: string) {
  if (!token || !secretMatches(hash(token), session.hostHash)) throw new QuizError(403, 'L’accès formateur est réservé au navigateur qui a créé cette session.');
}
export function requireParticipant(session: Session, token: string) {
  const participant = token ? session.participants[hash(token)] : undefined;
  if (!participant) throw new QuizError(401, 'Rejoignez cette session pour participer.');
  return participant;
}
export function join(session: Session, token: string) {
  if (session.participants[hash(token)]) return;
  if (session.phase === 'finished') throw new QuizError(409, 'Cette session est terminée. Demandez une nouvelle session au formateur.');
  if (Object.keys(session.participants).length >= 500) throw new QuizError(409, 'Cette session a atteint sa capacité de 500 participants.');
  session.participants[hash(token)] = { joinedAt: Date.now(), answers: {} };
}
export function submit(session: Session, token: string, questionId: number, choice: number) {
  const participant = requireParticipant(session, token);
  const question = questions[session.current];
  if (session.phase !== 'open' || !question || question.id !== questionId) throw new QuizError(409, 'Les réponses à cette question sont fermées. La session a été actualisée.');
  if (!Number.isInteger(choice) || choice < 0 || choice >= question.choices.length) throw new QuizError(400, 'Choisissez une réponse proposée.');
  participant.answers[String(questionId)] = choice;
}
export function control(session: Session, token: string, action: string, expectedCurrent: number, expectedPhase: string) {
  requireHost(session, token);
  // Stale/double commands must never skip questions or reveal the next correction.
  if (expectedCurrent !== session.current || expectedPhase !== session.phase) throw new QuizError(409, 'La session a évolué. Vérifiez la question affichée avant de continuer.');
  if (action === 'start' && session.phase === 'lobby') { session.current = 0; session.phase = 'open'; }
  else if (action === 'close' && session.phase === 'open') session.phase = 'closed';
  else if (action === 'reveal' && session.phase === 'closed') { session.phase = 'revealed'; session.revealed.push(session.current); }
  else if (action === 'next' && session.phase === 'revealed') {
    if (session.current === questions.length - 1) session.phase = 'finished';
    else { session.current++; session.phase = 'open'; }
  } else if (action === 'finish' && session.phase !== 'finished') session.phase = 'finished';
  else throw new QuizError(409, 'Cette action n’est pas disponible à cette étape.');
}
const publicQuestion = (i: number): PublicQuestion => { const { id, theme, text, choices } = questions[i]; return { id, theme, text, choices }; };
const correction = (i: number): Correction => { const { correct, explanation, slides, sources } = questions[i]; return { correct, explanation, slides, sources }; };
export function snapshot(row: RecordRow, role: 'host' | 'participant', token: string): Snapshot {
  const s = row.data;
  const person = role === 'host' ? (requireHost(s, token), null) : requireParticipant(s, token);
  const countsFor = (i: number) => {
    const counts = questions[i].choices.map(() => 0);
    Object.values(s.participants).forEach(p => { const choice = p.answers[String(questions[i].id)]; if (choice !== undefined) counts[choice]++; });
    return counts;
  };
  const visible = s.current >= 0 && s.phase !== 'lobby';
  const counts = visible ? countsFor(s.current) : [];
  const disclosed = s.revealed.includes(s.current);
  const results = s.phase === 'finished' ? s.revealed.map(i => ({ question: publicQuestion(i), correction: correction(i), counts: countsFor(i), answered: countsFor(i).reduce((a,b) => a+b,0), selected: person?.answers[String(questions[i].id)] ?? null })) : [];
  return {
    code: s.code, revision: row.revision, role, phase: s.phase, current: s.current, total: questions.length,
    participants: Object.keys(s.participants).length, answered: counts.reduce((a,b) => a+b,0), expiresAt: s.expiresAt,
    question: visible ? publicQuestion(s.current) : null, selected: visible ? person?.answers[String(questions[s.current].id)] ?? null : null,
    correction: disclosed ? correction(s.current) : null, counts: disclosed ? counts : null, results,
    score: person && s.phase === 'finished' ? results.filter(r => r.selected === r.correction.correct).length : null,
  };
}
