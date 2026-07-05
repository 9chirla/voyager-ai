import { Check, ChevronDown } from 'lucide-react';

/**
 * Collapsible section card for the trip collection wizard.
 */
export default function CollectionSectionCard({
  sectionId,
  title,
  summary,
  isComplete,
  isExpanded,
  onToggle,
  hasError = false,
  children,
}) {
  return (
    <section
      id={`collection-section-${sectionId}`}
      data-testid={`collection-section-${sectionId}`}
      className={`rounded-xl border transition-colors duration-200 ${
        hasError
          ? 'border-red-400/40 bg-red-950/20'
          : isExpanded
            ? 'border-amber/35 bg-navy-glass'
            : 'border-white/10 bg-navy/40'
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        className="w-full flex items-center gap-3 px-4 py-3 text-left
                   hover:bg-white/5 transition-colors rounded-xl
                   focus:outline-none focus:ring-2 focus:ring-amber/30"
      >
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
            isComplete
              ? 'bg-teal/20 text-teal border border-teal/40'
              : 'bg-white/5 text-cream/40 border border-white/10'
          }`}
          aria-hidden="true"
        >
          {isComplete ? <Check className="w-3.5 h-3.5" /> : sectionId}
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-sm font-semibold text-cream">{title}</span>
          {!isExpanded && summary && (
            <span className="block text-xs text-cream/50 truncate mt-0.5">{summary}</span>
          )}
        </span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 text-cream/40 transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>
      {isExpanded && (
        <div className="px-4 pb-4 pt-1 border-t border-white/5 space-y-4">
          {children}
        </div>
      )}
    </section>
  );
}
