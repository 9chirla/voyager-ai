/** @type {Record<string, import('./destinations.js').Destination & { curated: true }>} */
export default {
  "FR": {
    "id": "france",
    "country": "France",
    "iso": "FR",
    "region": "Western Europe",
    "filterRegion": "europe",
    "heroHue": "220,80%,42%",
    "tagline": "Croissants, châteaux, and slow river lunches",
    "duration": {
      "min": 5,
      "max": 10,
      "label": "5–10 days"
    },
    "flightHours": {
      "from": "UK",
      "min": 1,
      "max": 2
    },
    "bestMonths": [
      4,
      5,
      6,
      9,
      10
    ],
    "coords": {
      "lat": 48.8566,
      "lng": 2.3522
    },
    "attractions": [
      {
        "name": "Louvre at opening",
        "detail": "Enter via Passage Richelieu — skip the pyramid queue",
        "icon": "landmark"
      },
      {
        "name": "Marché des Enfants Rouges",
        "detail": "Paris' oldest covered market — lunch at the Moroccan stall",
        "icon": "basket"
      },
      {
        "name": "Loire by bike",
        "detail": "Rent in Amboise and cycle Château de Chenonceau at dawn",
        "icon": "bike"
      }
    ],
    "visaNote": "Visa-free for UK, US, EU, Canada, Australia, Japan (90 days Schengen)",
    "curated": true
  },
  "ES": {
    "id": "spain",
    "country": "Spain",
    "iso": "ES",
    "region": "Western Europe",
    "filterRegion": "europe",
    "heroHue": "350,75%,48%",
    "tagline": "Tapas crawls and golden-hour plazas",
    "duration": {
      "min": 5,
      "max": 12,
      "label": "5–12 days"
    },
    "flightHours": {
      "from": "UK",
      "min": 2,
      "max": 3
    },
    "bestMonths": [
      4,
      5,
      6,
      9,
      10
    ],
    "coords": {
      "lat": 40.4168,
      "lng": -3.7038
    },
    "attractions": [
      {
        "name": "El Rastro flea",
        "detail": "Sunday only — arrive 9am before the crowds in La Latina",
        "icon": "map"
      },
      {
        "name": "Alhambra night visit",
        "detail": "Book Nasrid Palaces slot first, then stay for sunset gardens",
        "icon": "landmark"
      },
      {
        "name": "San Sebastián pintxos",
        "detail": "Old Town — one plate per bar, always standing at the counter",
        "icon": "utensils"
      }
    ],
    "visaNote": "Visa-free for most Western passports (90 days Schengen)",
    "curated": true
  },
  "IT": {
    "id": "italy",
    "country": "Italy",
    "iso": "IT",
    "region": "Western Europe",
    "filterRegion": "europe",
    "heroHue": "145,55%,38%",
    "tagline": "Art, pasta, and coastlines that glow at dusk",
    "duration": {
      "min": 7,
      "max": 14,
      "label": "7–14 days"
    },
    "flightHours": {
      "from": "UK",
      "min": 2,
      "max": 3
    },
    "bestMonths": [
      4,
      5,
      6,
      9,
      10
    ],
    "coords": {
      "lat": 41.9028,
      "lng": 12.4964
    },
    "attractions": [
      {
        "name": "Trastevere aperitivo",
        "detail": "Freni e Salvini for supplì — order before 6:30pm",
        "icon": "wine"
      },
      {
        "name": "Cinque Terre trail",
        "detail": "Walk Vernazza→Monterosso early — afternoon trains are packed",
        "icon": "mountain"
      },
      {
        "name": "Uffizi timed entry",
        "detail": "Room 10 (Botticelli) first — work backwards from there",
        "icon": "landmark"
      }
    ],
    "visaNote": "Visa-free for UK, US, EU, Canada, Australia (90 days Schengen)",
    "curated": true
  },
  "PT": {
    "id": "portugal",
    "country": "Portugal",
    "iso": "PT",
    "region": "Western Europe",
    "filterRegion": "europe",
    "heroHue": "145,60%,32%",
    "tagline": "Atlantic light, pasteis, and tiled alleyways",
    "duration": {
      "min": 5,
      "max": 10,
      "label": "5–10 days"
    },
    "flightHours": {
      "from": "UK",
      "min": 2,
      "max": 3
    },
    "bestMonths": [
      4,
      5,
      6,
      9,
      10,
      11
    ],
    "coords": {
      "lat": 38.7223,
      "lng": -9.1393
    },
    "attractions": [
      {
        "name": "Pastéis de Belém",
        "detail": "Queue moves fast — eat warm, never reheat",
        "icon": "utensils"
      },
      {
        "name": "Alfama fado night",
        "detail": "Clube de Fado — book table, not bar, for acoustics",
        "icon": "music"
      },
      {
        "name": "Sintra early bus",
        "detail": "Scott's Bus 434 at 8:30am beats Pena Palace crowds",
        "icon": "castle"
      }
    ],
    "visaNote": "Visa-free for most Western passports (90 days Schengen)",
    "curated": true
  },
  "GR": {
    "id": "greece",
    "country": "Greece",
    "iso": "GR",
    "region": "Western Europe",
    "filterRegion": "europe",
    "heroHue": "210,70%,45%",
    "tagline": "Islands, ruins, and seafood by the harbour",
    "duration": {
      "min": 7,
      "max": 14,
      "label": "7–14 days"
    },
    "flightHours": {
      "from": "UK",
      "min": 3,
      "max": 4
    },
    "bestMonths": [
      5,
      6,
      9,
      10
    ],
    "coords": {
      "lat": 37.9838,
      "lng": 23.7275
    },
    "attractions": [
      {
        "name": "Acropolis at 8am",
        "detail": "South slope entrance — buy ticket online night before",
        "icon": "landmark"
      },
      {
        "name": "Santorini caldera walk",
        "detail": "Fira→Oia counter-clockwise — shade on your back after noon",
        "icon": "sun"
      },
      {
        "name": "Central Market Athens",
        "detail": "Varvakios — grab souvlaki at Thanasis, not the tourist strip",
        "icon": "basket"
      }
    ],
    "visaNote": "Visa-free for UK, US, EU, Canada, Australia (90 days Schengen)",
    "curated": true
  },
  "HR": {
    "id": "croatia",
    "country": "Croatia",
    "iso": "HR",
    "region": "Eastern Europe",
    "filterRegion": "europe",
    "heroHue": "215,75%,40%",
    "tagline": "Adriatic blues and walled old towns",
    "duration": {
      "min": 5,
      "max": 10,
      "label": "5–10 days"
    },
    "flightHours": {
      "from": "UK",
      "min": 2,
      "max": 3
    },
    "bestMonths": [
      5,
      6,
      9,
      10
    ],
    "coords": {
      "lat": 42.6507,
      "lng": 18.0944
    },
    "attractions": [
      {
        "name": "Dubrovnik walls",
        "detail": "Enter at Pile Gate 7:30am — cruise crowds arrive by 10",
        "icon": "landmark"
      },
      {
        "name": "Plitvice upper lakes",
        "detail": "Route C from Entrance 1 — hit Veliki Slap before 11am",
        "icon": "droplets"
      },
      {
        "name": "Hvar konoba lunch",
        "detail": "Stori Hvar in alley behind square — grilled octopus sells out",
        "icon": "utensils"
      }
    ],
    "visaNote": "Visa-free for UK, US, EU, Canada, Australia",
    "curated": true
  },
  "PL": {
    "id": "poland",
    "country": "Poland",
    "iso": "PL",
    "region": "Eastern Europe",
    "filterRegion": "europe",
    "heroHue": "355,65%,42%",
    "tagline": "Medieval squares and pierogi that hit different",
    "duration": {
      "min": 4,
      "max": 8,
      "label": "4–8 days"
    },
    "flightHours": {
      "from": "UK",
      "min": 2,
      "max": 3
    },
    "bestMonths": [
      5,
      6,
      7,
      8,
      9
    ],
    "coords": {
      "lat": 50.0647,
      "lng": 19.945
    },
    "attractions": [
      {
        "name": "Wieliczka salt mine",
        "detail": "English tour 9am — underground chapel at 135m depth",
        "icon": "landmark"
      },
      {
        "name": "Kazimierz breakfast",
        "detail": "Plac Nowy on Sunday — zapiekanka from Endzior",
        "icon": "utensils"
      },
      {
        "name": "Gdańsk amber stalls",
        "detail": "Mariacka Street — real amber floats in salt water",
        "icon": "gem"
      }
    ],
    "visaNote": "Visa-free for UK, US, EU, Canada, Australia (90 days)",
    "curated": true
  },
  "TH": {
    "id": "thailand",
    "country": "Thailand",
    "iso": "TH",
    "region": "Southeast Asia",
    "filterRegion": "asia",
    "heroHue": "355,70%,45%",
    "tagline": "Street food temples and island-hopping",
    "duration": {
      "min": 10,
      "max": 21,
      "label": "10–21 days"
    },
    "flightHours": {
      "from": "UK",
      "min": 11,
      "max": 13
    },
    "bestMonths": [
      11,
      12,
      1,
      2,
      3
    ],
    "coords": {
      "lat": 13.7563,
      "lng": 100.5018
    },
    "attractions": [
      {
        "name": "Chatuchak early",
        "detail": "Section 27 for vintage — arrive 7am before heat",
        "icon": "basket"
      },
      {
        "name": "Chiang Mai monks' trail",
        "detail": "Doi Suthep at sunrise — yellow robes process at 6am",
        "icon": "landmark"
      },
      {
        "name": "Railay beach kayak",
        "detail": "Rent at east beach — paddle to Phra Nang cave before 9am",
        "icon": "waves"
      }
    ],
    "visaNote": "Visa-free 60 days (UK/US/EU); visa on arrival for many others",
    "curated": true
  },
  "VN": {
    "id": "vietnam",
    "country": "Vietnam",
    "iso": "VN",
    "region": "Southeast Asia",
    "filterRegion": "asia",
    "heroHue": "355,75%,42%",
    "tagline": "Pho at dawn and karst bays by junk boat",
    "duration": {
      "min": 10,
      "max": 18,
      "label": "10–18 days"
    },
    "flightHours": {
      "from": "UK",
      "min": 12,
      "max": 14
    },
    "bestMonths": [
      2,
      3,
      4,
      10,
      11
    ],
    "coords": {
      "lat": 21.0285,
      "lng": 105.8542
    },
    "attractions": [
      {
        "name": "Hanoi egg coffee",
        "detail": "Giảng Café — original alley location, not the copycats",
        "icon": "coffee"
      },
      {
        "name": "Hạ Long 2-day junk",
        "detail": "Book Bai Tu Long route — fewer boats than main bay",
        "icon": "ship"
      },
      {
        "name": "Hội An tailor rush",
        "detail": "Yaly Couture — allow 48h, fittings at sunset",
        "icon": "scissors"
      }
    ],
    "visaNote": "E-visa online for most nationalities; UK visa-free 45 days",
    "curated": true
  },
  "ID": {
    "id": "indonesia",
    "country": "Indonesia",
    "iso": "ID",
    "region": "Southeast Asia",
    "filterRegion": "asia",
    "heroHue": "355,70%,38%",
    "tagline": "Volcanoes, rice terraces, and reef mornings",
    "duration": {
      "min": 12,
      "max": 21,
      "label": "12–21 days"
    },
    "flightHours": {
      "from": "UK",
      "min": 14,
      "max": 17
    },
    "bestMonths": [
      4,
      5,
      6,
      7,
      8,
      9
    ],
    "coords": {
      "lat": -8.4095,
      "lng": 115.1889
    },
    "attractions": [
      {
        "name": "Borobudur sunrise",
        "detail": "Manohara package — enter 4:30am, fog lifts by 6",
        "icon": "landmark"
      },
      {
        "name": "Ubud morning market",
        "detail": "Pasar Seni before 8am — sate babi at stall 7",
        "icon": "basket"
      },
      {
        "name": "Komodo day boat",
        "detail": "Pink Beach snorkel first — dragons at Rinca after lunch",
        "icon": "fish"
      }
    ],
    "visaNote": "Visa on arrival 30 days for most; UK/US visa-free 30 days",
    "curated": true
  },
  "PH": {
    "id": "philippines",
    "country": "Philippines",
    "iso": "PH",
    "region": "Southeast Asia",
    "filterRegion": "asia",
    "heroHue": "355,65%,40%",
    "tagline": "7,000 islands and the kindest strangers",
    "duration": {
      "min": 10,
      "max": 18,
      "label": "10–18 days"
    },
    "flightHours": {
      "from": "UK",
      "min": 14,
      "max": 18
    },
    "bestMonths": [
      12,
      1,
      2,
      3,
      4
    ],
    "coords": {
      "lat": 14.5995,
      "lng": 120.9842
    },
    "attractions": [
      {
        "name": "El Nido Tour C",
        "detail": "Small boat — Secret Beach at low tide only",
        "icon": "waves"
      },
      {
        "name": "Intramuros by bike",
        "detail": "Bambike rental — Fort Santiago before 10am heat",
        "icon": "bike"
      },
      {
        "name": "Cebu lechon",
        "detail": "Rico's — order whole belly, not chopped",
        "icon": "utensils"
      }
    ],
    "visaNote": "Visa-free 30 days for UK, US, EU, Japan, Korea",
    "curated": true
  },
  "SG": {
    "id": "singapore",
    "country": "Singapore",
    "iso": "SG",
    "region": "Southeast Asia",
    "filterRegion": "asia",
    "heroHue": "355,75%,48%",
    "tagline": "Hawker heaven in a spotless city-state",
    "duration": {
      "min": 3,
      "max": 5,
      "label": "3–5 days"
    },
    "flightHours": {
      "from": "UK",
      "min": 12,
      "max": 14
    },
    "bestMonths": [
      2,
      3,
      4,
      5,
      6,
      7,
      8
    ],
    "coords": {
      "lat": 1.3521,
      "lng": 103.8198
    },
    "attractions": [
      {
        "name": "Maxwell hawker",
        "detail": "Tian Tian chicken rice — queue before 11:30",
        "icon": "utensils"
      },
      {
        "name": "Gardens by Bay night",
        "detail": "7:45pm light show — lie on Supertree grove lawn",
        "icon": "tree"
      },
      {
        "name": "Haji Lane murals",
        "detail": "Friday evening — boutiques open late, fewer tour groups",
        "icon": "palette"
      }
    ],
    "visaNote": "Visa-free 90 days for UK, US, EU, Australia, Japan",
    "curated": true
  },
  "JP": {
    "id": "japan",
    "country": "Japan",
    "iso": "JP",
    "region": "East Asia",
    "filterRegion": "asia",
    "heroHue": "355,70%,45%",
    "tagline": "Neon, temples, and perfect ramen",
    "duration": {
      "min": 7,
      "max": 14,
      "label": "7–14 days"
    },
    "flightHours": {
      "from": "UK",
      "min": 11,
      "max": 13
    },
    "bestMonths": [
      3,
      4,
      9,
      10,
      11
    ],
    "coords": {
      "lat": 35.6762,
      "lng": 139.6503
    },
    "attractions": [
      {
        "name": "Fushimi Inari",
        "detail": "Hike the full trail before 7am — torii gates empty until 9",
        "icon": "landmark"
      },
      {
        "name": "Shibuya at night",
        "detail": "Cross from the Starbucks corner — second-floor view",
        "icon": "city"
      },
      {
        "name": "Nishiki Market",
        "detail": "Kyoto's five-lane food bazaar — try yuba at 9am",
        "icon": "basket"
      }
    ],
    "visaNote": "Visa-free 90 days for UK, US, EU; e-visa for India, Nigeria",
    "curated": true
  },
  "KR": {
    "id": "south-korea",
    "country": "South Korea",
    "iso": "KR",
    "region": "East Asia",
    "filterRegion": "asia",
    "heroHue": "220,65%,42%",
    "tagline": "K-beauty, BBQ, and 24-hour city energy",
    "duration": {
      "min": 7,
      "max": 12,
      "label": "7–12 days"
    },
    "flightHours": {
      "from": "UK",
      "min": 11,
      "max": 13
    },
    "bestMonths": [
      4,
      5,
      9,
      10
    ],
    "coords": {
      "lat": 37.5665,
      "lng": 126.978
    },
    "attractions": [
      {
        "name": "Gwangjang Market",
        "detail": "Bindaetteok alley — order at stall #6, not the entrance",
        "icon": "utensils"
      },
      {
        "name": "Bukchon Hanok 7am",
        "detail": "Alley 11 viewpoint — residents enforce quiet before 10",
        "icon": "home"
      },
      {
        "name": "DMZ JSA tour",
        "detail": "Book 60 days ahead — passport required, no jeans",
        "icon": "landmark"
      }
    ],
    "visaNote": "Visa-free 90 days for UK, US, EU; e-visa for India, Nigeria",
    "curated": true
  },
  "LK": {
    "id": "sri-lanka",
    "country": "Sri Lanka",
    "iso": "LK",
    "region": "South Asia",
    "filterRegion": "asia",
    "heroHue": "145,55%,35%",
    "tagline": "Tea hills, surf breaks, and train windows",
    "duration": {
      "min": 10,
      "max": 16,
      "label": "10–16 days"
    },
    "flightHours": {
      "from": "UK",
      "min": 10,
      "max": 12
    },
    "bestMonths": [
      12,
      1,
      2,
      3,
      4
    ],
    "coords": {
      "lat": 6.9271,
      "lng": 79.8612
    },
    "attractions": [
      {
        "name": "Kandy to Ella train",
        "detail": "Book 1st class 30 days ahead — sit right side",
        "icon": "train"
      },
      {
        "name": "Sigiriya climb",
        "detail": "Start 6:30am — wasps are calm, views clear by 8",
        "icon": "landmark"
      },
      {
        "name": "Galle Fort sunset",
        "detail": "Rampart walk counter-clockwise — lighthouse at golden hour",
        "icon": "sun"
      }
    ],
    "visaNote": "ETA e-visa online for most; visa-free for Singapore, Maldives nationals",
    "curated": true
  },
  "JO": {
    "id": "jordan",
    "country": "Jordan",
    "iso": "JO",
    "region": "Middle East",
    "filterRegion": "asia",
    "heroHue": "25,55%,38%",
    "tagline": "Petra rose-red canyons and Dead Sea floats",
    "duration": {
      "min": 5,
      "max": 8,
      "label": "5–8 days"
    },
    "flightHours": {
      "from": "UK",
      "min": 5,
      "max": 6
    },
    "bestMonths": [
      3,
      4,
      5,
      10,
      11
    ],
    "coords": {
      "lat": 30.3285,
      "lng": 35.4444
    },
    "attractions": [
      {
        "name": "Petra back door",
        "detail": "Monastery trail from Little Petra — fewer than 5% take it",
        "icon": "landmark"
      },
      {
        "name": "Wadi Rum night camp",
        "detail": "Bedouin bubble tent — stargazing after 10pm no headlights",
        "icon": "tent"
      },
      {
        "name": "Amman mansaf",
        "detail": "Sufra Restaurant — Friday lunch, lamb on shrak bread",
        "icon": "utensils"
      }
    ],
    "visaNote": "Visa on arrival 40 JOD for most; UK/US visa-free with pre-registration",
    "curated": true
  },
  "AE": {
    "id": "uae",
    "country": "UAE",
    "iso": "AE",
    "region": "Middle East",
    "filterRegion": "asia",
    "heroHue": "45,70%,42%",
    "tagline": "Desert dunes and skyline excess",
    "duration": {
      "min": 4,
      "max": 7,
      "label": "4–7 days"
    },
    "flightHours": {
      "from": "UK",
      "min": 6,
      "max": 7
    },
    "bestMonths": [
      11,
      12,
      1,
      2,
      3
    ],
    "coords": {
      "lat": 25.2048,
      "lng": 55.2708
    },
    "attractions": [
      {
        "name": "Al Fahidi dawn walk",
        "detail": "Before 8am — wind towers work, no tour groups",
        "icon": "landmark"
      },
      {
        "name": "Desert safari",
        "detail": "Skip dune bashing — astronomy camp with dinner instead",
        "icon": "tent"
      },
      {
        "name": "Dubai Creek abra",
        "detail": "1 dirham crossing — gold souk side at sunset",
        "icon": "ship"
      }
    ],
    "visaNote": "Visa-free 30–90 days for UK, US, EU; e-visa for India, Nigeria",
    "curated": true
  },
  "MA": {
    "id": "morocco",
    "country": "Morocco",
    "iso": "MA",
    "region": "Africa",
    "filterRegion": "africa",
    "heroHue": "145,50%,32%",
    "tagline": "Medina mazes and Sahara campfires",
    "duration": {
      "min": 7,
      "max": 12,
      "label": "7–12 days"
    },
    "flightHours": {
      "from": "UK",
      "min": 3,
      "max": 4
    },
    "bestMonths": [
      3,
      4,
      5,
      10,
      11
    ],
    "coords": {
      "lat": 31.6295,
      "lng": -7.9811
    },
    "attractions": [
      {
        "name": "Marrakech riad dinner",
        "detail": "Nomad restaurant — book rooftop, tagine at 8pm",
        "icon": "utensils"
      },
      {
        "name": "Fes tanneries",
        "detail": "Terrace at Chouara — mint sprig against the smell",
        "icon": "landmark"
      },
      {
        "name": "Erg Chebbi dunes",
        "detail": "Overnight camp — walk east ridge for silence at dawn",
        "icon": "tent"
      }
    ],
    "visaNote": "Visa-free 90 days for UK, US, EU; visa on arrival for India",
    "curated": true
  },
  "KE": {
    "id": "kenya",
    "country": "Kenya",
    "iso": "KE",
    "region": "Africa",
    "filterRegion": "africa",
    "heroHue": "145,55%,35%",
    "tagline": "Big Five mornings and Indian Ocean afternoons",
    "duration": {
      "min": 8,
      "max": 14,
      "label": "8–14 days"
    },
    "flightHours": {
      "from": "UK",
      "min": 8,
      "max": 9
    },
    "bestMonths": [
      6,
      7,
      8,
      9,
      10
    ],
    "coords": {
      "lat": -1.2921,
      "lng": 36.8219
    },
    "attractions": [
      {
        "name": "Maasai Mara dawn",
        "detail": "Two-game-drive days minimum — cats active 6–9am",
        "icon": "binoculars"
      },
      {
        "name": "Karen Blixen house",
        "detail": "Nairobi — combine with Kazuri bead factory next door",
        "icon": "landmark"
      },
      {
        "name": "Diani beach low tide",
        "detail": "Walk to sandbar at 11am — reef snorkel from shore",
        "icon": "waves"
      }
    ],
    "visaNote": "E-visa online for most; visa on arrival for UK/US with pre-approval",
    "curated": true
  },
  "ZA": {
    "id": "south-africa",
    "country": "South Africa",
    "iso": "ZA",
    "region": "Africa",
    "filterRegion": "africa",
    "heroHue": "145,45%,30%",
    "tagline": "Wine routes, penguins, and dramatic coast",
    "duration": {
      "min": 10,
      "max": 18,
      "label": "10–18 days"
    },
    "flightHours": {
      "from": "UK",
      "min": 11,
      "max": 12
    },
    "bestMonths": [
      9,
      10,
      11,
      12,
      1,
      2,
      3
    ],
    "coords": {
      "lat": -33.9249,
      "lng": 18.4241
    },
    "attractions": [
      {
        "name": "Boulders Beach penguins",
        "detail": "Arrive 8am — boardwalk to viewing deck before buses",
        "icon": "fish"
      },
      {
        "name": "Stellenbosch wine tram",
        "detail": "Route 2 — stop at Delaire Graff for valley view",
        "icon": "wine"
      },
      {
        "name": "Bo-Kaap photo walk",
        "detail": "Wale Street before 9am — respect residents, no drone",
        "icon": "palette"
      }
    ],
    "visaNote": "Visa-free 90 days for UK, US, EU; visa required for India, Nigeria",
    "curated": true
  },
  "MX": {
    "id": "mexico",
    "country": "Mexico",
    "iso": "MX",
    "region": "Americas",
    "filterRegion": "americas",
    "heroHue": "145,55%,35%",
    "tagline": "Tacos, ruins, and Pacific golden hour",
    "duration": {
      "min": 10,
      "max": 16,
      "label": "10–16 days"
    },
    "flightHours": {
      "from": "UK",
      "min": 10,
      "max": 12
    },
    "bestMonths": [
      11,
      12,
      1,
      2,
      3,
      4
    ],
    "coords": {
      "lat": 19.4326,
      "lng": -99.1332
    },
    "attractions": [
      {
        "name": "Teotihuacán balloons",
        "detail": "Sunrise ride — book weekday, not Sunday crowds",
        "icon": "sun"
      },
      {
        "name": "Mercado de San Juan",
        "detail": "Exotic meats — chapulines with lime and chili",
        "icon": "basket"
      },
      {
        "name": "Oaxaca mole tasting",
        "detail": "Casa Oaxaca — seven moles, reserve terrace table",
        "icon": "utensils"
      }
    ],
    "visaNote": "Visa-free 180 days for UK, US, EU; FMM on arrival",
    "curated": true
  },
  "CR": {
    "id": "costa-rica",
    "country": "Costa Rica",
    "iso": "CR",
    "region": "Americas",
    "filterRegion": "americas",
    "heroHue": "145,60%,38%",
    "tagline": "Sloths, zip-lines, and pura vida pace",
    "duration": {
      "min": 8,
      "max": 14,
      "label": "8–14 days"
    },
    "flightHours": {
      "from": "UK",
      "min": 11,
      "max": 13
    },
    "bestMonths": [
      12,
      1,
      2,
      3,
      4
    ],
    "coords": {
      "lat": 9.9281,
      "lng": -84.0907
    },
    "attractions": [
      {
        "name": "Monteverde cloud forest",
        "detail": "6am birding tour — quetzal stakeout at sendero",
        "icon": "binoculars"
      },
      {
        "name": "Manuel Antonio beach",
        "detail": "Park gate at 7am — sloths on main trail loop",
        "icon": "tree"
      },
      {
        "name": "San José Central Market",
        "detail": "Soda tapia — casado lunch under 3,000 colones",
        "icon": "utensils"
      }
    ],
    "visaNote": "Visa-free 90 days for UK, US, EU, Canada",
    "curated": true
  },
  "CO": {
    "id": "colombia",
    "country": "Colombia",
    "iso": "CO",
    "region": "Americas",
    "filterRegion": "americas",
    "heroHue": "45,75%,45%",
    "tagline": "Coffee farms, salsa, and Caribbean colour",
    "duration": {
      "min": 10,
      "max": 16,
      "label": "10–16 days"
    },
    "flightHours": {
      "from": "UK",
      "min": 11,
      "max": 13
    },
    "bestMonths": [
      12,
      1,
      2,
      3,
      7,
      8
    ],
    "coords": {
      "lat": 4.711,
      "lng": -74.0721
    },
    "attractions": [
      {
        "name": "Comuna 13 graffiti",
        "detail": "Escalator tour with local guide — go Thursday morning",
        "icon": "palette"
      },
      {
        "name": "Eje Cafetero finca",
        "detail": "Stay on working farm — pick beans at 6am harvest",
        "icon": "coffee"
      },
      {
        "name": "Cartagena walls",
        "detail": "Sunset from Café del Mar — arrive 45min early for seat",
        "icon": "landmark"
      }
    ],
    "visaNote": "Visa-free 90 days for UK, US, EU; check Permiso de Ingreso for others",
    "curated": true
  },
  "AU": {
    "id": "australia",
    "country": "Australia",
    "iso": "AU",
    "region": "Oceania",
    "filterRegion": "oceania",
    "heroHue": "210,70%,40%",
    "tagline": "Reef dives, bush walks, and flat whites",
    "duration": {
      "min": 14,
      "max": 21,
      "label": "14–21 days"
    },
    "flightHours": {
      "from": "UK",
      "min": 20,
      "max": 23
    },
    "bestMonths": [
      9,
      10,
      11,
      12,
      1,
      2,
      3
    ],
    "coords": {
      "lat": -33.8688,
      "lng": 151.2093
    },
    "attractions": [
      {
        "name": "Great Barrier outer reef",
        "detail": "Day trip to Agincourt — snorkel first, lunch second",
        "icon": "fish"
      },
      {
        "name": "Blue Mountains dawn",
        "detail": "Three Sisters from Echo Point before 7:30am mist",
        "icon": "mountain"
      },
      {
        "name": "Sydney coastal walk",
        "detail": "Bondi→Coogee — start at Icebergs pool end",
        "icon": "waves"
      }
    ],
    "visaNote": "eVisitor for UK/EU (free); ETA for US; e-visa for India, Nigeria",
    "curated": true
  },
  "NZ": {
    "id": "new-zealand",
    "country": "New Zealand",
    "iso": "NZ",
    "region": "Oceania",
    "filterRegion": "oceania",
    "heroHue": "210,65%,38%",
    "tagline": "Fjords, hobbit holes, and empty highways",
    "duration": {
      "min": 14,
      "max": 21,
      "label": "14–21 days"
    },
    "flightHours": {
      "from": "UK",
      "min": 23,
      "max": 26
    },
    "bestMonths": [
      12,
      1,
      2,
      3,
      4
    ],
    "coords": {
      "lat": -41.2865,
      "lng": 174.7762
    },
    "attractions": [
      {
        "name": "Milford Sound kayak",
        "detail": "Book dawn slot — waterfalls 10x after rain",
        "icon": "waves"
      },
      {
        "name": "Hobbiton evening",
        "detail": "Last tour of the day — golden light on Party Tree",
        "icon": "tree"
      },
      {
        "name": "Queenstown Fergburger",
        "detail": "Order to takeaway — eat at lake pier, not the queue",
        "icon": "utensils"
      }
    ],
    "visaNote": "NZeTA for UK/US (small fee); visa required for India, Nigeria",
    "curated": true
  }
};
