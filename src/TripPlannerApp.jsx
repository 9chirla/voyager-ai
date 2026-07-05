import { useEffect, useRef, useState } from 'react';
import { useChat } from './hooks/useChat';
import TripCollectionWizard from './components/TripCollectionWizard';
import TripSummaryPanel from './components/TripSummaryPanel';
import StageIndicator, { getStageLabel } from './components/StageIndicator';
import SeasonalCard from './components/SeasonalCard';
import { FACT_CONTEXT_KEY, parseStoredContext } from './utils/plannerContext';
import { FACT_DESTINATION_KEY } from './utils/sendToPlanner';
import { Plane } from 'lucide-react';

/**
 * Trip planner application shell — card-based collection wizard, then trip plan view.
 */
export default function TripPlannerApp() {
  const {
    tripData,
    stage,
    isLoading,
    error,
    collectionError,
    applyInspiration,
    resetChat,
    stopStreaming,
    retryLastMessage,
    toggleChecklistItem,
    checklistState,
    isCollecting,
    isStreamingPlan,
    collectionDraft,
    toggleTravelStyle,
    updateTravelStyleText,
    collectionTripData,
    sectionSummaries,
    patchTripData,
    toggleDietaryChip,
    submitCollectionCards,
    cardValidationErrors,
  } = useChat();

  const showPlanView = !isCollecting;
  const isWizardActive = isCollecting;
  const [prefillDestination, setPrefillDestination] = useState(null);
  const [activeSection, setActiveSection] = useState(1);
  const prefillHandled = useRef(false);

  useEffect(() => {
    if (prefillHandled.current) return;
    const storedDestination = sessionStorage.getItem(FACT_DESTINATION_KEY);
    if (!storedDestination || !isCollecting) return;

    prefillHandled.current = true;
    const storedContext = sessionStorage.getItem(FACT_CONTEXT_KEY);
    sessionStorage.removeItem(FACT_DESTINATION_KEY);
    sessionStorage.removeItem(FACT_CONTEXT_KEY);

    const context = parseStoredContext(storedContext, storedDestination);
    applyInspiration(context);
    setPrefillDestination(context.destination);
    setActiveSection(1);
  }, [isCollecting, applyInspiration]);

  const handleSectionFocus = (sectionId) => {
    setActiveSection(sectionId);
  };

  const handleSectionClick = (sectionId) => {
    setActiveSection(sectionId);
    document.getElementById(`collection-section-${sectionId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="mesh-bg min-h-screen flex flex-col transition-colors duration-300">
      <header className="sticky top-0 z-30 bg-navy/90 backdrop-blur-md border-b border-amber/15">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <div
              className="w-9 h-9 rounded-full bg-amber/15 border border-amber/30 flex items-center justify-center"
              aria-hidden="true"
            >
              <Plane className="w-4 h-4 text-amber" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-cream leading-tight">
                Voyager AI
              </h1>
              <p className="text-xs text-amber/70 sm:hidden">
                {isCollecting ? getStageLabel(activeSection) : getStageLabel(stage)}
              </p>
            </div>
          </div>

          <StageIndicator
            activeSection={activeSection}
            sectionSummaries={sectionSummaries}
            isCollecting={isCollecting}
            onSectionClick={handleSectionClick}
          />

          <div className="flex items-center gap-2 shrink-0">
            {isLoading && (
              <button
                type="button"
                onClick={stopStreaming}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-red-400/40
                           text-red-300 hover:bg-red-500/10 transition-colors
                           focus:outline-none focus:ring-2 focus:ring-red-400/30"
              >
                Stop
              </button>
            )}
            <button
              type="button"
              onClick={resetChat}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-amber/30
                         bg-amber/10 text-amber-light hover:bg-amber/20 transition-colors
                         focus:outline-none focus:ring-2 focus:ring-amber/40"
            >
              New trip
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full flex overflow-hidden px-4 gap-6">
        {showPlanView ? (
          <section className="w-full flex flex-col h-[calc(100vh-57px)]" aria-label="Trip plan">
            <TripSummaryPanel
              tripData={tripData}
              checklistState={checklistState}
              onToggleChecklist={toggleChecklistItem}
              isStreamingPlan={isStreamingPlan}
              error={error}
              onRetry={retryLastMessage}
            />
          </section>
        ) : (
          <>
            <section className="flex-1 min-w-0 flex flex-col h-[calc(100vh-57px)]" aria-label="Trip setup">
              <TripCollectionWizard
                tripData={collectionTripData}
                draft={collectionDraft}
                sectionSummaries={sectionSummaries}
                collectionError={collectionError}
                isLoading={isLoading}
                prefillDestination={prefillDestination}
                onPatchTrip={patchTripData}
                onToggleDietary={toggleDietaryChip}
                onToggleTravelStyle={toggleTravelStyle}
                onUpdateTravelStyleText={updateTravelStyleText}
                onSubmit={submitCollectionCards}
                onSectionFocus={handleSectionFocus}
                focusSectionId={activeSection}
                validationErrors={cardValidationErrors}
              />
            </section>
            <aside
              className="hidden md:flex w-72 shrink-0 py-4 pointer-events-auto"
              aria-label="Seasonal phenomena"
            >
              <SeasonalCard
                variant="sidebar"
                isCollecting={isCollecting}
                dimmed={isWizardActive}
              />
            </aside>
          </>
        )}
      </main>
    </div>
  );
}
