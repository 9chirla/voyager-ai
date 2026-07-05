/**
 * Hero photos per destination. Served from /public/destinations/ (bundled locally).
 * Sources: Pexels + Unsplash (verified June 2026).
 * @type {Record<string, { url: string, alt: string }>}
 */
export const DESTINATION_IMAGES = {
  FR: { url: '/destinations/FR.jpg', alt: 'Paris skyline at dusk' },
  ES: { url: '/destinations/ES.jpg', alt: 'Colourful Spanish architecture' },
  IT: { url: '/destinations/IT.jpg', alt: 'Lake and mountains in Italy' },
  PT: { url: '/destinations/PT.jpg', alt: 'Lisbon waterfront' },
  GR: { url: '/destinations/GR.jpg', alt: 'White buildings overlooking the Aegean' },
  HR: { url: '/destinations/HR.jpg', alt: 'Historic walled city on the Adriatic' },
  PL: { url: '/destinations/PL.jpg', alt: 'Kraków old town' },
  TH: { url: '/destinations/TH.jpg', alt: 'Thai temple at sunset' },
  VN: { url: '/destinations/VN.jpg', alt: 'Limestone karsts in Ha Long Bay' },
  ID: { url: '/destinations/ID.jpg', alt: 'Rice terraces in Bali' },
  PH: { url: '/destinations/PH.jpg', alt: 'Turquoise lagoon in the Philippines' },
  SG: { url: '/destinations/SG.jpg', alt: 'Marina Bay skyline at night' },
  JP: { url: '/destinations/JP.jpg', alt: 'Tokyo city lights' },
  KR: { url: '/destinations/KR.jpg', alt: 'Seoul cityscape' },
  LK: { url: '/destinations/LK.jpg', alt: 'Tea plantations in the hills' },
  JO: { url: '/destinations/JO.jpg', alt: 'Ancient facade at Petra' },
  AE: { url: '/destinations/AE.jpg', alt: 'Dubai skyline' },
  MA: { url: '/destinations/MA.jpg', alt: 'Marrakech medina alley' },
  KE: { url: '/destinations/KE.jpg', alt: 'Elephants on the savannah' },
  ZA: { url: '/destinations/ZA.jpg', alt: 'Table Mountain above Cape Town' },
  MX: { url: '/destinations/MX.jpg', alt: 'Colourful Mexican street' },
  CR: { url: '/destinations/CR.jpg', alt: 'Rainforest waterfall' },
  CO: { url: '/destinations/CO.jpg', alt: 'Colonial buildings in Cartagena' },
  AU: { url: '/destinations/AU.jpg', alt: 'Sydney Opera House and harbour' },
  NZ: { url: '/destinations/NZ.jpg', alt: 'Road toward the Southern Alps, New Zealand' },
};

/**
 * @param {string} iso
 * @returns {{ url: string, alt: string }|null}
 */
export function getDestinationImage(iso) {
  return DESTINATION_IMAGES[iso?.toUpperCase()] ?? null;
}
