import { useMemo, useState } from 'react';
import { registerLocale } from 'react-datepicker';
import indonesian from 'date-fns/locale/id';
import 'react-datepicker/dist/react-datepicker.css';
import './App.css';
import { AttendanceTable } from './components/AttendanceTable';
import { ExportDialog } from './components/ExportDialog';
import { AlertIcon, DownloadIcon, GearIcon } from './components/icons';
import { ProjectTabs } from './components/ProjectTabs';
import { RangeToolbar } from './components/RangeToolbar';
import { SettingsModal } from './components/SettingsModal';
import { useAttendance } from './hooks/useAttendance';
import { useProjectTabs } from './hooks/useProjectTabs';
import { DateRange, isWholeWeek, rangePresets } from './utils/dateRanges';

registerLocale('id', indonesian);

export default function App() {
  const today = useMemo(() => new Date(), []);
  const [range, setRange] = useState<DateRange>(() => rangePresets[0].resolve(today));
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const tabs = useProjectTabs();
  const attendance = useAttendance(tabs.activeId, range);
  const totalLabel = isWholeWeek(range) ? 'Total mingguan' : 'Total periode';

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar__group">
          <button type="button" className="icon-btn" aria-label="Pengaturan gaji" title="Pengaturan gaji" onClick={() => setSettingsOpen(true)}>
            <GearIcon />
          </button>
          <div className="brand">
            <span className="brand__dot" />
            Absensi
          </div>
        </div>
        <div className="topbar__group">
          <button type="button" className="btn btn-ghost btn-compact" onClick={() => setExportOpen(true)}>
            <DownloadIcon />
            <span>Unduh Excel</span>
          </button>
        </div>
      </header>

      <main className="dash">
        <div className="dash__head">
          <h1 className="dash__title">Dashboard absensi</h1>
          <p className="dash__lead">Absensi dan gaji tukang per proyek. Minggu kerja Senin sampai Minggu, zona waktu mengikuti proyek.</p>
        </div>

        <RangeToolbar range={range} today={today} disabled={attendance.loading} onChange={setRange} />

        <ProjectTabs
          projects={tabs.projects}
          activeId={tabs.activeId}
          page={tabs.page}
          hasPrev={tabs.hasPrev}
          hasMore={tabs.hasMore}
          loading={tabs.loading}
          onSelect={tabs.select}
          onPrev={tabs.prev}
          onNext={tabs.next}
        />

        <section className="panel" aria-live="polite" aria-busy={tabs.loading || attendance.loading}>
          {tabs.error && (
            <div className="alert" role="alert">
              <AlertIcon />
              <span>{tabs.error}</span>
              <button type="button" className="link" onClick={tabs.retry}>Coba lagi</button>
            </div>
          )}
          {attendance.error && (
            <div className="alert" role="alert">
              <AlertIcon />
              <span>{attendance.error}</span>
              <button type="button" className="link" onClick={attendance.reload}>Coba lagi</button>
            </div>
          )}
          {(tabs.loading || attendance.loading) && <p className="muted loading">Memuat…</p>}
          {!tabs.loading && !tabs.error && tabs.projects.length === 0 && (
            <div className="empty" role="status">
              <strong>Belum ada proyek</strong>
              <span>Proyek muncul di sini setelah ditambahkan ke database.</span>
            </div>
          )}
          {attendance.data && !attendance.loading && <AttendanceTable data={attendance.data} totalLabel={totalLabel} />}
        </section>
      </main>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} onSaved={attendance.reload} />
      <ExportDialog open={exportOpen} today={today} initialRange={range} onClose={() => setExportOpen(false)} />
    </div>
  );
}
