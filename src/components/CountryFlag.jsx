import * as FlagIcons from 'country-flag-icons/react/3x2';

/**
 * Renders a country/region flag as inline SVG (never emoji).
 * @param {{ iso: string, className?: string, title?: string }} props
 */
export default function CountryFlag({ iso, className = '', title }) {
  const code = iso?.toUpperCase();
  const Flag = code ? FlagIcons[code] : null;

  if (!Flag) {
    return (
      <span
        className={`country-flag country-flag--fallback ${className}`.trim()}
        title={title}
        aria-hidden="true"
      >
        {code}
      </span>
    );
  }

  return (
    <Flag
      className={`country-flag ${className}`.trim()}
      title={title}
      aria-hidden="true"
    />
  );
}
