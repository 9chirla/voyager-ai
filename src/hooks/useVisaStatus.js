import { useMemo } from 'react';
import { lookupHeldVisaGrant, pickBetterStatus, getHeldVisaById } from '../data/heldVisaData';
import { lookupVisaCost } from '../data/visaCosts';
import { lookupVisaStatus } from '../data/visaMatrix';

/** @type {Record<string, { label: string, short: string, description: string, className: string }>} */
export const VISA_STATUS_META = {
  'visa-free': {
    label: 'Visa-free',
    short: 'No visa needed',
    description: 'Enter without applying for a visa in advance.',
    className: 'dest-visa-pill--free',
  },
  'visa-on-arrival': {
    label: 'Visa on arrival',
    short: 'VOA at border',
    description: 'Obtain a visa at the airport or border — fee usually applies.',
    className: 'dest-visa-pill--voa',
  },
  'e-visa': {
    label: 'E-visa',
    short: 'Apply online',
    description: 'Apply online before travel — often approved in hours to days.',
    className: 'dest-visa-pill--evisa',
  },
  'visa-required': {
    label: 'Visa required',
    short: 'Embassy visa',
    description: 'Apply at an embassy or consulate before travel.',
    className: 'dest-visa-pill--required',
  },
  unknown: {
    label: 'Check requirements',
    short: 'Verify rules',
    description: 'Confirm current rules on official government sources.',
    className: 'dest-visa-pill--unknown',
  },
};

/**
 * @param {string} destinationIso
 * @param {string} passportIso
 */
function lookupCostForPassport(destinationIso, passportIso) {
  const costIso = passportIso === 'EU' ? 'GB' : passportIso;
  return lookupVisaCost(destinationIso, costIso);
}

/**
 * @param {string[]} passportIsos
 * @param {string} destinationIso
 * @param {string[]} [heldVisaIds]
 * @returns {'visa-free'|'visa-on-arrival'|'e-visa'|'visa-required'|'unknown'}
 */
export function getVisaStatus(passportIsos, destinationIso, heldVisaIds = []) {
  if (!passportIsos?.length && !heldVisaIds?.length) return 'unknown';

  let best = 'visa-required';

  for (const p of passportIsos ?? []) {
    best = pickBetterStatus(best, lookupVisaStatus(p, destinationIso));
  }

  for (const visaId of heldVisaIds ?? []) {
    const grant = lookupHeldVisaGrant(visaId, destinationIso);
    if (grant) best = pickBetterStatus(best, grant);
  }

  if (best === 'visa-required' && (passportIsos?.length || heldVisaIds?.length)) {
    const hasPassportData = passportIsos?.some(
      (p) => lookupVisaStatus(p, destinationIso) !== 'unknown',
    );
    const hasVisaGrant = heldVisaIds?.some(
      (id) => lookupHeldVisaGrant(id, destinationIso) !== null,
    );
    if (!hasPassportData && !hasVisaGrant) return 'unknown';
  }

  return best;
}

/**
 * @param {string[]} passportIsos
 * @param {string} destinationIso
 * @param {string[]} [heldVisaIds]
 * @returns {'visa-free'|'visa-on-arrival'|'e-visa'|'visa-required'|'unknown'}
 */
export function useVisaStatus(passportIsos, destinationIso, heldVisaIds = []) {
  return useMemo(
    () => getVisaStatus(passportIsos, destinationIso, heldVisaIds),
    [passportIsos, destinationIso, heldVisaIds],
  );
}

/**
 * @param {string[]} passportIsos
 * @param {import('../data/destinations.js').default} destinations
 * @param {string[]} [heldVisaIds]
 * @returns {number}
 */
export function countVisaFreeAccess(passportIsos, destinations, heldVisaIds = []) {
  return destinations.filter(
    (d) => getVisaStatus(passportIsos, d.iso, heldVisaIds) === 'visa-free',
  ).length;
}

/**
 * @param {string[]} passportIsos
 * @param {import('../data/destinations.js').default} destinations
 * @param {string[]} [heldVisaIds]
 * @returns {{ iso: string, count: number }|null}
 */
export function getStrongestPassport(passportIsos, destinations, heldVisaIds = []) {
  if (!passportIsos.length) return null;

  let best = { iso: passportIsos[0], count: 0 };
  for (const iso of passportIsos) {
    const count = destinations.filter(
      (d) => lookupVisaStatus(iso, d.iso) === 'visa-free',
    ).length;
    if (count > best.count) best = { iso, count };
  }
  void heldVisaIds;
  return best;
}

/**
 * @param {string[]} passportIsos
 * @param {string[]} heldVisaIds
 * @param {import('../data/destinations.js').default} destinations
 * @returns {string|null}
 */
export function getHeldVisaBoostLabel(passportIsos, heldVisaIds, destinations) {
  if (!heldVisaIds.length) return null;
  const without = countVisaFreeAccess(passportIsos, destinations, []);
  const withVisas = countVisaFreeAccess(passportIsos, destinations, heldVisaIds);
  const boost = withVisas - without;
  if (boost <= 0) return null;

  const labels = heldVisaIds
    .map((id) => getHeldVisaById(id))
    .filter(Boolean)
    .map((v) => v.label);

  return `Held visas unlock +${boost} destinations (${labels.join(', ')})`;
}

/**
 * Per-passport status + cost breakdown for a destination.
 * @param {string[]} passportIsos
 * @param {string} destinationIso
 * @param {string[]} [heldVisaIds]
 * @returns {{ iso: string, status: string, cost: string|null, processing: string|null }[]}
 */
export function getVisaBreakdown(passportIsos, destinationIso, heldVisaIds = []) {
  return passportIsos.map((iso) => {
    const passportOnlyStatus = getVisaStatus([iso], destinationIso, []);
    const status = getVisaStatus([iso], destinationIso, heldVisaIds);
    const costEntry = lookupCostForPassport(destinationIso, iso);

    const costForStatus = (s) => {
      if (s === 'visa-free') return { cost: null, processing: null };
      return {
        cost: costEntry?.cost ?? null,
        processing: costEntry?.processing ?? null,
      };
    };

    const { cost, processing } = costForStatus(status);
    const withoutHeldVisa =
      heldVisaIds?.length && passportOnlyStatus !== status
        ? { status: passportOnlyStatus, ...costForStatus(passportOnlyStatus) }
        : null;

    return { iso, status, cost, processing, withoutHeldVisa };
  });
}

/**
 * @param {string[]} passportIsos
 * @param {string[]} heldVisaIds
 * @param {string} destinationIso
 * @returns {string|null}
 */
export function getVisaAccessVia(passportIsos, heldVisaIds, destinationIso) {
  if (!heldVisaIds.length) return null;

  const passportOnly = getVisaStatus(passportIsos, destinationIso, []);
  const combined = getVisaStatus(passportIsos, destinationIso, heldVisaIds);
  if (combined === passportOnly) return null;

  for (const visaId of heldVisaIds) {
    const without = getVisaStatus(
      passportIsos,
      destinationIso,
      heldVisaIds.filter((id) => id !== visaId),
    );
    if (combined !== without) {
      const visa = getHeldVisaById(visaId);
      return visa ? `via ${visa.label}` : null;
    }
  }
  return null;
}
