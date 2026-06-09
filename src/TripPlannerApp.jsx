import { useChat } from './hooks/useChat';
import ChatWindow from './components/ChatWindow';
import TripSummaryPanel from './components/TripSummaryPanel';
import StageIndicator, { getStageLabel } from './components/StageIndicator';
import { Plane } from 'lucide-react';

/**
 * Trip planner application shell — collection wizard, then full-width trip plan.
 */
export default function TripPlannerApp() {
  const {
    tripData,
    stage,
    isLoading,
    chips,
    error,
    collectionError,
    sendMessage,
    handleChipSelect,
    handleDateSelect,
    handleTravelStyleConfirm,
    handleBack,
    resetChat,
    stopStreaming,
    retryLastMessage,
    toggleChecklistItem,
    checklistState,
    isCollecting,
    isStreamingPlan,
    collectionStage,
    currentStep,
    collectionDraft,
    toggleTravelStyle,
    updateTravelStyleText,
    setGroupSize,
    confirmGroupSize,
    collectionTripData,
    messages,
  } = useChat();

  const showPlanView = !isCollecting;

  return (
    <div className="mesh-bg min-h-screen flex flex-col transition-colors duration-300">
      <header className="sticky top-0 z-30 bg-navy/90 backdrop-blur-md border-b border-amber/15">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
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
                {isCollecting ? `Step ${collectionStage} of 10` : getStageLabel(stage)}
              </p>
            </div>
          </div>

          <StageIndicator currentStage={collectionStage} isCollecting={isCollecting} />

          <div className="flex items-center gap-2">
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

      <main className="flex-1 max-w-4xl mx-auto w-full flex overflow-hidden">
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
          <section className="w-full flex flex-col h-[calc(100vh-57px)]" aria-label="Trip setup">
            <ChatWindow
              messages={messages}
              isLoading={isLoading}
              chips={chips}
              error={error}
              collectionError={collectionError}
              onSend={sendMessage}
              onChipSelect={handleChipSelect}
              onDateSelect={handleDateSelect}
              onTravelStyleConfirm={handleTravelStyleConfirm}
              onBack={handleBack}
              onRetry={retryLastMessage}
              onReset={resetChat}
              onToggleTravelStyle={toggleTravelStyle}
              onUpdateTravelStyleText={updateTravelStyleText}
              onSetGroupSize={setGroupSize}
              onConfirmGroupSize={confirmGroupSize}
              isCollecting={isCollecting}
              collectionStage={collectionStage}
              currentStep={currentStep}
              collectionDraft={collectionDraft}
              collectionTripData={collectionTripData}
            />
          </section>
        )}
      </main>
    </div>
  );
}
