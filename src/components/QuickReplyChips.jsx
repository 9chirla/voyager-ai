/**
 * Context-sensitive quick reply chips below the chat input.
 * @param {{
 *   chips: string[],
 *   onSelect: (text: string) => void,
 *   disabled: boolean,
 *   selectedChips?: string[],
 *   multiSelect?: boolean,
 *   confirmChip?: string,
 * }} props
 */
export default function QuickReplyChips({
  chips,
  onSelect,
  disabled,
  selectedChips = [],
  multiSelect = false,
  confirmChip = "Let's go →",
}) {
  if (!chips.length) return null;

  return (
    <div
      className="flex flex-wrap gap-2 px-1"
      role="group"
      aria-label="Quick reply options"
    >
      {chips.map((chip) => {
        const isSelected = multiSelect && selectedChips.includes(chip);
        const isConfirm = chip === confirmChip;

        return (
          <button
            key={chip}
            type="button"
            onClick={() => onSelect(chip)}
            disabled={disabled}
            aria-label={`Quick reply: ${chip}`}
            aria-pressed={isSelected || undefined}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors duration-200
                       disabled:opacity-40 disabled:cursor-not-allowed
                       focus:outline-none focus:ring-2 focus:ring-amber/40 ${
                         isConfirm
                           ? 'bg-amber text-navy border-amber hover:bg-amber-light font-semibold'
                           : isSelected
                             ? 'bg-amber/30 text-amber-light border-amber/60 hover:bg-amber/40'
                             : 'border-amber/30 bg-amber/10 text-amber-light hover:bg-amber/20 hover:border-amber/50'
                       }`}
          >
            {chip}
          </button>
        );
      })}
    </div>
  );
}
