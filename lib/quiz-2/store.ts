import { readSession as read, mutateSession as mutate } from '../quiz-1/store';
import type { Session } from './types';
export { store, storageConfigured } from '../quiz-1/store';
export const readSession = (code: string) => read(code, 'quiz-2');
export const mutateSession = (code: string, change: (s: Session) => void) => mutate(code, change, 'quiz-2');
