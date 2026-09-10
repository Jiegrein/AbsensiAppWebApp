import DatePicker from 'react-datepicker';
import {
  DateRange,
  formatRange,
  isValidRange,
  matchesPreset,
  rangeLengthInDays,
  rangePresets,
} from '../utils/dateRanges';
import { CalendarIcon } from './icons';

interface DateRangeFormProps {
  range: DateRange;
  today: Date;
  disabled?: boolean;
  onChange: (range: DateRange) => void;
}

interface DateFieldProps {
  id: string;
  label: string;
  value: Date;
  disabled?: boolean;
  onChange: (date: Date) => void;
}

const DateField = ({ id, label, value, disabled, onChange }: DateFieldProps) => (
  <div className="field">
    <label htmlFor={id}>{label}</label>
    <div className="field__control">
      <CalendarIcon className="field__icon" />
      <DatePicker
        id={id}
        className="field__input"
        selected={value}
        onChange={(date: Date | null) => date && onChange(date)}
        locale="id"
        dateFormat="d MMMM yyyy"
        disabled={disabled}
        popperPlacement="bottom-start"
      />
    </div>
  </div>
);

export const DateRangeForm = ({ range, today, disabled, onChange }: DateRangeFormProps) => {
  const valid = isValidRange(range);

  return (
    <div className="range">
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

      <div className="fields">
        <DateField
          id="start-date"
          label="Tanggal mulai"
          value={range.start}
          disabled={disabled}
          onChange={(start) => onChange({ ...range, start })}
        />
        <DateField
          id="end-date"
          label="Tanggal berakhir"
          value={range.end}
          disabled={disabled}
          onChange={(end) => onChange({ ...range, end })}
        />
      </div>

      <div className={`summary${valid ? '' : ' summary--invalid'}`} role="status">
        {valid ? (
          <>
            <span>{formatRange(range)}</span>
            <strong>{rangeLengthInDays(range)} hari</strong>
          </>
        ) : (
          <span>Tanggal berakhir harus sama atau setelah tanggal mulai.</span>
        )}
      </div>
    </div>
  );
};
