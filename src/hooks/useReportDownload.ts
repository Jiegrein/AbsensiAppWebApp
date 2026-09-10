import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import AdminService from '../services/AdminServices';
import { DateRange } from '../utils/dateRanges';
import { saveBlob } from '../utils/saveBlob';

export type DownloadStatus = 'idle' | 'downloading' | 'done' | 'error';

const DONE_RESET_DELAY_MS = 2500;

const describeError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      return `Server menolak permintaan (HTTP ${error.response.status}). Coba rentang tanggal lain.`;
    }
    return 'Tidak bisa menghubungi server. Periksa koneksi lalu coba lagi.';
  }
  return 'Terjadi kesalahan tak terduga saat mengunduh laporan.';
};

/** Owns the download lifecycle so the UI only renders status, progress, and errors. */
export const useReportDownload = () => {
  const [status, setStatus] = useState<DownloadStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const download = useCallback(async (range: DateRange) => {
    setStatus('downloading');
    setProgress(0);
    setError(null);
    try {
      const report = await AdminService.getPayrollReport(range.start, range.end, setProgress);
      saveBlob(report.blob, report.fileName);
      setProgress(100);
      setStatus('done');
    } catch (caught) {
      setError(describeError(caught));
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    if (status !== 'done') return undefined;
    const timer = window.setTimeout(() => {
      setStatus('idle');
      setProgress(0);
    }, DONE_RESET_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [status]);

  return { status, progress, error, download };
};
