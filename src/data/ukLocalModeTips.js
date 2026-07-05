/**
 * What to do in each home city by preferred transport mode.
 * Shown when travelling from a city to itself (e.g. London + bicycle).
 * @typedef {{
 *   headline: string,
 *   hire?: string,
 *   ideas: string[],
 *   routes?: string[],
 * }} UkLocalModeTips
 */

/** @type {Record<string, Partial<Record<string, UkLocalModeTips>>>} */
export const UK_LOCAL_MODE_TIPS = {
  london: {
    bicycle: {
      headline: 'Cycle London',
      hire: 'Santander Cycles from £1.65/30 min · docks across Zones 1–3',
      ideas: [
        'Regent\'s Canal: Little Venice to Camden Market',
        'Thames Path through Battersea Park and Greenwich',
        'Richmond Park loop — car-free at weekends',
        'Victoria Park and Queen Elizabeth Olympic Park circuits',
      ],
      routes: ['Cycleway 4 (Embankment–Tower)', 'Quietway 1 (Waterloo–Greenwich)'],
    },
    train: {
      headline: 'Explore by Tube & rail',
      hire: 'Oyster/contactless caps daily travel · off-peak saves on National Rail',
      ideas: [
        'Circle & District lines for museums in South Kensington',
        'Overground to Hampstead Heath or Peckham Rye',
        'Elizabeth line to Stratford or Heathrow without changing',
        'Thameslink cross-London without entering Zone 1',
      ],
    },
    car: {
      headline: 'Drive London carefully',
      hire: 'ULEZ £12.50/day · Congestion Charge £15 (Mon–Fri 07:00–18:00)',
      ideas: [
        'Park & ride at Epping or Watford — Tube in',
        'Evening drives along Embankment when traffic eases',
        'Kew Gardens and Richmond — easier by car than central',
        'Use JustPark or NCP pre-book for West End visits',
      ],
    },
    coach: {
      headline: 'Coach hubs & day trips out',
      hire: 'Victoria Coach Station · National Express & Megabus',
      ideas: [
        'Day coaches to Oxford, Cambridge, or Brighton from Victoria',
        'Green Line to Windsor if you want a car-free castle day',
        'Use coach for outbound — Tube back if you miss the last bus',
        'Book advance for weekend Oxford/Cambridge fares under £10',
      ],
    },
    walk: {
      headline: 'Walk London',
      ideas: [
        'South Bank: Westminster Bridge to Tower Bridge',
        'City of London: St Paul\'s → Leadenhall → Tower of London',
        'Hampstead Heath Parliament Hill viewpoint loop',
        'Greenwich foot tunnel and Cutty Sark riverside',
      ],
      routes: ['Jubilee Greenway sections', 'Capital Ring (Wimbledon–Osterley)'],
    },
  },
  manchester: {
    bicycle: {
      headline: 'Cycle Manchester',
      hire: 'Beryl Bikes & Bee Network cycle hire across the city',
      ideas: [
        'Fallowfield Loop — traffic-free to Chorlton',
        'Castlefield canals to MediaCityUK via Salford Quays',
        'Heaton Park perimeter ride',
        'Oxford Road bus lane cycle route to university quarter',
      ],
      routes: ['NCN 66 through Salford', 'Trans Pennine Trail westbound'],
    },
    train: {
      headline: 'Manchester by tram & rail',
      hire: 'Bee Network contactless on Metrolink · day tickets from £7',
      ideas: [
        'Metrolink to MediaCityUK, Altrincham, or Bury',
        'Train to Liverpool or Leeds in under an hour',
        'Piccadilly–Oxford Road–Deansgate core for football & gigs',
        'Victoria services to Hebden Bridge and Peak District gateways',
      ],
    },
    car: {
      headline: 'Drive Greater Manchester',
      hire: 'Clean Air Zone charges non-compliant vehicles in city centre',
      ideas: [
        'M60 ring for airport and Trafford Centre',
        'Peak District day trips via A6 through Stockport',
        'Park at Salford Quays for MediaCity — cheaper than centre',
        'Evening concerts: Ashton Moss park & ride to Etihad tram',
      ],
    },
    coach: {
      headline: 'Coach from Manchester',
      hire: 'Chorlton Street Coach Station · National Express hub',
      ideas: [
        'Direct coaches to London, Liverpool, and Edinburgh',
        'Megabus from Shudehill for budget hops to Leeds or Birmingham',
        'Airport coaches from coach station if trains are disrupted',
        'Match days: book early — Chorlton Street fills fast',
      ],
    },
    walk: {
      headline: 'Walk Manchester',
      ideas: [
        'Northern Quarter street art and indie shops',
        'Castlefield canals and Roman fort ruins',
        'St Peter\'s Square to Deansgate cotton heritage trail',
        'Heaton Park lakeside loop on a clear day',
      ],
    },
  },
  birmingham: {
    bicycle: {
      headline: 'Cycle Birmingham',
      hire: 'Beryl Bikes at New Street, Digbeth, and Edgbaston',
      ideas: [
        'Canal towpaths: Gas Street Basin to Brindleyplace',
        'Sutton Park — 2,000 acres of traffic-free riding',
        'Rea Valley Route south toward Bournville',
        'Edgbaston Reservoir flat loop for beginners',
      ],
      routes: ['NCN 5 through city centre', 'Rea Valley Greenway'],
    },
    train: {
      headline: 'Birmingham by rail',
      hire: 'Contactless at New Street & Moor Street · West Midlands day ranger',
      ideas: [
        'Snow Hill line to Stratford-upon-Avon day trip',
        'New Street to Jewellery Quarter — one stop, walk the workshops',
        'CrossCountry to Oxford or Bristol without London',
        'Tram extension to Edgbaston for cricket ground access',
      ],
    },
    car: {
      headline: 'Drive the West Midlands',
      ideas: [
        'M42/M6 for Cotswolds and Peak District gateways',
        'Cadbury World and Bournville — easier by car',
        'Airport via A45 — avoid city centre at rush hour',
        'Use NCP multi-storey at Bullring for shopping days',
      ],
    },
    coach: {
      headline: 'Coach from Birmingham',
      hire: 'Birmingham Coach Station (Mill Lane) · Digbeth Megabus',
      ideas: [
        'National Express to London, Manchester, and Cardiff',
        'Budget Megabus from Digbeth to major cities',
        'Coach to Stratford-upon-Avon if trains are full',
        'Combine with train for airport if parking is costly',
      ],
    },
    walk: {
      headline: 'Walk Birmingham',
      ideas: [
        'Canal Ring: 35-mile network through the city centre',
        'Jewellery Quarter artisan studios and cafes',
        'Bullring to Custard Factory via Digbeth street food',
        'Library of Birmingham rooftop garden views',
      ],
    },
  },
  leeds: {
    bicycle: {
      headline: 'Cycle Leeds',
      hire: 'Beryl Bikes at station, university, and waterfront',
      ideas: [
        'Leeds & Liverpool Canal towpath to Saltaire',
        'Meanwood Valley Trail to Golden Acre Park',
        'Roundhay Park outer loop — mostly flat',
        'Aire Valley Towpath toward Kirkstall Abbey',
      ],
      routes: ['NCN 66 east toward York', 'Aire Valley Greenway'],
    },
    train: {
      headline: 'Leeds by rail',
      ideas: [
        'Harrogate and York in under 30 minutes',
        'Northern services to Ilkley and Skipton (Dales gateway)',
        'CrossCountry to Edinburgh or Bristol',
        'Station subway to Trinity Leeds without crossing roads',
      ],
    },
    car: {
      headline: 'Drive from Leeds',
      ideas: [
        'A65 to Yorkshire Dales — Malham Cove day trip',
        'M1 south to Peak District in 90 minutes',
        'Park & ride at Elland Road or Temple Green for match days',
        'Roundhay Park has ample free parking off Princes Avenue',
      ],
    },
    coach: {
      headline: 'Coach from Leeds',
      hire: 'Leeds City Bus Station · National Express',
      ideas: [
        'Direct coaches to London, Manchester, and Newcastle',
        'Megabus to major cities from city centre stops',
        'Saltaire or Haworth — train is usually quicker than coach',
        'Book advance for weekend London fares',
      ],
    },
    walk: {
      headline: 'Walk Leeds',
      ideas: [
        'River Aire waterfront: Granary Wharf to Royal Armouries',
        'Victoria Quarter arcades and arcaded passages',
        'Kirkstall Abbey ruins along the towpath',
        'Roundhay Park lakes and Tropical World',
      ],
    },
  },
  bristol: {
    bicycle: {
      headline: 'Cycle Bristol',
      hire: 'YoBike & Beryl across the centre · better Bike at Temple Meads',
      ideas: [
        'Bristol & Bath Railway Path — traffic-free to Bath',
        'Harbourside loop around SS Great Britain',
        'Ashton Court deer park trails',
        'Clifton Suspension Bridge via the gorge (dismount on bridge)',
      ],
      routes: ['NCN 4 toward Bath', 'Festival Way to Yatton'],
    },
    train: {
      headline: 'Bristol by rail',
      ideas: [
        'GWR to Bath in 12 minutes',
        'Temple Meads to Clifton — walk or short bus up the hill',
        'CrossCountry to Birmingham or Exeter',
        'Severn Beach line for cheap harbour views',
      ],
    },
    car: {
      headline: 'Drive Bristol & surrounds',
      ideas: [
        'Cheddar Gorge and Mendips — car useful',
        'Clifton Village parking is tight — use Park & Ride at Long Ashton',
        'Airport via A38 — avoid centre at rush hour',
        'Street parking free after 17:00 in some residential zones',
      ],
    },
    coach: {
      headline: 'Coach from Bristol',
      hire: 'Bristol Bus & Coach Station (Marlborough St)',
      ideas: [
        'National Express to London, Cardiff, and Birmingham',
        'Airport Flyer coach if train times don\'t suit',
        'Bath is faster by train — save coach for longer hops',
        'Megabus from Bond Street for budget routes',
      ],
    },
    walk: {
      headline: 'Walk Bristol',
      ideas: [
        'Harbourside: M Shed to Arnolfini galleries',
        'Clifton Village and Suspension Bridge viewpoint',
        'St Nicholas Market lunch and street food crawl',
        'Brandon Hill and Cabot Tower panorama',
      ],
    },
  },
  liverpool: {
    bicycle: {
      headline: 'Cycle Liverpool',
      hire: 'CityBike stations at waterfront and university',
      ideas: [
        'Otterspool Promenade along the Mersey',
        'Leeds & Liverpool Canal toward Aintree',
        'Sefton Park loop past the Palm House',
        'Waterfront to Wirral via Queensway Tunnel (bike allowed, toll applies)',
      ],
      routes: ['NCN 56 north toward Southport', 'Trans Pennine Trail'],
    },
    train: {
      headline: 'Liverpool by Merseyrail',
      hire: 'Merseyrail day ticket covers underground loop',
      ideas: [
        'Ferry from Pier Head — rail to Wirral and Chester',
        'Merseyrail to Formby Beach and Crosby (Another Place statues)',
        'Lime Street to Manchester in ~35 minutes',
        'Underground loop: James Street → Moorfields without changing',
      ],
    },
    car: {
      headline: 'Drive Liverpool & Wirral',
      ideas: [
        'Wirral Peninsula — Port Sunlight and coastal villages',
        'Peak District or Lake District via M62 eastbound',
        'Waterfront Q-Park for Albert Dock — book ahead',
        'Tunnel toll for bikes/cars to Wirral — check payment',
      ],
    },
    coach: {
      headline: 'Coach from Liverpool',
      hire: 'Liverpool ONE Bus Station',
      ideas: [
        'National Express to London and Manchester',
        'Coach to Chester if Merseyrail is disrupted',
        'Airport coaches from city centre',
        'Combine with ferry for a different Wirral approach',
      ],
    },
    walk: {
      headline: 'Walk Liverpool',
      ideas: [
        'Albert Dock: Beatles Story to Tate Liverpool',
        'Pier Head Three Graces and ferry terminal',
        'Mathew Street and Cavern Club area',
        'Sefton Park autumn colour walk',
      ],
    },
  },
  newcastle: {
    bicycle: {
      headline: 'Cycle Newcastle',
      hire: 'Mobike-style hire at Quayside and university campuses',
      ideas: [
        'Quayside loop — Millennium Bridge to Baltic',
        'Ouseburn Valley to Jesmond Dene traffic-free sections',
        'Coast & Castles route toward Tynemouth',
        'Town Moor flat circuits on a Sunday morning',
      ],
      routes: ['NCN 1 toward Tynemouth', 'Waggonways toward the coast'],
    },
    train: {
      headline: 'Newcastle by Metro & rail',
      hire: 'Tyne & Wear Metro day ticket from £6.40',
      ideas: [
        'Metro to Tynemouth beach and fish market',
        'Metro to Sunderland and Stadium of Light',
        'LNER to Edinburgh in 90 minutes',
        'Central Station to Quayside — 10-minute downhill walk',
      ],
    },
    car: {
      headline: 'Drive North East',
      ideas: [
        'Northumberland coast — Bamburgh and Alnwick day trips',
        'Hadrian\'s Wall via A69 west',
        'Metrocentre — park free, Metro in if centre is busy',
        'Quayside parking expensive — use Quayside multi-storey off-peak',
      ],
    },
    coach: {
      headline: 'Coach from Newcastle',
      hire: 'Newcastle Coach Station (St James Boulevard)',
      ideas: [
        'National Express to London, Edinburgh, and Manchester',
        'Megabus from John Dobson Street',
        'Coast destinations — train to Alnmouth often quicker',
        'Airport shuttle if Metro is closed overnight',
      ],
    },
    walk: {
      headline: 'Walk Newcastle',
      ideas: [
        'Quayside Sunday market and Baltic views',
        'Grey Street to Grey\'s Monument and Theatre Royal',
        'Jesmond Dene waterfall and pets\' corner',
        'Town Wall remains near Chinatown',
      ],
    },
  },
  sheffield: {
    bicycle: {
      headline: 'Cycle Sheffield',
      hire: 'Beryl Bikes at station, Devonshire Quarter, and Kelham',
      ideas: [
        'Five Weirs Walk along the River Don',
        'Rivelin Valley nature trail — gentle gradients',
        'Trans Pennine Trail toward Meadowhall (flat)',
        'Peak District edge: Lodge Moor climb for fit riders',
      ],
      routes: ['NCN 627 toward Rotherham', 'Five Weirs Walk'],
    },
    train: {
      headline: 'Sheffield by rail',
      ideas: [
        'Hope Valley line to Edale and Peak District villages',
        'Tram-train to Rotherham and Meadowhall',
        'East Midlands Railway to London St Pancras',
        'Station Street tram stop for arena and university',
      ],
    },
    car: {
      headline: 'Drive the Peak gateway',
      ideas: [
        'Snake Pass or Hope Valley — stunning but busy weekends',
        'Chatsworth House via A619',
        'Meadowhall park & ride avoids city centre congestion',
        'Kelham Island — street parking evenings only',
      ],
    },
    coach: {
      headline: 'Coach from Sheffield',
      hire: 'Sheffield Interchange (Pond Street)',
      ideas: [
        'National Express to London and Manchester',
        'Coach to Nottingham if cross-country trains are full',
        'Peak villages — train to Hope then bus is more reliable',
        'Interchange adjoins station for easy train fallback',
      ],
    },
    walk: {
      headline: 'Walk Sheffield',
      ideas: [
        'Kelham Island industrial heritage and breweries',
        'Winter Garden and Millennium Gallery',
        'Endcliffe Park to Forge Dam cafe',
        'Sheaf Valley Park elevated city views',
      ],
    },
  },
  edinburgh: {
    bicycle: {
      headline: 'Cycle Edinburgh',
      hire: 'Just Eat Cycles at Meadows, Leith, and George Street',
      ideas: [
        'Union Canal towpath to Ratho or Falkirk Wheel day trip',
        'Portobello Promenade along the Firth of Forth',
        'Innocent Railway tunnel path to Duddingston',
        'Arthur\'s Seat base loop — walk bikes on steep sections',
      ],
      routes: ['NCN 1 toward North Berwick', 'Union Canal towpath'],
    },
    train: {
      headline: 'Edinburgh by rail',
      ideas: [
        'Waverley in the heart of the city — no taxi needed',
        'ScotRail to North Berwick and Dunbar coast',
        'LNER to London in ~4h30',
        'Haymarket for west-end hotels and Murrayfield',
      ],
    },
    car: {
      headline: 'Drive Edinburgh & Lothian',
      ideas: [
        'Parking NCP under the castle is pricey — use Park & Ride at Ingliston',
        'Coastal villages — North Berwick faster by train',
        'Highland road trips start on A9 northbound',
        'Old Town permits only — check zone before driving in',
      ],
    },
    coach: {
      headline: 'Coach from Edinburgh',
      hire: 'Edinburgh Bus Station (Elder Street)',
      ideas: [
        'Scottish Citylink to Glasgow, Inverness, and Skye gateways',
        'National Express overnight to London',
        'Airport coaches from Waverley Bridge',
        'Festival season — book coaches weeks ahead',
      ],
    },
    walk: {
      headline: 'Walk Edinburgh',
      ideas: [
        'Royal Mile: Castle to Holyrood Palace',
        'Arthur\'s Seat summit for city panorama',
        'Dean Village and Water of Leith walkway',
        'Leith Shore restaurants and Royal Yacht Britannia',
      ],
    },
  },
  glasgow: {
    bicycle: {
      headline: 'Cycle Glasgow',
      hire: 'Nextbike stations across West End and city centre',
      ideas: [
        'Forth & Clyde Canal toward Speirs Wharf',
        'Pollok Country Park — traffic-free miles',
        'Clyde Walkway to Glasgow Green',
        'Loch Lomond day ride — train to Balloch then cycle',
      ],
      routes: ['NCN 7 toward Loch Lomond', 'Clyde Walkway'],
    },
    train: {
      headline: 'Glasgow by rail',
      ideas: [
        'ScotRail to Loch Lomond (Balloch) and Ayr coast',
        'Central Station low-level for suburban hops',
        'Queen Street to Edinburgh in 50 minutes',
        'Subway clockwork orange — Buchanan St to West End',
      ],
    },
    car: {
      headline: 'Drive west Scotland',
      ideas: [
        'Loch Lomond via A82 — stunning but narrow in places',
        'Isle of Arran — train to Ardrossan then ferry (car on ferry)',
        'Braehead park & ride for city shopping',
        'Merchant City car parks fill on gig nights',
      ],
    },
    coach: {
      headline: 'Coach from Glasgow',
      hire: 'Buchanan Bus Station',
      ideas: [
        'Scottish Citylink to Fort William and Skye',
        'National Express to Manchester and London',
        'Airport Citylink from Buchanan Street',
        'Highland tours — coach often beats train for direct routes',
      ],
    },
    walk: {
      headline: 'Walk Glasgow',
      ideas: [
        'Kelvingrove Art Gallery and University Gothic architecture',
        'Merchant City food and design quarter',
        'Riverside Museum and Tall Ship on the Clyde',
        'Necropolis hilltop views behind the cathedral',
      ],
    },
  },
  cardiff: {
    bicycle: {
      headline: 'Cycle Cardiff',
      hire: 'Nextbike at Bay, centre, and Cathays',
      ideas: [
        'Cardiff Bay Barrage loop — flat and scenic',
        'Taff Trail north toward Castell Coch',
        'Roath Park lake circuit',
        'Penarth coastal ride via Cardiff Bay trail',
      ],
      routes: ['Taff Trail (NCN 8)', 'Cardiff Bay Trail'],
    },
    train: {
      headline: 'Cardiff by rail',
      ideas: [
        'Valleys lines to Brecon Beacons gateways',
        'GWR to Bristol in under an hour',
        'Bay shuttle from Queen Street to Mermaid Quay',
        'Central Station to Principality Stadium — flat 10-minute walk',
      ],
    },
    car: {
      headline: 'Drive South Wales',
      ideas: [
        'Brecon Beacons via A470 — classic mountain road',
        'Gower Peninsula — car useful for beaches',
        'Park at Cardiff East for stadium events',
        'Bay car parks for Doctor Who and Wales Millennium Centre',
      ],
    },
    coach: {
      headline: 'Coach from Cardiff',
      hire: 'Cardiff Central Bus Station',
      ideas: [
        'National Express to London, Birmingham, and Bristol',
        'Megabus to major English cities',
        'Tenby and Pembrokeshire — coach in summer only',
        'Combine train to Newport for wider coach options',
      ],
    },
    walk: {
      headline: 'Walk Cardiff',
      ideas: [
        'Cardiff Bay: Senedd to Norwegian Church',
        'Castle and Victorian arcades shopping loop',
        'Bute Park along the Taff from the castle',
        'Roath Park lake and conservatory',
      ],
    },
  },
  belfast: {
    bicycle: {
      headline: 'Cycle Belfast',
      hire: 'Belfast Bikes docking stations across the centre',
      ideas: [
        'Lagan Towpath to Lisburn — flat and traffic-free',
        'Titanic Quarter waterfront loop',
        'Stormont Estate grounds on a quiet morning',
        'North Coast — train to Portrush then coastal cycle',
      ],
      routes: ['Lagan Towpath', 'NCN 99 toward Bangor'],
    },
    train: {
      headline: 'Belfast by rail',
      ideas: [
        'Translink to Bangor and north coast beaches',
        'Enterprise train to Dublin in ~2 hours',
        'Glider BRT across east–west corridors',
        'Great Victoria Street for Europa Hotel and bars',
      ],
    },
    car: {
      headline: 'Drive Northern Ireland',
      ideas: [
        'Causeway Coastal Route — Giant\'s Causeway day trip',
        'Mourne Mountains via A2 south',
        'Titanic Quarter Q-Park for museum visits',
        'City centre one-way systems — plan before driving in',
      ],
    },
    coach: {
      headline: 'Coach from Belfast',
      hire: 'Europa Bus Centre',
      ideas: [
        'Goldline coaches to Derry/Londonderry and Coleraine',
        'Translink express to Dublin Airport',
        'Giants Causeway tours by coach from city centre',
        'Enterprise train often beats coach to Dublin',
      ],
    },
    walk: {
      headline: 'Walk Belfast',
      ideas: [
        'Titanic Quarter: museum to SS Nomadic',
        'Cathedral Quarter murals and pubs',
        'Botanic Gardens and Ulster Museum',
        'St George\'s Market weekend food stalls',
      ],
    },
  },
};

/**
 * @param {string} cityId
 * @param {string} mode
 * @returns {UkLocalModeTips|null}
 */
export function getUkLocalModeTips(cityId, mode) {
  return UK_LOCAL_MODE_TIPS[cityId]?.[mode] ?? null;
}
