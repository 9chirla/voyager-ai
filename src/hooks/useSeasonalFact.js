import phenomena from '../data/seasonalPhenomena';

/**
 * Filter phenomena active now or within the next two months, shuffled per day.
 * @returns {typeof phenomena}
 */
export function useSeasonalFact() {
  const currentMonth = new Date().getMonth() + 1;

  const upcoming = phenomena.filter((p) => {
    const inWindow = [0, 1, 2].map((offset) => {
      const m = ((currentMonth - 1 + offset) % 12) + 1;
      return p.months.includes(m);
    });
    return inWindow.some(Boolean);
  });

  const seed = new Date().toDateString();
  return deterministicShuffle(upcoming, seed);
}

/**
 * @template T
 * @param {T[]} arr
 * @param {string} seed
 * @returns {T[]}
 */
function deterministicShuffle(arr, seed) {
  let s = seed.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
