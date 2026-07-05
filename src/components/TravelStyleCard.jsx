import { Check } from 'lucide-react';

/**
 * Stage 10 travel-style card with pace, first visit, interests, and optional text.
 * @param {{
 *   draft: object,
 *   onToggleChip: (section: string, chip: string) => void,
 *   onUpdateText: (field: string, value: string) => void,
 *   onConfirm: () => void,
 *   disabled?: boolean,
 *   error?: string|null,
 *   hideSubmit?: boolean,
 * }} props
 */
export default function TravelStyleCard({
  draft,
  onToggleChip,
  onUpdateText,
  onConfirm,
  disabled = false,
  error = null,
  hideSubmit = false,
}) {
  const paceChips = [
    'Packed — I want to see everything',
    'Moderate — busy but with breathing room',
    'Relaxed — slow mornings, don\'t rush me',
  ];
  const visitChips = ['First time', 'Been before'];
  const interestChips = [
    'Culture & history',
    'Food & local cuisine',
    'Nature & hiking',
    'Beaches & water',
    'Nightlife',
    'Art & architecture',
    'Markets & shopping',
    'Adventure sports',
    'Wellness & spas',
    'Off the beaten path',
    'Kid-friendly activities',
    'Photography spots',
    'Budget-conscious',
  ];

  const canConfirm = draft.pace && draft.selectedInterests?.length > 0;

  function ChipButton({ chip, active, onClick, multi = false }) {
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
        {chip}
      </button>
    );
  }

  return (
    <div className="rounded-xl bg-navy-glass border border-white/10 p-4 space-y-4 max-w-lg">
      <div>
        <p className="text-xs font-medium text-cream/50 mb-2">Your pace:</p>
        <div className="flex flex-wrap gap-2">
          {paceChips.map((chip) => (
            <ChipButton
              key={chip}
              chip={chip}
              active={draft.paceLabel === chip}
              onClick={() => onToggleChip('pace', chip)}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-cream/50 mb-2">Have you been before?</p>
        <div className="flex flex-wrap gap-2">
          {visitChips.map((chip) => (
            <ChipButton
              key={chip}
              chip={chip}
              active={draft.firstVisitLabel === chip}
              onClick={() => onToggleChip('firstVisit', chip)}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-cream/50 mb-2">What do you love? Pick as many as you want:</p>
        <div className="flex flex-wrap gap-2">
          {interestChips.map((chip) => (
            <ChipButton
              key={chip}
              chip={chip}
              active={draft.selectedInterests?.includes(chip)}
              onClick={() => onToggleChip('interests', chip)}
              multi
            />
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-cream/50 mb-2">
          Anything specific you must see or want to avoid? (optional)
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={draft.mustSee ?? ''}
            onChange={(e) => onUpdateText('mustSee', e.target.value)}
            placeholder="Must see or do..."
            disabled={disabled}
            className="flex-1 rounded-lg bg-navy border border-white/10 px-3 py-2 text-xs text-cream
                       placeholder:text-cream/30 focus:outline-none focus:ring-2 focus:ring-amber/30"
          />
          <input
            type="text"
            value={draft.hardAvoid ?? ''}
            onChange={(e) => onUpdateText('hardAvoid', e.target.value)}
            placeholder="Hard avoid..."
            disabled={disabled}
            className="flex-1 rounded-lg bg-navy border border-white/10 px-3 py-2 text-xs text-cream
                       placeholder:text-cream/30 focus:outline-none focus:ring-2 focus:ring-amber/30"
          />
        </div>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      {!hideSubmit && (
      <button
        type="button"
        onClick={onConfirm}
        disabled={disabled || !canConfirm}
        className="w-full px-4 py-2.5 rounded-xl bg-amber text-navy text-sm font-semibold
                   hover:bg-amber-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors
                   focus:outline-none focus:ring-2 focus:ring-amber/50"
      >
        Build my trip →
      </button>
      )}
    </div>
  );
}
