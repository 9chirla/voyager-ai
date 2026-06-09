import { Minus, Plus } from 'lucide-react';

/**
 * Simple +/- stepper for group size collection.
 * @param {{ value: number, onChange: (n: number) => void, min?: number, max?: number, label?: string }} props
 */
export default function StepperInput({ value, onChange, min = 2, max = 20, label }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-navy-glass border border-white/10 px-4 py-3 max-w-xs">
      {label && <span className="text-sm text-cream/80 flex-1">{label}</span>}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label="Decrease"
          className="w-9 h-9 rounded-lg border border-amber/30 bg-amber/10 text-amber flex items-center justify-center
                     hover:bg-amber/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors
                     focus:outline-none focus:ring-2 focus:ring-amber/40"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="text-lg font-semibold text-cream w-8 text-center tabular-nums">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          aria-label="Increase"
          className="w-9 h-9 rounded-lg border border-amber/30 bg-amber/10 text-amber flex items-center justify-center
                     hover:bg-amber/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors
                     focus:outline-none focus:ring-2 focus:ring-amber/40"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
