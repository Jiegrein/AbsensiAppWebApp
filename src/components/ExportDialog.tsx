import { useEffect, useState } from 'react';
import { useReportDownload } from '../hooks/useReportDownload';
import { DateRange, isValidRange } from '../utils/dateRanges';
import { DateRangeForm } from './DateRangeForm';
import { DownloadPanel } from './DownloadPanel';
import { Modal } from './Modal';

interface ExportDialogProps {
  open: boolean;
  today: Date;
  initialRange: DateRange;
  onClose: () => void;
}

/** The original Excel download, now behind a button; it opens on the range the dashboard shows. */
export const ExportDialog = ({ open, today, initialRange, onClose }: ExportDialogProps) => {
  const [range, setRange] = useState<DateRange>(initialRange);
  const { status, progress, error, download } = useReportDownload();
  const downloading = status === 'downloading';

  useEffect(() => {
    if (open) setRange(initialRange);
  }, [open, initialRange]);

  return (
    <Modal open={open} title="Unduh laporan Excel" onClose={onClose}>
      <p className="muted">Pilih rentang tanggal, lalu unduh rekap absensi dan gaji dalam bentuk Excel.</p>
      <DateRangeForm range={range} today={today} disabled={downloading} onChange={setRange} />
      <DownloadPanel
        status={status}
        progress={progress}
        error={error}
        disabled={!isValidRange(range)}
        onDownload={() => download(range)}
      />
    </Modal>
  );
};
