export function parseApiError(err: unknown): string {
  const message = (err as any)?.response?.data?.message;

  if (Array.isArray(message) && message.length > 0) {
    return message.join('. ');
  }

  if (typeof message === 'string' && message.trim().length > 0) {
    return message;
  }

  return 'An error occurred. Please try again.';
}
