export type Phase = 'lobby' | 'open' | 'closed' | 'revealed' | 'finished';
export type Source = { label: string; url: string };
export type PublicQuestion = { id: number; theme: string; text: string; choices: string[] };
export type Correction = { correct: number; explanation: string; slides: string; sources: Source[] };
export type Question = PublicQuestion & Correction;
export type Participant = { joinedAt: number; answers: Record<string, number> };
export type Session = {
  version: 1; quizId?: 'quiz-1' | 'quiz-2'; code: string; hostHash: string; createdAt: number; expiresAt: number;
  phase: Phase; current: number; revealed: number[]; participants: Record<string, Participant>;
};
export type RecordRow = { revision: number; data: Session };
export type Result = { question: PublicQuestion; correction: Correction; counts: number[]; answered: number; selected: number | null };
export type Snapshot = {
  code: string; revision: number; role: 'host' | 'participant'; phase: Phase; current: number;
  total: number; participants: number; answered: number; expiresAt: number;
  question: PublicQuestion | null; selected: number | null; correction: Correction | null;
  counts: number[] | null; results: Result[]; score: number | null;
};
export class QuizError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
