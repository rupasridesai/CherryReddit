import { formatDistanceToNowStrict } from 'date-fns';

export const timeAgo = (date) => {
  try {
    return formatDistanceToNowStrict(new Date(date), { addSuffix: true });
  } catch {
    return '';
  }
};

export const formatKarma = (n) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}m`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
};
