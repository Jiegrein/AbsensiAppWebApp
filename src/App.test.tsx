import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import App from './App';
import type { PayrollSettings, ProjectAttendance, ProjectPage } from './services/DashboardService';

jest.mock('./services/AdminServices', () => ({ __esModule: true, default: { getPayrollReport: jest.fn() } }));
jest.mock('./services/DashboardService', () => ({
  __esModule: true,
  PROJECTS_PER_PAGE: 5,
  default: {
    getProjects: jest.fn(),
    getAttendance: jest.fn(),
    getSettings: jest.fn(),
    updateSettings: jest.fn(),
  },
}));

const service = jest.requireMock('./services/DashboardService').default as {
  getProjects: jest.Mock;
  getAttendance: jest.Mock;
  getSettings: jest.Mock;
  updateSettings: jest.Mock;
};

const project = (name: string, offset = 7) => ({ projectId: `id-${name}`, projectName: name, hourOffsetGmt: offset, createdAt: '2026-10-01T00:00:00Z' });

const pageOne: ProjectPage = {
  items: ['Tiga Raksa', 'Cikande', 'Serang', 'Bekasi', 'Karawang'].map((name) => project(name)),
  page: 1,
  pageSize: 5,
  total: 7,
  hasMore: true,
};

const pageTwo: ProjectPage = { items: [project('Bogor'), project('Bali', 8)], page: 2, pageSize: 5, total: 7, hasMore: false };

const settings: PayrollSettings = {
  workStart: '08:00',
  breakStart: '12:00',
  breakEnd: '13:00',
  workEnd: '17:00',
  graceMinutes: 5,
  workMinutesPerDay: 480,
  incentiveAmount: 3500,
};

const attendanceFor = (name: string): ProjectAttendance => ({
  project: project(name),
  dateFrom: '2026-10-26',
  dateTo: '2026-11-01',
  settings,
  workers: [
    {
      workerId: 'w1',
      fullname: 'Sutaryo',
      dailyPay: 100000,
      totalPay: 192917,
      totalIncentive: 3500,
      days: [
        {
          logId: 'l1',
          date: '2026-10-30',
          startWork: '08:23:47',
          startBreak: '12:00:00',
          endBreak: '13:03:30',
          endWork: '16:50:00',
          dailyPay: 100000,
          lateStartMinutes: 24,
          lateEndBreakMinutes: 0,
          earlyEndWorkMinutes: 10,
          penalty: 7083,
          total: 92917,
          incentive: 0,
          complete: true,
        },
        {
          logId: 'l2',
          date: '2026-10-31',
          startWork: '07:59:00',
          startBreak: null,
          endBreak: null,
          endWork: null,
          dailyPay: 100000,
          lateStartMinutes: 0,
          lateEndBreakMinutes: 0,
          earlyEndWorkMinutes: 0,
          penalty: 0,
          total: 100000,
          incentive: 0,
          complete: false,
        },
      ],
    },
  ],
});

beforeEach(() => {
  jest.clearAllMocks();
  service.getProjects.mockImplementation(async (page: number) => (page === 1 ? pageOne : pageTwo));
  service.getAttendance.mockImplementation(async (projectId: string) => attendanceFor(projectId.replace('id-', '')));
  service.getSettings.mockResolvedValue(settings);
  service.updateSettings.mockImplementation(async (next: PayrollSettings) => next);
});

test('shows the newest five projects as tabs and the first project attendance for the running week', async () => {
  render(<App />);

  const tabs = await screen.findAllByRole('tab');
  expect(tabs.map((tab) => tab.textContent)).toEqual([
    'Tiga RaksaGMT+7',
    'CikandeGMT+7',
    'SerangGMT+7',
    'BekasiGMT+7',
    'KarawangGMT+7',
  ]);
  expect(tabs[0]).toHaveAttribute('aria-selected', 'true');

  const [projectId, range] = service.getAttendance.mock.calls[0];
  expect(projectId).toBe('id-Tiga Raksa');
  expect(range.start.getDay()).toBe(1); // Monday
  expect(range.end.getDay()).toBe(0); // Sunday
  expect(range.end.getTime() - range.start.getTime()).toBeGreaterThan(6 * 24 * 3600 * 1000);

  const sheet = await screen.findByRole('region', { name: 'Sutaryo' });
  expect(within(sheet).getByText('Jumat, 30 Okt 2026')).toBeInTheDocument();
  expect(within(sheet).getByText('08:23:47')).toBeInTheDocument();
  expect(within(sheet).getByText('7.083')).toBeInTheDocument();
  expect(within(sheet).getByText('92.917')).toBeInTheDocument();
  expect(within(sheet).getByText('192.917')).toBeInTheDocument();
  expect(within(sheet).getByText('belum lengkap')).toBeInTheDocument();
  expect(within(sheet).getByText('Total mingguan')).toBeInTheDocument();
});

test('selecting a tab loads that project and the arrows page through projects', async () => {
  render(<App />);
  await screen.findAllByRole('tab');

  fireEvent.click(screen.getByRole('tab', { name: /Cikande/ }));
  await waitFor(() => expect(service.getAttendance).toHaveBeenLastCalledWith('id-Cikande', expect.anything()));

  expect(screen.getByRole('button', { name: 'Proyek sebelumnya' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Proyek berikutnya' }));

  await waitFor(() => expect(service.getProjects).toHaveBeenLastCalledWith(2));
  const tabs = await screen.findAllByRole('tab');
  expect(tabs.map((tab) => tab.textContent)).toEqual(['BogorGMT+7', 'BaliGMT+8']);
  expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
  await waitFor(() => expect(service.getAttendance).toHaveBeenLastCalledWith('id-Bogor', expect.anything()));
  expect(screen.getByRole('button', { name: 'Proyek berikutnya' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Proyek sebelumnya' })).toBeEnabled();
});

test('the gear opens the payroll settings and saving them reloads the attendance', async () => {
  render(<App />);
  await screen.findByRole('region', { name: 'Sutaryo' });
  const attendanceCalls = service.getAttendance.mock.calls.length;

  fireEvent.click(screen.getByRole('button', { name: 'Pengaturan gaji' }));
  const dialog = await screen.findByRole('dialog', { name: 'Pengaturan gaji' });
  const grace = (await within(dialog).findByLabelText('Toleransi (menit)')) as HTMLInputElement;
  expect(grace.value).toBe('5');
  expect((within(dialog).getByLabelText('Jam masuk') as HTMLInputElement).value).toBe('08:00');

  fireEvent.change(grace, { target: { value: '10' } });
  fireEvent.click(within(dialog).getByRole('button', { name: 'Simpan' }));

  await waitFor(() => expect(service.updateSettings).toHaveBeenCalledWith({ ...settings, graceMinutes: 10 }));
  await screen.findByRole('button', { name: 'Tersimpan' });
  await waitFor(() => expect(service.getAttendance.mock.calls.length).toBe(attendanceCalls + 1));
});

test('the Excel download lives behind the header button', async () => {
  render(<App />);
  await screen.findAllByRole('tab');

  fireEvent.click(screen.getByRole('button', { name: /Unduh Excel/ }));

  const dialog = await screen.findByRole('dialog', { name: 'Unduh laporan Excel' });
  expect(within(dialog).getByRole('button', { name: /download laporan gaji/i })).toBeEnabled();
});
