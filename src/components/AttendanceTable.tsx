import { AttendanceDay, ProjectAttendance, WorkerAttendance } from '../services/DashboardService';
import { formatAmount, formatClock, formatDay } from '../utils/format';

interface AttendanceTableProps {
  data: ProjectAttendance;
  totalLabel: string;
}

const columns = [
  'Tanggal kerja',
  'Masuk kerja',
  'Mulai istirahat',
  'Selesai istirahat',
  'Selesai kerja',
  'Gaji per hari',
  'Penalti',
  'Total gaji',
  'Insentif',
];

const penaltyTitle = (day: AttendanceDay): string | undefined => {
  const parts: string[] = [];
  if (day.lateStartMinutes) parts.push(`telat masuk ${day.lateStartMinutes} mnt`);
  if (day.lateEndBreakMinutes) parts.push(`telat kembali ${day.lateEndBreakMinutes} mnt`);
  if (day.earlyEndWorkMinutes) parts.push(`pulang cepat ${day.earlyEndWorkMinutes} mnt`);
  return parts.length ? parts.join(', ') : undefined;
};

const DayRow = ({ day }: { day: AttendanceDay }) => (
  <tr className={day.complete ? undefined : 'row--incomplete'}>
    <td data-label={columns[0]} className="cell--date">
      {formatDay(day.date)}
      {!day.complete && <span className="badge">belum lengkap</span>}
    </td>
    <td data-label={columns[1]} className="cell--clock">{formatClock(day.startWork)}</td>
    <td data-label={columns[2]} className="cell--clock">{formatClock(day.startBreak)}</td>
    <td data-label={columns[3]} className="cell--clock">{formatClock(day.endBreak)}</td>
    <td data-label={columns[4]} className="cell--clock">{formatClock(day.endWork)}</td>
    <td data-label={columns[5]} className="cell--num">{formatAmount(day.dailyPay)}</td>
    <td data-label={columns[6]} className={`cell--num${day.penalty ? ' cell--penalty' : ''}`} title={penaltyTitle(day)}>
      {formatAmount(day.penalty)}
    </td>
    <td data-label={columns[7]} className="cell--num cell--total">{formatAmount(day.total)}</td>
    <td data-label={columns[8]} className={`cell--num${day.incentive ? ' cell--bonus' : ''}`}>{formatAmount(day.incentive)}</td>
  </tr>
);

const WorkerSheet = ({ worker, totalLabel }: { worker: WorkerAttendance; totalLabel: string }) => (
  <section className="worker" aria-label={worker.fullname}>
    <header className="worker__head">
      <h3 className="worker__name">{worker.fullname}</h3>
      <span className="worker__meta">
        {worker.days.length} hari · gaji harian {formatAmount(worker.dailyPay)}
      </span>
    </header>
    <div className="sheet-wrap">
      <table className="sheet">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column} scope="col">{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {worker.days.map((day) => (
            <DayRow key={day.logId} day={day} />
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row" colSpan={7} className="foot__label">{totalLabel}</th>
            <td data-label={columns[7]} className="cell--num cell--total">{formatAmount(worker.totalPay)}</td>
            <td data-label={columns[8]} className="cell--num cell--bonus">{formatAmount(worker.totalIncentive)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  </section>
);

export const AttendanceTable = ({ data, totalLabel }: AttendanceTableProps) => {
  if (data.workers.length === 0) {
    return (
      <div className="empty" role="status">
        <strong>Belum ada absensi</strong>
        <span>Tidak ada scan di proyek {data.project.projectName} pada rentang tanggal ini.</span>
      </div>
    );
  }
  return (
    <div className="workers">
      {data.workers.map((worker) => (
        <WorkerSheet key={worker.workerId} worker={worker} totalLabel={totalLabel} />
      ))}
    </div>
  );
};
