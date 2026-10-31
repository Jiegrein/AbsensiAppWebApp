import { useCallback, useEffect, useState } from 'react';
import DashboardService, { ProjectAttendance } from '../services/DashboardService';
import { describeRequestError } from '../services/requestError';
import { DateRange, isValidRange } from '../utils/dateRanges';

/** Attendance for one project and range; `reload` refetches after the payroll rules change. */
export const useAttendance = (projectId: string | null, range: DateRange) => {
  const [data, setData] = useState<ProjectAttendance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  const startTime = range.start.getTime();
  const endTime = range.end.getTime();

  useEffect(() => {
    if (!projectId || !isValidRange(range)) {
      setData(null);
      return undefined;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    DashboardService.getAttendance(projectId, range)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((caught) => {
        if (!cancelled) setError(describeRequestError(caught, 'Gagal memuat absensi.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // range is keyed by its timestamps so a new object with the same dates does not refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, startTime, endTime, version]);

  const reload = useCallback(() => setVersion((current) => current + 1), []);

  return { data, loading, error, reload };
};
