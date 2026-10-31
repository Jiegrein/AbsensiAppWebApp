import { format, parseISO } from 'date-fns';
import { id as indonesian } from 'date-fns/locale';

const rupiah = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 });

/** "100000" -> "100.000"; the Rp prefix is left to the column header so numbers stay narrow. */
export const formatAmount = (value: number): string => rupiah.format(value);

/** API clock strings are "HH:mm:ss"; a missing scan renders as a dash. */
export const formatClock = (value: string | null): string => (value ? value : '–');

/** "2026-10-28" -> "Rabu, 28 Okt 2026", the same shape as the Excel date column. */
export const formatDay = (isoDate: string): string => format(parseISO(isoDate), 'EEEE, d MMM yyyy', { locale: indonesian });
