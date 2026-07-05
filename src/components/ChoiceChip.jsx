import { Check } from 'lucide-react';

/**
 * Selectable chip for collection cards.
 */
export default function ChoiceChip({
  label,
  active = false,
  onClick,
  multi = false,
  disabled = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border transition-colors
        disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-amber/40
        ${active
          ? 'bg-amber/30 text-amber-light border-amber/60'
          : 'border-amber/30 bg-amber/10 text-amber-light hover:bg-amber/20'}`}
    >
      {multi && active && <Check className="w-3 h-3" />}
      {label}
    </button>
  );
}

/**
 * @param {{ label: string, active: boolean, onClick: () => void }} props
 */
export function ChoiceChipRow({ label, active, onClick }) {
  return <ChoiceChip label={label} active={active} onClick={onClick} />;
}
