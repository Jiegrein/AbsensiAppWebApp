import { useMemo, useState } from 'react';
import { registerLocale } from 'react-datepicker';
import indonesian from 'date-fns/locale/id';
import 'react-datepicker/dist/react-datepicker.css';
import './App.css';
import { DateRangeForm } from './components/DateRangeForm';
import { DownloadPanel } from './components/DownloadPanel';
import { useReportDownload } from './hooks/useReportDownload';
import { DateRange, isValidRange, rangePresets } from './utils/dateRanges';

registerLocale('id', indonesian);

export default function App() {
  const today = useMemo(() => new Date(), []);
  const [range, setRange] = useState<DateRange>(() => rangePresets[0].resolve(today));
  const { status, progress, error, download } = useReportDownload();

  const downloading = status === 'downloading';

  return (
    <main className="page">
      <section className="card" aria-labelledby="page-title">
        <header className="card__head">
          <div className="brand">
            <span className="brand__dot" />
            Absensi
          </div>
          <h1 id="page-title" className="card__title">Laporan gaji</h1>
          <p className="card__lead">
            Pilih rentang tanggal, lalu unduh rekap absensi dan gaji tukang dalam bentuk Excel.
          </p>
        </header>

        <DateRangeForm range={range} today={today} disabled={downloading} onChange={setRange} />

        <DownloadPanel
          status={status}
          progress={progress}
          error={error}
          disabled={!isValidRange(range)}
          onDownload={() => download(range)}
        />

        <footer className="card__foot">
          <span>Minggu kerja dihitung Senin sampai Minggu.</span>
          <span>Zona waktu mengikuti proyek.</span>
        </footer>
      </section>
    </main>
  );
}
