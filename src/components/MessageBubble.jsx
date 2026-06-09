import { Compass } from 'lucide-react';
import { parseItinerary, parseChecklist, parseChips } from '../utils/tripParser';

/**
 * Parse inline **bold** and *italic* markers into safe React elements.
 * Bold is matched before italic to avoid conflicts with adjacent asterisks.
 * @param {string} line - Single line of text
 * @param {string} keyPrefix - Stable key prefix for list items
 * @param {boolean} isUser - Whether the message is from the user
 * @returns {import('react').ReactNode[]}
 */
function parseInlineMarkdown(line, keyPrefix, isUser) {
  const parts = [];
  const regex = /\*\*(.+?)\*\*|\*(.+?)\*/g;
  let lastIndex = 0;
  let match;
  let partIndex = 0;

  while ((match = regex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <span key={`${keyPrefix}-t-${partIndex++}`}>
          {line.slice(lastIndex, match.index)}
        </span>,
      );
    }

    if (match[1] !== undefined) {
      parts.push(
        <strong
          key={`${keyPrefix}-b-${partIndex++}`}
          className={isUser ? 'font-semibold' : 'text-amber-light font-semibold'}
        >
          {match[1]}
        </strong>,
      );
    } else if (match[2] !== undefined) {
      parts.push(
        <em key={`${keyPrefix}-i-${partIndex++}`}>{match[2]}</em>,
      );
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < line.length) {
    parts.push(
      <span key={`${keyPrefix}-t-${partIndex++}`}>{line.slice(lastIndex)}</span>,
    );
  }

  return parts.length > 0 ? parts : [line];
}

/**
 * Safely render minimal inline markdown (**bold**, *italic*) as React elements.
 * Splits on newlines and wraps each non-empty line in a <p> element.
 * @param {string} text - Message content to render
 * @param {boolean} isUser - Whether the message is from the user
 * @returns {import('react').ReactElement[]}
 */
function renderMarkdown(text, isUser) {
  const lines = text.split('\n').filter((line) => line.trim());

  return lines.map((line, i) => (
    <p
      key={i}
      className={`text-sm leading-relaxed ${i > 0 ? 'mt-2' : ''} ${isUser ? 'text-cream' : 'text-cream/90'}`}
    >
      {parseInlineMarkdown(line, `line-${i}`, isUser)}
    </p>
  ));
}

/**
 * Renders a single chat message bubble (user or assistant).
 * @param {{ message: { role: string, content: string }, index: number }} props
 */
export default function MessageBubble({ message, index }) {
  const isUser = message.role === 'user';

  let displayContent = message.content;
  if (!isUser) {
    const { cleanedText: afterIt } = parseItinerary(displayContent);
    const { cleanedText: afterCl } = parseChecklist(afterIt);
    const { cleanedText } = parseChips(afterCl);
    displayContent = cleanedText;
  }

  return (
    <div
      data-testid="message-bubble"
      className={`flex gap-3 animate-fade-slide-up ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
      style={{ animationDelay: `${index * 0.05}s` }}
      role="article"
      aria-label={isUser ? 'Your message' : 'Voyager AI message'}
    >
      {!isUser && (
        <div
          className="flex-shrink-0 w-8 h-8 rounded-full bg-navy-light border border-amber/30 flex items-center justify-center mt-1"
          aria-hidden="true"
        >
          <Compass className="w-4 h-4 text-amber" />
        </div>
      )}

      <div
        className={`max-w-[85%] lg:max-w-[75%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-amber-tint border border-amber/25 rounded-br-sm'
            : 'bg-navy-glass backdrop-blur-sm border border-white/5 rounded-bl-sm'
        }`}
      >
        {renderMarkdown(displayContent, isUser)}
      </div>
    </div>
  );
}
