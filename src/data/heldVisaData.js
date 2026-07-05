// AUTO-GENERATED from Voyager_VisaIntelligence_June2026.xlsx

/**
 * Optional held visas / residence permits that change destination access
 * beyond what a passport alone grants.
 *
 * @typedef {object} HeldVisaOption
 * @property {string} id
 * @property {string} label
 * @property {string} flagIso — ISO code for CountryFlag (EU = Schengen)
 * @property {string} hint
 * @property {{ visaFree?: string[], visaOnArrival?: string[], eVisa?: string[] }} grants
 */

/** @type {HeldVisaOption[]} */
export const HELD_VISA_OPTIONS = [
  {
    "id": "schengen-visa",
    "label": "Schengen visa",
    "flagIso": "EU",
    "hint": "Valid short-stay Schengen visa — covers all 27 Schengen states in our EU destination list.",
    "grants": {
      "visaFree": [
        "FR",
        "ES",
        "IT",
        "PT",
        "GR",
        "HR",
        "PL",
        "DE",
        "NL",
        "BE",
        "AT",
        "CH",
        "CZ",
        "SE",
        "NO",
        "DK",
        "FI",
        "IE",
        "LU",
        "IS",
        "EE",
        "LV",
        "LT",
        "SK",
        "SI",
        "HU",
        "MT",
        "CY",
        "BG",
        "RO",
        "XK",
        "MK",
        "AL",
        "ME",
        "RS",
        "GE"
      ]
    }
  },
  {
    "id": "uk-visa",
    "label": "UK visa / BRP",
    "flagIso": "GB",
    "hint": "Valid UK visitor, student, or work visa — unlocks Japan, South Korea, Mexico and more for Indian passport holders.",
    "grants": {
      "visaFree": [
        "AL",
        "GE",
        "ME",
        "RS",
        "AM",
        "MD",
        "MK",
        "MX",
        "PA",
        "JM",
        "BS",
        "DO",
        "AI",
        "AW",
        "BM",
        "KY",
        "CW",
        "SX",
        "PE",
        "BH",
        "OM",
        "QA",
        "AE",
        "KW",
        "EG",
        "MA",
        "JP",
        "KR",
        "SG",
        "PH",
        "KG",
        "TW",
        "IE"
      ],
      "eVisa": [
        "SA"
      ]
    }
  },
  {
    "id": "us-visa",
    "label": "US visa",
    "flagIso": "US",
    "hint": "Valid US B1/B2 (used at least once) — visa-free entry to Mexico, Colombia, Costa Rica and more.",
    "grants": {
      "visaFree": [
        "AL",
        "GE",
        "MX",
        "CR",
        "PA",
        "PH",
        "MN",
        "CO",
        "BH",
        "OM",
        "QA",
        "KW",
        "TW",
        "KG",
        "JM",
        "BS",
        "DO",
        "PE"
      ]
    }
  },
  {
    "id": "canada-visa",
    "label": "Canada visa",
    "flagIso": "CA",
    "hint": "Valid Canadian visitor or study permit.",
    "grants": {
      "visaFree": [
        "MX",
        "CR"
      ],
      "visaOnArrival": [
        "CO"
      ]
    }
  },
  {
    "id": "uae-residence",
    "label": "UAE residence",
    "flagIso": "AE",
    "hint": "Valid UAE residence visa or Emirates ID.",
    "grants": {
      "visaFree": [
        "AE",
        "JO",
        "MA"
      ],
      "visaOnArrival": [
        "KE",
        "LK"
      ]
    }
  },
  {
    "id": "australia-visa",
    "label": "Australia visa",
    "flagIso": "AU",
    "hint": "Valid Australian visitor or student visa.",
    "grants": {
      "visaFree": [
        "NZ"
      ],
      "visaOnArrival": [
        "ID",
        "PH",
        "LK"
      ]
    }
  }
];

const STATUS_RANK = {
  'visa-free': 0,
  'visa-on-arrival': 1,
  'e-visa': 2,
  'visa-required': 3,
  unknown: 4,
};

/**
 * @param {string} heldVisaId
 * @returns {HeldVisaOption|undefined}
 */
export function getHeldVisaById(heldVisaId) {
  return HELD_VISA_OPTIONS.find((v) => v.id === heldVisaId);
}

/**
 * @param {string} heldVisaId
 * @param {string} destinationIso
 * @returns {'visa-free'|'visa-on-arrival'|'e-visa'|null}
 */
export function lookupHeldVisaGrant(heldVisaId, destinationIso) {
  const visa = getHeldVisaById(heldVisaId);
  if (!visa) return null;
  if (visa.grants.visaFree?.includes(destinationIso)) return 'visa-free';
  if (visa.grants.visaOnArrival?.includes(destinationIso)) return 'visa-on-arrival';
  if (visa.grants.eVisa?.includes(destinationIso)) return 'e-visa';
  return null;
}

/**
 * @param {'visa-free'|'visa-on-arrival'|'e-visa'|'visa-required'|'unknown'} a
 * @param {'visa-free'|'visa-on-arrival'|'e-visa'|'visa-required'|'unknown'} b
 */
export function pickBetterStatus(a, b) {
  return STATUS_RANK[a] <= STATUS_RANK[b] ? a : b;
}
