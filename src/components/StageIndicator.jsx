const COLLECTION_STAGES = [
  { num: 1, label: 'Destination', icon: '📍' },
  { num: 2, label: 'Dates', icon: '📅' },
  { num: 3, label: 'Dates', icon: '📅' },
  { num: 4, label: 'Dates', icon: '📅' },
  { num: 5, label: 'Flights', icon: '✈️' },
  { num: 6, label: 'Stay', icon: '🏨' },
  { num: 7, label: 'Group', icon: '👥' },
  { num: 8, label: 'Budget', icon: '💰' },
  { num: 9, label: 'Dietary', icon: '🥗' },
  { num: 10, label: 'Style', icon: '🗺️' },
];

/** Unique labels for display (10 steps collapsed to meaningful groups in header). */
const HEADER_STAGES = [
  { num: 1, label: 'Destination', icon: '📍' },
  { num: 2, label: 'Dates', icon: '📅' },
  { num: 5, label: 'Flights', icon: '✈️' },
  { num: 6, label: 'Stay', icon: '🏨' },
  { num: 7, label: 'Group', icon: '👥' },
  { num: 8, label: 'Budget', icon: '💰' },
  { num: 9, label: 'Dietary', icon: '🥗' },
  { num: 10, label: 'Style', icon: '🗺️' },
];

/**
 * Visual progress indicator for the 10-step collection wizard.
 * @param {{ currentStage: number, isCollecting?: boolean }} props
 */
export default function StageIndicator({ currentStage, isCollecting = true }) {
  if (!isCollecting) return null;

  const stage = Math.min(Math.max(currentStage, 1), 10);

  return (
    <nav
      data-testid="stage-indicator"
      data-current-stage={stage}
      aria-label="Collection progress"
      className="hidden sm:flex items-center gap-1"
    >
      <span className="sr-only">Step {stage} of 10</span>
      {HEADER_STAGES.map((s, i) => {
        const isActive = stage === s.num || (s.num === 2 && stage >= 2 && stage <= 4);
        const isComplete = stage > s.num && !(s.num === 2 && stage <= 4);

        return (
          <div key={s.num} className="flex items-center">
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors duration-300 ${
                isActive
                  ? 'bg-amber/20 text-amber border border-amber/40'
                  : isComplete
                    ? 'text-teal/80'
                    : 'text-cream/30'
              }`}
              aria-current={isActive ? 'step' : undefined}
              title={`Step ${s.num}: ${s.label}`}
            >
              <span aria-hidden="true">{isComplete ? '✓' : s.icon}</span>
              <span className="hidden lg:inline font-medium">{s.label}</span>
            </div>
            {i < HEADER_STAGES.length - 1 && (
              <div
                className={`w-3 h-px mx-0.5 ${isComplete ? 'bg-teal/50' : 'bg-cream/10'}`}
                aria-hidden="true"
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}

/**
 * Get the label for the current collection step.
 * @param {number} stage
 * @returns {string}
 */
export function getStageLabel(stage) {
  const found = COLLECTION_STAGES.find((s) => s.num === stage);
  return found ? `${found.icon} ${found.label}` : '📍 Destination';
}

export { COLLECTION_STAGES as STAGES };
