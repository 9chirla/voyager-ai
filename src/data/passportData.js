/** Quick-select chips shown in PassportSelector */
export const QUICK_PASSPORTS = [
  { iso: 'GB', label: 'UK' },
  { iso: 'US', label: 'USA' },
  { iso: 'IN', label: 'India' },
  { iso: 'CA', label: 'Canada' },
  { iso: 'AU', label: 'Australia' },
  { iso: 'EU', label: 'EU (Schengen)' },
  { iso: 'BR', label: 'Brazil' },
  { iso: 'ZA', label: 'South Africa' },
  { iso: 'CN', label: 'China' },
  { iso: 'MY', label: 'Malaysia' },
  { iso: 'NG', label: 'Nigeria' },
  { iso: 'JP', label: 'Japan' },
];

/** Extended list for search — top 20+ tourist passports */
export const ALL_PASSPORTS = [
  ...QUICK_PASSPORTS,
  { iso: 'DE', label: 'Germany' },
  { iso: 'FR', label: 'France' },
  { iso: 'IT', label: 'Italy' },
  { iso: 'ES', label: 'Spain' },
  { iso: 'NL', label: 'Netherlands' },
  { iso: 'SE', label: 'Sweden' },
  { iso: 'NO', label: 'Norway' },
  { iso: 'CH', label: 'Switzerland' },
  { iso: 'KR', label: 'South Korea' },
  { iso: 'SG', label: 'Singapore' },
  { iso: 'TH', label: 'Thailand' },
  { iso: 'MX', label: 'Mexico' },
  { iso: 'AR', label: 'Argentina' },
  { iso: 'NZ', label: 'New Zealand' },
  { iso: 'IE', label: 'Ireland' },
  { iso: 'PK', label: 'Pakistan' },
  { iso: 'BD', label: 'Bangladesh' },
  { iso: 'PH', label: 'Philippines' },
  { iso: 'ID', label: 'Indonesia' },
  { iso: 'TR', label: 'Turkey' },
  { iso: 'AE', label: 'UAE' },
  { iso: 'SA', label: 'Saudi Arabia' },
  { iso: 'EG', label: 'Egypt' },
  { iso: 'KE', label: 'Kenya' },
  { iso: 'GH', label: 'Ghana' },
];

/**
 * @param {string} query
 * @param {string[]} selectedIsos
 * @returns {typeof ALL_PASSPORTS}
 */
export function searchPassports(query, selectedIsos = []) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return ALL_PASSPORTS.filter(
    (p) => !selectedIsos.includes(p.iso)
      && (p.label.toLowerCase().includes(q) || p.iso.toLowerCase().includes(q)),
  ).slice(0, 6);
}

/**
 * @param {string} iso
 * @returns {typeof ALL_PASSPORTS[number]|undefined}
 */
export function getPassportByIso(iso) {
  return ALL_PASSPORTS.find((p) => p.iso === iso)
    ?? QUICK_PASSPORTS.find((p) => p.iso === iso);
}
