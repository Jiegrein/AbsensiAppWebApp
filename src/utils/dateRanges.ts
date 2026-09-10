import {
  differenceInCalendarDays,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isSameDay,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from 'date-fns';
import { id as indonesian } from 'date-fns/locale';

export interface DateRange {
  start: Date;
  end: Date;
}

export interface RangePreset {
  key: string;
  label: string;
  resolve: (today: Date) => DateRange;
}

// Payroll weeks run Monday to Sunday, matching the weekly blocks in the Excel export.
const weekOptions = { weekStartsOn: 1 as const };

const weekOf = (date: Date): DateRange => ({
  start: startOfWeek(date, weekOptions),
  end: endOfWeek(date, weekOptions),
});

const monthOf = (date: Date): DateRange => ({
  start: startOfMonth(date),
  end: endOfMonth(date),
});

export const rangePresets: RangePreset[] = [
  { key: 'this-week', label: 'Minggu ini', resolve: (today) => weekOf(today) },
  { key: 'last-week', label: 'Minggu lalu', resolve: (today) => weekOf(subWeeks(today, 1)) },
  { key: 'this-month', label: 'Bulan ini', resolve: (today) => monthOf(today) },
  { key: 'last-month', label: 'Bulan lalu', resolve: (today) => monthOf(subMonths(today, 1)) },
];

export const isValidRange = ({ start, end }: DateRange): boolean =>
  !isAfter(startOfDay(start), startOfDay(end));

export const rangeLengthInDays = ({ start, end }: DateRange): number =>
  differenceInCalendarDays(end, start) + 1;

export const matchesPreset = (range: DateRange, preset: RangePreset, today: Date): boolean => {
  const candidate = preset.resolve(today);
  return isSameDay(candidate.start, range.start) && isSameDay(candidate.end, range.end);
};

const longDate = (date: Date): string => format(date, 'EEE, d MMM yyyy', { locale: indonesian });

export const formatRange = ({ start, end }: DateRange): string =>
  isSameDay(start, end) ? longDate(start) : `${longDate(start)} – ${longDate(end)}`;
