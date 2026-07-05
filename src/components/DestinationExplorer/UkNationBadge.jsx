/** @type {Record<string, { label: string, className: string }>} */
const NATION_META = {
  england: { label: 'England', className: 'uk-nation-badge--england' },
  scotland: { label: 'Scotland', className: 'uk-nation-badge--scotland' },
  wales: { label: 'Wales', className: 'uk-nation-badge--wales' },
  'northern-ireland': { label: 'N. Ireland', className: 'uk-nation-badge--ni' },
};

/**
 * @param {{ nation?: string, className?: string }} props
 */
export default function UkNationBadge({ nation, className = '' }) {
  const meta = nation ? NATION_META[nation] : null;
  if (!meta) return null;

  return (
    <span className={`uk-nation-badge ${meta.className} ${className}`.trim()}>
      {meta.label}
    </span>
  );
}
