// API errors are intentionally French; browser network errors are not.
export function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.name === 'Error' ? error.message : fallback;
}
