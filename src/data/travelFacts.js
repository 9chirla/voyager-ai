/** @typedef {'Natural Wonder'|'Festival'|'Culinary'|'Hidden Gem'|'Heritage'|'Architecture'|'Wildlife'|'Seasonal'} FactBadge */

/**
 * @typedef {object} TravelFact
 * @property {string} id
 * @property {string} destination
 * @property {string} headline
 * @property {string} body
 * @property {FactBadge} badge
 * @property {string|null} bestMonth
 * @property {{ lat: number, lng: number }} coords
 */

/** @type {TravelFact[]} */
export const travelFacts = [
  {
    id: 'fact-001',
    destination: 'Oaxaca, Mexico',
    headline: 'The world\'s stoutest tree has stood in Oaxaca for two millennia',
    body: 'El Árbol del Tule in Santa María del Tule is a Montezuma cypress with a trunk circumference of 58 metres — wider than most city blocks. Zapotec communities have treated it as sacred since before the Spanish arrived.',
    badge: 'Natural Wonder',
    bestMonth: 'October',
    coords: { lat: 17.047, lng: -96.636 },
  },
  {
    id: 'fact-002',
    destination: 'Lalibela, Ethiopia',
    headline: 'Eleven churches in Lalibela were carved downward into living rock',
    body: 'Built in the 12th century under King Lalibela, each church was chiselled from a single basalt block. Every January 19, pilgrims walk barefoot through tunnels for Timkat — the Ethiopian Orthodox celebration of Epiphany.',
    badge: 'Heritage',
    bestMonth: 'January',
    coords: { lat: 12.031, lng: 39.047 },
  },
  {
    id: 'fact-003',
    destination: 'Hoi An, Vietnam',
    headline: 'Hoi An dims its electric lights for one night each lunar February',
    body: 'On the 14th day of the first lunar month, the Ancient Town shuts off street lighting and floats thousands of paper lanterns on the Thu Bồn River. The tradition marks the full moon of the new year — the night is called Hội An Lồng Đèn.',
    badge: 'Festival',
    bestMonth: 'February',
    coords: { lat: 15.880, lng: 108.338 },
  },
  {
    id: 'fact-004',
    destination: 'Svalbard, Norway',
    headline: 'More polar bears than people live on Svalbard',
    body: 'Roughly 3,000 polar bears roam the archipelago against about 2,500 human residents. From March through May, guides lead snowmobile safaris when bears descend to the fjord ice hunting ringed seals.',
    badge: 'Wildlife',
    bestMonth: 'March',
    coords: { lat: 78.223, lng: 15.626 },
  },
  {
    id: 'fact-005',
    destination: 'Chefchaouen, Morocco',
    headline: 'Chefchaouen\'s walls were painted blue to repel mosquitoes',
    body: 'The Rif Mountain town adopted indigo wash in the 15th century — Jewish refugees fleeing the Inquisition brought the custom, believing blue recalled the sky and kept insects away. Every alley is a different shade of cobalt.',
    badge: 'Architecture',
    bestMonth: 'April',
    coords: { lat: 35.171, lng: -5.269 },
  },
  {
    id: 'fact-006',
    destination: 'Uyuni, Bolivia',
    headline: 'Salar de Uyuni becomes the world\'s largest mirror each April',
    body: 'After the rainy season, a thin sheet of water on the salt flat reflects the sky so perfectly that horizon disappears. NASA uses the plain to calibrate satellite altimeters because the surface is so uniformly flat.',
    badge: 'Natural Wonder',
    bestMonth: 'April',
    coords: { lat: -20.133, lng: -67.489 },
  },
  {
    id: 'fact-007',
    destination: 'Shiraz, Iran',
    headline: 'Shiraz harvests 30 tonnes of damask roses in a single May week',
    body: 'The Qajar-era Bagh-e Eram gardens and surrounding valleys fill with Rosa damascena pickers at dawn. Petals are steam-distilled into mohammadi rosewater within hours — the same method used since the 10th century.',
    badge: 'Culinary',
    bestMonth: 'May',
    coords: { lat: 29.592, lng: 52.583 },
  },
  {
    id: 'fact-008',
    destination: 'Faroe Islands',
    headline: 'The Faroe Islands receive 19 hours of daylight on June 21',
    body: 'On the summer solstice, villagers in Gjógv and Saksun hike to sea cliffs after midnight golf and communal singing. The Gulf Stream keeps temperatures near 12°C even as the sun barely dips below the North Atlantic horizon.',
    badge: 'Seasonal',
    bestMonth: 'June',
    coords: { lat: 62.011, lng: -6.768 },
  },
  {
    id: 'fact-009',
    destination: 'Tanna Island, Vanuatu',
    headline: 'Tanna\'s Toka dance can run for 32 hours without stopping',
    body: 'Every July, rival villages on Tanna Island stage Toka — a ritual dance battle that began as a peace treaty in the 1800s. Dancers wear fern skirts and ash body paint; the winning village hosts a feast of taro and roast pig.',
    badge: 'Festival',
    bestMonth: 'July',
    coords: { lat: -19.540, lng: 169.268 },
  },
  {
    id: 'fact-010',
    destination: 'Matera, Italy',
    headline: 'Matera\'s sassi caves housed humans for 9,000 years',
    body: 'The limestone ravine city in Basilicata was continuously inhabited from the Paleolithic era until the 1950s. Each September, cantine open their tufa cellars for Aglianico grape pressing — the wine has been made in the same caves for centuries.',
    badge: 'Culinary',
    bestMonth: 'September',
    coords: { lat: 40.667, lng: 16.604 },
  },
  {
    id: 'fact-011',
    destination: 'Lake Baikal, Russia',
    headline: 'Lake Baikal\'s winter ice is transparent enough to read a newspaper through',
    body: 'The world\'s deepest lake freezes with such clarity in February that cracks look like laser-etched glass. Nerpa — the only freshwater seal species — surfaces through breathing holes cut by Buryat fishermen on 1.5-metre-thick ice.',
    badge: 'Seasonal',
    bestMonth: 'February',
    coords: { lat: 53.558, lng: 108.165 },
  },
  {
    id: 'fact-012',
    destination: 'Wadi Rum, Jordan',
    headline: 'Lawrence of Arabia called Wadi Rum "vast, echoing and God-like"',
    body: 'The sandstone valley rises 1,750 metres at Jebel Umm ad Dami — Jordan\'s highest peak. Bedouin families still brew cardamom coffee in goat-hair tents where Thamudic petroglyphs from 12,000 BCE mark hunting scenes on the rock faces.',
    badge: 'Hidden Gem',
    bestMonth: 'March',
    coords: { lat: 29.572, lng: 35.420 },
  },
  {
    id: 'fact-013',
    destination: 'Lamu, Kenya',
    headline: 'Lamu has no cars — only donkeys and dhow boats',
    body: 'The UNESCO-listed Swahili town on the Indian Ocean bans motor vehicles entirely. Each November during Maulidi, dhows race from Shela beach while muezzins call from 23 mosques built from mangrove poles and coral rag.',
    badge: 'Heritage',
    bestMonth: 'November',
    coords: { lat: -2.271, lng: 40.902 },
  },
  {
    id: 'fact-014',
    destination: 'Bhaktapur, Nepal',
    headline: 'Bhaktapur erects a 25-metre chariot for Bisket Jatra each April',
    body: 'The Newari city pulls a three-storey wooden chariot through Durbar Square to honour deities Bhairab and Bhadrakali. The festival marks the Nepali new year — rival neighbourhoods compete to reach Taumadhi Tole first without the tower collapsing.',
    badge: 'Festival',
    bestMonth: 'April',
    coords: { lat: 27.672, lng: 85.429 },
  },
  {
    id: 'fact-015',
    destination: 'Atacama Desert, Chile',
    headline: 'The Atacama blooms purple once a decade after winter rain',
    body: 'Normally the driest non-polar desert on Earth, the Atacama erupts with 200 wildflower species when El Niño brings November rains. Copiapó Valley records as little as 0.04 mm of rain per year — yet flamingos breed on salt lagoons year-round.',
    badge: 'Natural Wonder',
    bestMonth: 'November',
    coords: { lat: -23.863, lng: -69.132 },
  },
  {
    id: 'fact-016',
    destination: 'Lord Howe Island, Australia',
    headline: 'Lord Howe Island caps visitors at 400 at any one time',
    body: 'The volcanic remnant 600 km off Sydney limits tourists to protect its 241 endemic species — including the metre-long Lord Howe Island stick insect, rediscovered in 2001 after believed extinct. September is peak for sooty tern nesting on Mount Gower.',
    badge: 'Wildlife',
    bestMonth: 'September',
    coords: { lat: -31.556, lng: 159.082 },
  },
];
