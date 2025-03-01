import { type ClassValue, clsx } from 'clsx';
import { formatDate, formatDistanceToNowStrict } from 'date-fns';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeDate(from: Date | string) {
  try {
    const dateObj = typeof from === 'string' ? new Date(from) : from;
    if (Number.isNaN(dateObj.getTime())) {
      console.error('Invalid date:', from);
      return 'Invalid date';
    }

    const currentDate = new Date();
    if (currentDate.getTime() - dateObj.getTime() < 24 * 60 * 60 * 1000) {
      return formatDistanceToNowStrict(dateObj, { addSuffix: true });
    }
    if (currentDate.getFullYear() === dateObj.getFullYear()) {
      return formatDate(dateObj, 'MMM d');
    }
    return formatDate(dateObj, 'MMM d, yyyy');
  } catch (e) {
    console.error('Error formatting date:', e, 'Input was:', from);
    return 'Invalid date';
  }
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^a-z0-9-]/g, '');
}
