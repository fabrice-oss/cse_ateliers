import { createEngine } from '../quiz-core/engine';
import { questions } from './questions';
export { hash, newToken, secretMatches, lifetime } from '../quiz-core/engine';
export const { newSession, requireHost, requireParticipant, join, submit, control, snapshot } = createEngine(questions, 'quiz-2');
