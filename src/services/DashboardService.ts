import { DateRange, toIsoDate } from '../utils/dateRanges';
import { adminClient } from './adminClient';

export interface ProjectSummary {
  projectId: string;
  projectName: string;
  hourOffsetGmt: number;
  createdAt: string;
}

export interface ProjectPage {
  items: ProjectSummary[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

/** Times are "HH:mm" strings, matching <input type="time">. */
export interface PayrollSettings {
  workStart: string;
  breakStart: string;
  breakEnd: string;
  workEnd: string;
  graceMinutes: number;
  workMinutesPerDay: number;
  incentiveAmount: number;
}

/** Clock times are "HH:mm:ss" in the project's local zone, or null when that scan never happened. */
export interface AttendanceDay {
  logId: string;
  date: string;
  startWork: string | null;
  startBreak: string | null;
  endBreak: string | null;
  endWork: string | null;
  dailyPay: number;
  lateStartMinutes: number;
  lateEndBreakMinutes: number;
  earlyEndWorkMinutes: number;
  penalty: number;
  total: number;
  incentive: number;
  complete: boolean;
}

export interface WorkerAttendance {
  workerId: string;
  fullname: string;
  dailyPay: number;
  days: AttendanceDay[];
  totalPay: number;
  totalIncentive: number;
}

export interface ProjectAttendance {
  project: ProjectSummary;
  dateFrom: string;
  dateTo: string;
  settings: PayrollSettings;
  workers: WorkerAttendance[];
}

export const PROJECTS_PER_PAGE = 5;

const DashboardService = {
  getProjects: async (page: number, pageSize: number = PROJECTS_PER_PAGE): Promise<ProjectPage> => {
    const response = await adminClient.get<ProjectPage>('projects', { params: { page, pageSize } });
    return response.data;
  },

  getAttendance: async (projectId: string, range: DateRange): Promise<ProjectAttendance> => {
    const response = await adminClient.get<ProjectAttendance>(`projects/${projectId}/attendance`, {
      params: { dateFrom: toIsoDate(range.start), dateTo: toIsoDate(range.end) },
    });
    return response.data;
  },

  getSettings: async (): Promise<PayrollSettings> => {
    const response = await adminClient.get<PayrollSettings>('payroll-settings');
    return response.data;
  },

  updateSettings: async (settings: PayrollSettings): Promise<PayrollSettings> => {
    const response = await adminClient.put<PayrollSettings>('payroll-settings', settings);
    return response.data;
  },
};

export default DashboardService;
