import axios from 'axios';
import { apiBaseUrl } from '../config';

export type ProgressListener = (percent: number) => void;

export interface PayrollReport {
  blob: Blob;
  fileName: string;
}

// The API filters on whole calendar days, so send the UTC bounds of the picked dates.
const utcDayStart = (date: Date): Date =>
  new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0));

const utcDayEnd = (date: Date): Date =>
  new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59));

const reportFileName = (): string => `Gajian - ${new Date().toISOString().split('T')[0]}.xlsx`;

const AdminService = {
  getPayrollReport: async (dateFrom: Date, dateTo: Date, onProgress?: ProgressListener): Promise<PayrollReport> => {
    const response = await axios.post<Blob>(
      `${apiBaseUrl}get-data-between-date`,
      { dateFrom: utcDayStart(dateFrom), dateTo: utcDayEnd(dateTo) },
      {
        responseType: 'blob',
        onDownloadProgress: (event: ProgressEvent) => {
          if (onProgress && event.total > 0) {
            // Hold at 99 until the blob is actually saved; the caller reports 100.
            onProgress(Math.min(99, Math.floor((event.loaded * 100) / event.total)));
          }
        },
      }
    );
    return { blob: response.data, fileName: reportFileName() };
  },
};

export default AdminService;
