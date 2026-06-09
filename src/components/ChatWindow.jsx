import { useState, useRef, useEffect } from 'react';
import { Send, RotateCcw, AlertCircle, ChevronLeft } from 'lucide-react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import QuickReplyChips from './QuickReplyChips';
import DatePickerBubble from './DatePickerBubble';
import StepperInput from './StepperInput';
import TravelStyleCard from './TravelStyleCard';
import { CONFIRM_DIETARY } from '../hooks/useTripCollection';

/**
 * Main chat interface with message list, input, chips, and error handling.
 */
export default function ChatWindow({
  messages,
  isLoading,
  chips,
  error,
  collectionError,
  onSend,
  onChipSelect,
  onRetry,
  onReset,
  onBack,
  onDateSelect,
  onTravelStyleConfirm,
  onToggleTravelStyle,
  onUpdateTravelStyleText,
  onConfirmGroupSize,
  onSetGroupSize,
  isCollecting = false,
  collectionStage = 1,
  collectionDraft = {},
  currentStep = null,
  collectionTripData = {},
  prefillDestination = null,
  currentStepId = null,
}) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const prefillApplied = useRef(false);

  const inputType = currentStep?.inputType ?? 'text';
  const showTextInput = !isCollecting
    || inputType === 'chips_with_text'
    || inputType === 'multi_chips_with_text';
  const showChips = isCollecting
    && inputType !== 'date_picker'
    && inputType !== 'stepper'
    && inputType !== 'multi_chips_confirm'
    && chips.length > 0;
  const isMultiSelect = inputType === 'multi_chips_with_text';
  const selectedChips = isMultiSelect ? (collectionDraft.dietary ?? []) : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, error, currentStep]);

  useEffect(() => {
    if (!prefillDestination || prefillApplied.current) return;
    if (currentStepId !== 's1_destination') return;

    prefillApplied.current = true;
    setInput(prefillDestination);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [prefillDestination, currentStepId]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSend(input);
    setInput('');
  }

  function handleChipSelect(chip) {
    onChipSelect(chip);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  const showTypingIndicator = isLoading;

  return (
    <div className="flex flex-col h-full">
      {isCollecting && (
        <div className="px-4 pt-3 pb-1 border-b border-white/5 bg-navy-light/30">
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={onBack}
              disabled={collectionStage <= 1 || isLoading}
              aria-label="Go back one step"
              className="flex items-center gap-1 text-xs text-cream/50 hover:text-cream/80
                         disabled:opacity-30 disabled:cursor-not-allowed transition-colors
                         focus:outline-none focus:ring-2 focus:ring-amber/30 rounded px-2 py-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Back
            </button>
            <span className="text-xs text-cream/40">
              Step {Math.min(collectionStage, 10)} of 10
            </span>
          </div>
          <div className="h-1 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-amber transition-all duration-300"
              style={{ width: `${(Math.min(collectionStage, 10) / 10) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div
        className="flex-1 overflow-y-auto px-4 py-6 space-y-5"
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
      >
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} index={i} />
        ))}

        {showTypingIndicator && <TypingIndicator />}

        {error && (
          <div
            className="flex items-center gap-3 p-4 rounded-xl bg-red-900/20 border border-red-500/30 animate-fade-slide-up"
            role="alert"
          >
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-300 flex-1">{error}</p>
            {!error.includes('insufficient balance') && !error.includes('Invalid API key') && (
              <button
                type="button"
                onClick={onRetry}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500/20 text-red-300
                           hover:bg-red-500/30 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400/40"
                aria-label="Retry last message"
              >
                Try again
              </button>
            )}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-white/5 bg-navy-light/50 backdrop-blur-sm p-4 space-y-3">
        {isCollecting && inputType === 'date_picker' && (
          <DatePickerBubble
            label={currentStep?.question}
            onSelect={onDateSelect}
            minDate={
              collectionStage === 3 && collectionTripData.departureDate
                ? (() => {
                    const d = new Date(collectionTripData.departureDate);
                    d.setDate(d.getDate() + 1);
                    return d.toISOString().slice(0, 10);
                  })()
                : undefined
            }
          />
        )}

        {isCollecting && inputType === 'stepper' && (
          <div className="space-y-2">
            <StepperInput
              label={currentStep?.question}
              value={collectionDraft.groupSize ?? currentStep?.default ?? 4}
              min={currentStep?.min ?? 2}
              max={currentStep?.max ?? 20}
              onChange={onSetGroupSize}
            />
            <button
              type="button"
              onClick={onConfirmGroupSize}
              disabled={isLoading}
              className="w-full max-w-xs px-4 py-2 rounded-xl bg-amber text-navy text-sm font-semibold
                         hover:bg-amber-light disabled:opacity-40 transition-colors
                         focus:outline-none focus:ring-2 focus:ring-amber/50"
            >
              Continue →
            </button>
          </div>
        )}

        {isCollecting && inputType === 'multi_chips_confirm' && (
          <TravelStyleCard
            draft={collectionDraft}
            onToggleChip={onToggleTravelStyle}
            onUpdateText={onUpdateTravelStyleText}
            onConfirm={onTravelStyleConfirm}
            disabled={isLoading}
            error={collectionError}
          />
        )}

        {showChips && (
          <QuickReplyChips
            chips={chips}
            onSelect={handleChipSelect}
            disabled={isLoading}
            multiSelect={isMultiSelect}
            selectedChips={selectedChips}
            confirmChip={CONFIRM_DIETARY}
          />
        )}

        {showTextInput && (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <label htmlFor="chat-input" className="sr-only">
              Type your message
            </label>
            <textarea
              id="chat-input"
              data-testid="chat-input"
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isCollecting ? 'Or type your answer here…' : 'Tell Voyager about your dream trip…'
              }
              rows={1}
              disabled={isLoading}
              aria-label="Chat message input"
              className="flex-1 resize-none rounded-xl bg-navy border border-white/10 px-4 py-3
                         text-sm text-cream placeholder:text-cream/30
                         focus:outline-none focus:ring-2 focus:ring-amber/30 focus:border-amber/30
                         disabled:opacity-50 transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              aria-label="Send message"
              className="flex-shrink-0 w-11 h-11 rounded-xl bg-amber text-navy flex items-center justify-center
                         hover:bg-amber-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed
                         focus:outline-none focus:ring-2 focus:ring-amber/50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}

        {isCollecting && collectionError && inputType !== 'multi_chips_confirm' && (
          <p className="text-xs text-red-400 px-1">{collectionError}</p>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onReset}
            aria-label="Start a new trip plan"
            className="flex items-center gap-1.5 text-xs text-cream/40 hover:text-cream/70 transition-colors
                       focus:outline-none focus:ring-2 focus:ring-amber/30 rounded px-2 py-1"
          >
            <RotateCcw className="w-3 h-3" />
            New trip
          </button>
        </div>
      </div>
    </div>
  );
}
