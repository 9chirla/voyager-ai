/**
 * Animated typing indicator shown while waiting for AI response.
 * @param {{ label?: string }} props
 */
export default function TypingIndicator({ label }) {
  return (
    <div
      className="flex gap-3 animate-fade-slide-up"
      role="status"
      aria-label={label || 'Voyager is typing'}
    >
      <div
        className="flex-shrink-0 w-8 h-8 rounded-full bg-navy-light border border-amber/30 flex items-center justify-center"
        aria-hidden="true"
      >
        <div className="w-2 h-2 rounded-full bg-amber/60" />
      </div>

      <div className="bg-navy-glass backdrop-blur-sm border border-white/5 rounded-2xl rounded-bl-sm px-5 py-4 flex items-center gap-2">
        {label && (
          <span className="text-sm text-cream/70 mr-1">{label}</span>
        )}
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full bg-teal animate-pulse-dot"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
