import { format, subDays, isToday, isYesterday } from 'date-fns';

export const todayStr = () => format(new Date(), 'yyyy-MM-dd');
export const fmtDate  = (d, f = 'MMM d, yyyy') => format(new Date(d), f);
export const fmtShort = (d) => {
  const dt = new Date(d);
  if (isToday(dt))     return 'Today';
  if (isYesterday(dt)) return 'Yesterday';
  return format(dt, 'EEE, MMM d');
};
