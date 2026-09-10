import { DownloadStatus } from '../hooks/useReportDownload';
import { AlertIcon, CheckIcon, DownloadIcon } from './icons';

interface DownloadPanelProps {
  status: DownloadStatus;
  progress: number;
  error: string | null;
  disabled: boolean;
  onDownload: () => void;
}

const buttonLabel: Record<DownloadStatus, string> = {
  idle: 'Download laporan gaji',
  downloading: 'Menyiapkan laporan…',
  done: 'Laporan terunduh',
  error: 'Coba lagi',
};

export const DownloadPanel = ({ status, progress, error, disabled, onDownload }: DownloadPanelProps) => {
  const busy = status === 'downloading';
  const Icon = status === 'done' ? CheckIcon : DownloadIcon;

  return (
    <div className="download">
      <button
        type="button"
        className={`btn btn-primary${status === 'done' ? ' btn-done' : ''}`}
        disabled={disabled || busy}
        aria-busy={busy}
        onClick={onDownload}
      >
        <Icon />
        <span>{buttonLabel[status]}</span>
      </button>

      {(busy || status === 'done') && (
        <div className="progress-block">
          <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
            <div className="progress__bar" style={{ width: `${progress}%` }} />
          </div>
          <div className="status">
            <span>{busy ? 'Mengunduh dari server' : 'Selesai'}</span>
            <span>{progress}%</span>
          </div>
        </div>
      )}

      {status === 'error' && error && (
        <div className="alert" role="alert">
          <AlertIcon />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
