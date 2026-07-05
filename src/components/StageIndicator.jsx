import { COLLECTION_SECTIONS } from '../utils/collectionValidation';

const SECTION_ICONS = {
  1: '📍',
  2: '📅',
  3: '✈️',
  4: '🏨',
  5: '👥',
  6: '💰',
  7: '🥗',
  8: '🗺️',
};

/**
 * Visual progress for card-based collection — sections are clickable to jump & edit.
 * @param {{
 *   activeSection?: number,
 *   sectionSummaries?: Record<number, string|null>,
 *   isCollecting?: boolean,
 *   onSectionClick?: (sectionId: number) => void,
 * }} props
 */
export default function StageIndicator({
  activeSection = 1,
  sectionSummaries = {},
  isCollecting = true,
  onSectionClick,
}) {
  if (!isCollecting) return null;

  return (
    <nav
      data-testid="stage-indicator"
      data-current-stage={activeSection}
      aria-label="Collection sections"
      className="hidden sm:flex items-center gap-0.5 max-w-[52vw] overflow-x-auto"
    >
      <span className="sr-only">Section {activeSection} of {COLLECTION_SECTIONS.length}</span>
      {COLLECTION_SECTIONS.map((section, i) => {
        const isActive = activeSection === section.id;
        const isComplete = Boolean(sectionSummaries[section.id]);

        const content = (
          <>
            <span aria-hidden="true">{isComplete && !isActive ? '✓' : SECTION_ICONS[section.id]}</span>
            <span className="hidden lg:inline font-medium">{section.title}</span>
          </>
        );

        const className = `flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors duration-300 whitespace-nowrap ${
          isActive
            ? 'bg-amber/20 text-amber border border-amber/40'
            : isComplete
              ? 'text-teal/80 hover:bg-teal/10'
              : 'text-cream/30 hover:text-cream/50'
        }`;

        return (
          <div key={section.id} className="flex items-center shrink-0">
            {onSectionClick ? (
              <button
                type="button"
                onClick={() => onSectionClick(section.id)}
                className={`${className} focus:outline-none focus:ring-2 focus:ring-amber/30`}
                aria-current={isActive ? 'step' : undefined}
                title={section.title}
              >
                {content}
              </button>
            ) : (
              <div
                className={className}
                aria-current={isActive ? 'step' : undefined}
                title={section.title}
              >
                {content}
              </div>
            )}
            {i < COLLECTION_SECTIONS.length - 1 && (
              <div
                className={`w-2 h-px mx-0.5 shrink-0 ${isComplete ? 'bg-teal/50' : 'bg-cream/10'}`}
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
 * @param {number} sectionId
 * @returns {string}
 */
export function getStageLabel(sectionId) {
  const section = COLLECTION_SECTIONS.find((s) => s.id === sectionId);
  return section ? `${SECTION_ICONS[section.id]} ${section.title}` : '📍 Destination';
}

export { COLLECTION_SECTIONS as STAGES };
