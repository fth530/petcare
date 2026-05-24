import { differenceInYears, differenceInMonths, differenceInDays, parseISO } from 'date-fns';

export function calculateAge(dateOfBirth: string): { years: number; months: number; days: number } {
  const dob = parseISO(dateOfBirth);
  const now = new Date();
  const years = differenceInYears(now, dob);
  const months = differenceInMonths(now, dob) % 12;
  const days = differenceInDays(now, dob) % 30;
  return { years, months, days };
}

export function formatAge(dateOfBirth: string, t: (key: string) => string): string {
  const { years, months, days } = calculateAge(dateOfBirth);
  if (years > 0) {
    return months > 0
      ? `${years} ${t('year')} ${months} ${t('month')}`
      : `${years} ${t('year')}`;
  }
  if (months > 0) return `${months} ${t('month')}`;
  return `${days} ${t('day')}`;
}

export function todayPrefix(): string {
  return new Date().toISOString().split('T')[0];
}
