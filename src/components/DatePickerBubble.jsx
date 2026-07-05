import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

/**
 * @param {Date} date
 * @returns {string}
 */
function toIsoDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * @param {string} iso
 * @returns {Date}
 */
function parseIso(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Inline calendar date picker for collection stages.
 * @param {{
 *   onSelect: (isoDate: string) => void,
 *   minDate?: string,
 *   selectedDate?: string|null,
 *   label?: string,
 *   viewAnchorDate?: string|null,
 *   active?: boolean,
 *   id?: string,
 * }} props
 */
export default function DatePickerBubble({
  onSelect,
  minDate,
  selectedDate = null,
  label,
  viewAnchorDate = null,
  active = false,
  id,
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const min = minDate ? parseIso(minDate) : today;

  const [viewDate, setViewDate] = useState(() => {
    if (selectedDate) return parseIso(selectedDate);
    if (viewAnchorDate) return parseIso(viewAnchorDate);
    return min > today ? min : today;
  });

  useEffect(() => {
    if (selectedDate) {
      setViewDate(parseIso(selectedDate));
    } else if (viewAnchorDate) {
      setViewDate(parseIso(viewAnchorDate));
    }
  }, [selectedDate, viewAnchorDate]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthLabel = viewDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  /** @type {Array<{ day: number|null, date: Date|null }>} */
  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push({ day: null, date: null });
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, date: new Date(year, month, d) });
  }

  function isDisabled(date) {
    return date < min;
  }

  function isToday(date) {
    return toIsoDate(date) === toIsoDate(today);
  }

  function isSelected(date) {
    return selectedDate && toIsoDate(date) === selectedDate;
  }

  function prevMonth() {
    setViewDate(new Date(year, month - 1, 1));
  }

  function nextMonth() {
    setViewDate(new Date(year, month + 1, 1));
  }

  return (
    <div
      id={id}
      className={`rounded-xl bg-navy-glass border p-4 max-w-xs transition-all duration-300 ${
        active ? 'border-amber/50 ring-2 ring-amber/25 shadow-lg shadow-amber/5' : 'border-white/10'
      }`}
    >
      {label && <p className="text-xs text-cream/50 mb-3">{label}</p>}

      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={prevMonth}
          aria-label="Previous month"
          className="p-1.5 rounded-lg hover:bg-white/10 text-cream/70 transition-colors focus:outline-none focus:ring-2 focus:ring-amber/30"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-medium text-cream">{monthLabel}</span>
        <button
          type="button"
          onClick={nextMonth}
          aria-label="Next month"
          className="p-1.5 rounded-lg hover:bg-white/10 text-cream/70 transition-colors focus:outline-none focus:ring-2 focus:ring-amber/30"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map((wd) => (
          <div key={wd} className="text-center text-[10px] font-medium text-cream/40 py-1">
            {wd}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, i) => {
          if (!cell.date) {
            return <div key={`empty-${i}`} />;
          }

          const disabled = isDisabled(cell.date);
          const selected = isSelected(cell.date);
          const todayMark = isToday(cell.date);

          return (
            <button
              key={cell.day}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(toIsoDate(cell.date))}
              aria-label={cell.date.toLocaleDateString('en-GB')}
              className={`aspect-square flex items-center justify-center text-xs rounded-lg transition-colors
                focus:outline-none focus:ring-2 focus:ring-amber/40
                ${disabled ? 'text-cream/20 cursor-not-allowed' : 'text-cream hover:bg-amber/20 cursor-pointer'}
                ${selected ? 'bg-amber text-navy font-semibold hover:bg-amber' : ''}
                ${todayMark && !selected ? 'ring-1 ring-amber/50' : ''}`}
            >
              {cell.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { toIsoDate, parseIso };
