import { FormEvent, useEffect, useState } from 'react';
import DashboardService, { PayrollSettings } from '../services/DashboardService';
import { describeRequestError } from '../services/requestError';
import { AlertIcon, CheckIcon } from './icons';
import { Modal } from './Modal';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  /** Called after a successful save so the attendance numbers can be recomputed. */
  onSaved: () => void;
}

type NumberKey = 'graceMinutes' | 'workMinutesPerDay' | 'incentiveAmount';
type TimeKey = 'workStart' | 'breakStart' | 'breakEnd' | 'workEnd';

const timeFields: { key: TimeKey; label: string }[] = [
  { key: 'workStart', label: 'Jam masuk' },
  { key: 'breakStart', label: 'Mulai istirahat' },
  { key: 'breakEnd', label: 'Selesai istirahat' },
  { key: 'workEnd', label: 'Jam pulang' },
];

const numberFields: { key: NumberKey; label: string; hint: string; min: number; max?: number }[] = [
  { key: 'graceMinutes', label: 'Toleransi (menit)', hint: 'Keterlambatan sampai sekian menit tidak dipotong.', min: 0, max: 180 },
  { key: 'workMinutesPerDay', label: 'Menit kerja per hari', hint: 'Pembagi potongan: gaji harian ÷ menit ini = potongan per menit.', min: 1, max: 1440 },
  { key: 'incentiveAmount', label: 'Insentif (Rp)', hint: 'Diberikan jika masuk tepat waktu dan pulang tidak lebih awal.', min: 0 },
];

/** Admin form for the payroll rules; every number on the dashboard is derived from these. */
export const SettingsModal = ({ open, onClose, onSaved }: SettingsModalProps) => {
  const [form, setForm] = useState<PayrollSettings | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    let cancelled = false;
    setForm(null);
    setLoadError(null);
    setSaveError(null);
    setSaved(false);
    DashboardService.getSettings()
      .then((settings) => !cancelled && setForm(settings))
      .catch((caught) => !cancelled && setLoadError(describeRequestError(caught, 'Gagal memuat pengaturan.')));
    return () => {
      cancelled = true;
    };
  }, [open]);

  const update = <K extends keyof PayrollSettings>(key: K, value: PayrollSettings[K]) => {
    setSaved(false);
    setForm((current) => (current ? { ...current, [key]: value } : current));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form) return;
    setSaving(true);
    setSaveError(null);
    try {
      const stored = await DashboardService.updateSettings(form);
      setForm(stored);
      setSaved(true);
      onSaved();
    } catch (caught) {
      setSaveError(describeRequestError(caught, 'Gagal menyimpan pengaturan.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} title="Pengaturan gaji" onClose={onClose}>
      {loadError && (
        <div className="alert" role="alert">
          <AlertIcon />
          <span>{loadError}</span>
        </div>
      )}
      {!form && !loadError && <p className="muted">Memuat pengaturan…</p>}
      {form && (
        <form className="settings" onSubmit={submit}>
          <fieldset className="settings__group" disabled={saving}>
            <legend>Jam kerja</legend>
            <div className="settings__grid">
              {timeFields.map(({ key, label }) => (
                <div className="field" key={key}>
                  <label htmlFor={`setting-${key}`}>{label}</label>
                  <input
                    id={`setting-${key}`}
                    className="field__input field__input--plain"
                    type="time"
                    required
                    value={form[key]}
                    onChange={(event) => update(key, event.target.value)}
                  />
                </div>
              ))}
            </div>
          </fieldset>

          <fieldset className="settings__group" disabled={saving}>
            <legend>Potongan dan insentif</legend>
            <div className="settings__grid">
              {numberFields.map(({ key, label, hint, min, max }) => (
                <div className="field" key={key}>
                  <label htmlFor={`setting-${key}`}>{label}</label>
                  <input
                    id={`setting-${key}`}
                    className="field__input field__input--plain"
                    type="number"
                    inputMode="numeric"
                    required
                    min={min}
                    max={max}
                    step={1}
                    value={form[key]}
                    onChange={(event) => update(key, Number(event.target.value))}
                  />
                  <small className="field__hint">{hint}</small>
                </div>
              ))}
            </div>
          </fieldset>

          <p className="formula">
            Penalti = (menit telat masuk + menit telat kembali istirahat + menit pulang cepat) × gaji harian ÷ menit kerja per hari.
            Menit di dalam toleransi tidak dihitung; scan yang tidak ada tidak dipotong.
          </p>

          {saveError && (
            <div className="alert" role="alert">
              <AlertIcon />
              <span>{saveError}</span>
            </div>
          )}

          <div className="settings__actions">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>
              Tutup
            </button>
            <button type="submit" className={`btn btn-primary${saved ? ' btn-done' : ''}`} disabled={saving} aria-busy={saving}>
              {saved && <CheckIcon />}
              <span>{saving ? 'Menyimpan…' : saved ? 'Tersimpan' : 'Simpan'}</span>
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
