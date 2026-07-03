export function formatDate(date: Date): string {
  return date.toISOString();
}

export function parseDate(date: string): Date {
  return new Date(date);
}
