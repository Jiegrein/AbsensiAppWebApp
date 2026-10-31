import {
  DateRange,
  formatRange,
  isValidRange,
  matchesPreset,
  rangeLengthInDays,
  rangePresets,
} from '../utils/dateRanges';
import { DateField } from './DateRangeForm';

interface RangeToolbarProps {
  range: DateRange;
  today: Date;
  disabled?: boolean;
  onChange: (range: DateRange) => void;
}

/** Week presets plus explicit from/to dates; the running Monday-to-Sunday week is the default. */
export const RangeToolbar = ({ range, today, disabled, onChange }: RangeToolbarProps) => {
  const valid = isValidRange(range);
  return (
    <div className="toolbar">
      <div className="presets" role="group" aria-label="Rentang cepat">
        {rangePresets.map((preset) => (
          <button
            key={preset.key}
            type="button"
            className="chip"
            disabled={disabled}
            aria-pressed={matchesPreset(range, preset, today)}
            onClick={() => onChange(preset.resolve(today))}
          >
            {preset.label}
          </button>
        ))}
      </div>
      <div className="toolbar__dates">
        <DateField id="dash-start" label="Dari" value={range.start} disabled={disabled} onChange={(start) => onChange({ ...range, start })} />
        <DateField id="dash-end" label="Sampai" value={range.end} disabled={disabled} onChange={(end) => onChange({ ...range, end })} />
      </div>
      <div className={`toolbar__summary${valid ? '' : ' toolbar__summary--invalid'}`} role="status">
        {valid ? (
          <>
            <span>{formatRange(range)}</span>
            <strong>{rangeLengthInDays(range)} hari</strong>
          </>
        ) : (
          <span>Tanggal akhir harus sama atau setelah tanggal awal.</span>
        )}
      </div>
    </div>
  );
};
