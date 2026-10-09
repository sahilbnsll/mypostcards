/**
 * Sample journal.
 *
 * Stand-in content so the site is complete before real postcards exist. The photographs
 * are from Unsplash (free to use) and are NOT my own travel history, so nothing here
 * states a date or claims a trip took place. Every entity carries `isSample: true`.
 *
 * This file is also the source for `npm run seed`, which pushes it into Supabase.
 * Keep it self-contained: type imports only, no path aliases, so Node can run it directly.
 */
import type {
  Cafe,
  Category,
  Destination,
  ImageAsset,
  Journal,
  LocationInfo,
  Postcard,
  Story,
  Trip,
} from "../types";

const UNSPLASH = "https://images.unsplash.com";
/** Origin size: large enough for retina hero use, small enough for the optimizer to fetch fast. */
const ORIGIN_QUERY = "auto=format&fit=max&w=2000&q=80";

/** `ratio` is the measured width/height of the original photograph. */
function photo(id: string, ratio: number, color: string, alt: string): ImageAsset {
  return {
    src: `${UNSPLASH}/photo-${id}?${ORIGIN_QUERY}`,
    alt,
    width: 2000,
    height: Math.round(2000 / ratio),
    color,
  };
}

const P = {
  aboveClouds: photo("1506905925346-21bda4d32df4", 1.5, "#706f7b", "Jagged snow peaks rising above a sea of cloud at sunrise, the sky fading from pink to blue"),
  braiesTurquoise: photo("1501785888041-af3ef285b470", 1.5, "#6c938f", "A small wooden rowboat on turquoise alpine water with limestone peaks behind"),
  braiesBoat: photo("1476514525535-07fb3b4ae5f1", 1.5, "#737569", "The bow of a wooden rowboat pointing across a green mountain lake toward grey peaks"),
  nightRidge: photo("1519681393784-d120267933ba", 1.5, "#263d5a", "The Milky Way arching over snow-capped mountains and a dark pine forest"),
  fujiPagoda: photo("1526481280693-3bfa7568e0f3", 1.5, "#647984", "A red five-storey pagoda in a green hillside with Mount Fuji rising over the town beyond"),
  tajReflection: photo("1524492412937-b28074a5d7da", 1.5, "#8a9196", "The Taj Mahal at dawn, mirrored in a long reflecting pool lined with clipped cypresses"),
  tajArch: photo("1548013146-72479768bada", 1.51, "#68685e", "The Taj Mahal framed through a carved sandstone archway, one visitor standing in the courtyard"),
  baliTemple: photo("1537996194471-e657df975ab4", 0.75, "#a9a595", "A tiered Balinese temple on a misty lake, its reflection stretching down the water"),
  borobudur: photo("1596402184320-417e7178b2cd", 1.5, "#826251", "Bell-shaped stupas rising through morning haze at Borobudur"),
  cliffSteps: photo("1533105079780-92b9be482077", 0.67, "#a1c5da", "White steps descending between whitewashed walls toward the deep blue Aegean"),
  balloons: photo("1530789253388-582c481c54b0", 1.5, "#508e79", "Two travellers watching dozens of hot-air balloons drift over a rocky valley at dawn"),
  kyotoStreet: photo("1493976040374-85c8e12f0c0e", 1.5, "#484241", "A wooden-fronted lane at dusk with a pagoda in the distance and a woman in a kimono walking away"),
  lanternAlley: photo("1528360983277-13d401cdc186", 1.5, "#0b1a35", "A narrow night alley lit by a glowing red paper lantern and neon signs"),
  neonCrossing: photo("1540959733332-eab4deabeeaf", 1.54, "#597c90", "A crowded pedestrian crossing under towering neon signs, the street slick with colour"),
  redLanterns: photo("1644088302289-29e0a0c6a36b", 1.49, "#966055", "Rows of red paper lanterns strung across a city street between old buildings"),
  blueStairs: photo("1559617519-66f3814bfdb3", 1.5, "#708fb7", "A staircase winding up between blue-washed walls, potted plants on the steps"),
  whiteDoor: photo("1558286598-73a6be5c16b0", 1.5, "#aab7c9", "A bright blue door in a whitewashed wall, crowded with terracotta pots"),
  yellowCab: photo("1518614768202-663a3a0ecf59", 1.5, "#2e3e3b", "A yellow taxi waiting on a dim street while pedestrians cross behind it"),
  eiffelDusk: photo("1502602898657-3e91760cbb34", 1.5, "#817c88", "The Eiffel Tower against a lilac dusk sky with the river in the foreground"),
  alexandreBridge: photo("1499856871958-5b9627545d1a", 1.42, "#6d5f70", "Ornate gilded lamps along a stone bridge at blue hour, the river below"),
  amsterdamCanal: photo("1534351590666-13e3e96b5017", 1.5, "#b5b7af", "A tree-lined canal with moored boats and narrow townhouses under a bright sky"),
  portoRiver: photo("1555881400-74d7acaacd8b", 1.5, "#7b8889", "Colourful riverside houses stacked up a hill above moored boats on the water"),
  veniceRialto: photo("1523906834658-6e24ef2386f9", 0.66, "#768385", "A gondola on the canal in front of the arched stone Rialto Bridge"),
  londonBend: photo("1513635269975-59663e0ac1ad", 1.5, "#767a7a", "An aerial view of the river curving past Tower Bridge and the city beyond"),
  midtownGold: photo("1480714378408-67cf0d13bc1b", 1.5, "#7c7b78", "Glass towers lit gold by low sun between city blocks"),
  redRockRoad: photo("1469854523086-cc02fe5d8800", 1.42, "#b09b91", "A yellow camper van parked on a desert road beneath red sandstone cliffs"),
  waterfall: photo("1433086966358-54859d0ed716", 0.67, "#54633c", "A tall waterfall dropping through moss-green cliffs, a small footbridge across its midpoint"),
  highlandRidge: photo("1470071459604-3b5ec3a7fe05", 1.68, "#727464", "Green highland ridges under low cloud with a band of golden light on the horizon"),
  forestPath: photo("1441974231531-c6227db76b6e", 1.5, "#42432f", "Sunlight falling through tall trunks onto a quiet forest path"),
  palmParasol: photo("1519046904884-53103b34b206", 1.5, "#88a4a7", "A palm tree and a thatched parasol on pale sand beside a calm turquoise bay"),
  shoreline: photo("1507525428034-b723cf961d3e", 1.5, "#a2b4b3", "A wide empty beach at sunrise, foam from the last wave running up the sand"),
  latteCheers: photo("1495474472287-4d71bcdd2085", 1.5, "#5a4d3e", "Three hands toasting two latte-art cups and a black coffee over a wooden table"),
  flatWhites: photo("1509042239860-f550ce710b93", 0.67, "#716c58", "Two flat whites with leaf latte art on a wooden table beside a trailing plant"),
  plantCafe: photo("1554118811-1e0d58224f24", 1.46, "#6a6a62", "A café with wire chairs, a chalkboard counter and a large plant by the window"),
  coffeeFlatlay: photo("1511920170033-f8396924c348", 0.67, "#878986", "A latte, ground coffee and whole beans in portafilters, seen from above on a grey table"),
  greenhouseCafe: photo("1445116572660-236099ec97a0", 1.5, "#747368", "A round café table with a French press by a glass wall dripping with greenery"),
  pourOver: photo("1442512595331-e89e73853f31", 1.5, "#3f4645", "A barista pouring from a gooseneck kettle over a pour-over dripper, glassware behind"),
  brightCounter: photo("1453614512568-c4024d13c247", 1.78, "#69625b", "A bright café counter with an espresso machine, pendant bulbs and shelves of cups"),
  longTables: photo("1521017432531-fbd92d768814", 1.5, "#4b554c", "A busy café interior with long wooden tables and people working by the windows"),
  concreteCafe: photo("1493857671505-72967e2e2760", 1.5, "#796f5b", "A concrete-walled café with a menu board and two bicycles leaning inside"),
  blueCup: photo("1485808191679-5f86510681a2", 0.67, "#4b4c40", "A white espresso cup on a blue saucer against a warm, blurred background"),
  pancakes: photo("1567620905732-2d1ec7ab7445", 0.83, "#433f36", "A tall stack of pancakes with syrup being poured over it, dark moody background"),
  saladJuice: photo("1540189549336-e6e99c3679fe", 0.67, "#524d35", "A colourful salad in a dark bowl beside two glasses of orange juice and a fork"),
  mezze: photo("1476224203421-9ac39bcb3327", 1.5, "#72614b", "A wooden board of grilled halloumi, salad and bread with a glass of beer behind"),
  breakfastSpread: photo("1493770348161-369560ae357d", 1.5, "#dfdbd5", "A bright breakfast table seen from above, with fruit bowls, toast and coffee"),
  pastaSalad: photo("1473093295043-cdd812d0e601", 1.5, "#a69b62", "A white bowl of bow-tie pasta with pesto, tomatoes and rocket"),
  pizza: photo("1565299624946-b28f40a0ae38", 0.83, "#735533", "A sliced pizza on a wooden board, scattered with basil and charred crust edges"),
  candlelitTable: photo("1414235077428-338989a2e8c0", 1.5, "#736e67", "A candlelit dining table laid with plated food and wine glasses"),
};

const CREDIT = { credit: "Unsplash", creditUrl: "https://unsplash.com" } as const;

type PostcardInput = Omit<
  Postcard,
  "tags" | "featured" | "isSample" | "sortOrder" | "credit" | "creditUrl" | "location"
> & {
  tags?: string[];
  featured?: boolean;
  location?: LocationInfo;
};

function postcards(rows: PostcardInput[]): Postcard[] {
  return rows.map((row, index) => ({
    ...row,
    location: row.location ?? {},
    tags: row.tags ?? [],
    featured: row.featured ?? false,
    isSample: true,
    sortOrder: index + 1,
    ...CREDIT,
  }));
}

function row(
  slug: string,
  title: string,
  category: Category,
  image: ImageAsset,
  caption: string,
  extra: Partial<PostcardInput> = {},
): PostcardInput {
  return { slug, title, category, image, caption, ...extra };
}

const samplePostcards: Postcard[] = postcards([
  row("above-the-clouds", "Above the clouds", "travel", P.aboveClouds, "A cloud sea filling the valley below the high peaks.", {
    location: { placeName: "Valais", region: "Valais", country: "Switzerland" },
    tripSlug: "alpine-light",
    destinationSlug: "alps",
    note: "Wake early. The valley is worth it.",
    tags: ["alps", "sunrise", "mountains"],
    featured: true,
  }),
  row("braies-turquoise", "Turquoise at Braies", "travel", P.braiesTurquoise, "Green-blue water, a lone rowboat, limestone walls.", {
    location: { placeName: "Lago di Braies", region: "Dolomites", country: "Italy", coordinates: { lat: 46.694, lng: 12.086 } },
    tripSlug: "alpine-light",
    destinationSlug: "alps",
    tags: ["alps", "lake", "water"],
    featured: true,
  }),
  row("braies-rowboat", "Bow on the lake", "travel", P.braiesBoat, "The boat's nose points at the far shore.", {
    location: { placeName: "Lago di Braies", region: "Dolomites", country: "Italy", coordinates: { lat: 46.694, lng: 12.086 } },
    tripSlug: "alpine-light",
    destinationSlug: "alps",
    tags: ["alps", "lake", "boat"],
  }),
  row("night-ridge", "Stars over the ridge", "travel", P.nightRidge, "A clear night, the galaxy leaning on the mountains.", {
    tripSlug: "alpine-light",
    destinationSlug: "alps",
    note: "Cold hands, worth it.",
    tags: ["stars", "mountains", "night"],
  }),
  row("fuji-pagoda", "Pagoda and the mountain", "travel", P.fujiPagoda, "A red pagoda on the hill, Fuji standing over the town.", {
    location: { placeName: "Chureito Pagoda", city: "Fujiyoshida", country: "Japan", coordinates: { lat: 35.502, lng: 138.801 } },
    tripSlug: "paper-lanterns",
    destinationSlug: "japan",
    tags: ["japan", "pagoda", "mountain"],
    featured: true,
  }),
  row("taj-reflection", "Long reflection", "travel", P.tajReflection, "The pool doubles the dome in the first light.", {
    location: { placeName: "Taj Mahal", city: "Agra", country: "India", coordinates: { lat: 27.175, lng: 78.042 } },
    tripSlug: "subcontinent-days",
    destinationSlug: "india",
    tags: ["india", "monument", "dawn"],
  }),
  row("taj-arch", "Through the arch", "travel", P.tajArch, "Sandstone makes a frame for the marble.", {
    location: { placeName: "Taj Mahal", city: "Agra", country: "India", coordinates: { lat: 27.175, lng: 78.042 } },
    tripSlug: "subcontinent-days",
    destinationSlug: "india",
    tags: ["india", "monument", "architecture"],
  }),
  row("temple-on-the-water", "Temple on the water", "travel", P.baliTemple, "Tiered roofs and their reflection in the lake haze.", {
    location: { placeName: "Pura Ulun Danu Bratan", region: "Bali", country: "Indonesia", coordinates: { lat: -8.275, lng: 115.167 } },
    tripSlug: "island-temples",
    destinationSlug: "indonesia",
    tags: ["bali", "temple", "mist"],
    featured: true,
  }),
  row("borobudur-haze", "Stupas in the haze", "travel", P.borobudur, "Stone bells rising through the morning mist.", {
    location: { placeName: "Borobudur", region: "Java", country: "Indonesia", coordinates: { lat: -7.608, lng: 110.204 } },
    tripSlug: "island-temples",
    destinationSlug: "indonesia",
    tags: ["java", "temple", "mist"],
  }),
  row("cliffside-steps", "Steps to the blue", "travel", P.cliffSteps, "White walls, white steps, and then the sea.", {
    location: { placeName: "Oia", region: "Santorini", country: "Greece", coordinates: { lat: 36.462, lng: 25.375 } },
    tags: ["islands", "steps", "sea"],
  }),
  row("balloons-at-dawn", "Balloons at dawn", "travel", P.balloons, "The valley fills with colour before the sun is up.", {
    location: { placeName: "Göreme", region: "Cappadocia", country: "Türkiye", coordinates: { lat: 38.643, lng: 34.829 } },
    tags: ["balloons", "dawn", "valley"],
  }),

  row("kyoto-evening-street", "Lane at dusk", "city", P.kyotoStreet, "Wooden fronts, a pagoda, one kimono heading home.", {
    location: { placeName: "Higashiyama", city: "Kyoto", country: "Japan", coordinates: { lat: 34.999, lng: 135.781 } },
    tripSlug: "paper-lanterns",
    destinationSlug: "japan",
    tags: ["kyoto", "street", "dusk"],
    featured: true,
  }),
  row("lantern-alley", "Lantern alley", "city", P.lanternAlley, "A single red lantern and a lot of neon."),
  row("neon-crossing", "Neon crossing", "city", P.neonCrossing, "Everyone crossing at once under the signs."),
  row("red-lantern-street", "Strung with red", "city", P.redLanterns, "A street held together by paper lanterns."),
  row("blue-town-stairs", "Blue town stairs", "city", P.blueStairs, "Every wall washed a different blue.", {
    location: { city: "Chefchaouen", country: "Morocco", coordinates: { lat: 35.169, lng: -5.264 } },
    tags: ["blue", "stairs", "old town"],
    featured: true,
  }),
  row("white-village-door", "The blue door", "city", P.whiteDoor, "Pots on the step, paint fresh against the whitewash."),
  row("yellow-cab", "Yellow cab", "city", P.yellowCab, "Waiting at the kerb while the street moves on.", {
    location: { country: "India" },
    tripSlug: "subcontinent-days",
    destinationSlug: "india",
    tags: ["taxi", "street"],
  }),
  row("eiffel-dusk", "Iron lace at dusk", "city", P.eiffelDusk, "The tower holds the last of the light.", {
    location: { placeName: "Seine", city: "Paris", country: "France", coordinates: { lat: 48.858, lng: 2.295 } },
    destinationSlug: "paris",
    tags: ["paris", "dusk", "river"],
  }),
  row("alexandre-bridge", "Lamps on the bridge", "city", P.alexandreBridge, "Gilded lamps switch on at blue hour.", {
    location: { placeName: "Pont Alexandre III", city: "Paris", country: "France", coordinates: { lat: 48.864, lng: 2.314 } },
    destinationSlug: "paris",
    tags: ["paris", "bridge", "blue hour"],
  }),
  row("amsterdam-canal", "Canal, afternoon", "city", P.amsterdamCanal, "Boats tied up, trees leaning over the water.", {
    location: { city: "Amsterdam", country: "Netherlands", coordinates: { lat: 52.368, lng: 4.904 } },
    tags: ["canal", "city"],
  }),
  row("porto-riverfront", "Riverfront stack", "city", P.portoRiver, "Houses piled up the hill above the boats.", {
    location: { placeName: "Ribeira", city: "Porto", country: "Portugal", coordinates: { lat: 41.141, lng: -8.614 } },
    tags: ["riverside", "colour"],
  }),
  row("venice-rialto", "Gondola at the Rialto", "city", P.veniceRialto, "Under the arch and out into the light.", {
    location: { placeName: "Rialto Bridge", city: "Venice", country: "Italy", coordinates: { lat: 45.438, lng: 12.336 } },
    tags: ["venice", "canal", "bridge"],
  }),
  row("london-river-bend", "River bend", "city", P.londonBend, "The river turns and the city turns with it.", {
    location: { placeName: "Tower Bridge", city: "London", country: "United Kingdom", coordinates: { lat: 51.506, lng: -0.075 } },
    tags: ["aerial", "river", "city"],
  }),
  row("midtown-gold", "Gold between the towers", "city", P.midtownGold, "Low sun finding the gaps in the grid.", {
    location: { city: "New York", country: "United States", coordinates: { lat: 40.755, lng: -73.984 } },
    tags: ["skyline", "golden hour"],
  }),

  row("red-rock-road", "Red rock road", "getaway", P.redRockRoad, "A camper van and a road with nowhere to be.", {
    tripSlug: "weekend-escapes",
    tags: ["road trip", "desert"],
    featured: true,
  }),
  row("waterfall-in-green", "Waterfall in green", "getaway", P.waterfall, "A long drop through moss and a small bridge.", {
    location: { placeName: "Multnomah Falls", region: "Oregon", country: "United States", coordinates: { lat: 45.576, lng: -122.116 } },
    tripSlug: "weekend-escapes",
    tags: ["waterfall", "forest"],
  }),
  row("highland-ridge", "Highland ridge", "getaway", P.highlandRidge, "Low cloud, green slopes, a band of gold.", {
    tripSlug: "weekend-escapes",
    tags: ["highlands", "light"],
  }),
  row("forest-path", "Forest path", "getaway", P.forestPath, "Light through the trunks, a path to follow.", {
    tripSlug: "weekend-escapes",
    tags: ["forest", "walk"],
  }),
  row("palm-and-parasol", "Palm and parasol", "getaway", P.palmParasol, "A small bay, a thatched shade, nothing else."),
  row("first-light-shoreline", "First light shoreline", "getaway", P.shoreline, "The first wave of the morning, foam on the sand."),

  row("latte-cheers", "Cheers over lattes", "cafe", P.latteCheers, "Two lattes and a black coffee, clinked.", {
    cafeSlug: "blue-cup",
    tags: ["latte", "friends"],
    featured: true,
  }),
  row("flat-whites", "Two flat whites", "cafe", P.flatWhites, "Leaf art on wood, a trailing plant nearby.", {
    cafeSlug: "blue-cup",
    note: "Order the second one before the first goes cold.",
    tags: ["flat white", "plants"],
  }),
  row("plant-cafe", "Wire chairs, big plant", "cafe", P.plantCafe, "Chalkboard counter, window seats, a good hum.", {
    cafeSlug: "greenhouse-corner",
    tags: ["interior", "plants"],
  }),
  row("coffee-flatlay", "Coffee from above", "cafe", P.coffeeFlatlay, "A latte next to the beans it came from.", {
    cafeSlug: "slow-pour",
    tags: ["beans", "flat lay"],
  }),
  row("greenhouse-table", "Table by the glass wall", "cafe", P.greenhouseCafe, "A French press and the garden coming in.", {
    cafeSlug: "greenhouse-corner",
    tags: ["window", "greenery"],
    featured: true,
  }),
  row("pour-over", "Slow pour", "cafe", P.pourOver, "Water circling the grounds, no hurry.", {
    cafeSlug: "slow-pour",
    tags: ["pour-over", "barista"],
  }),
  row("bright-counter", "Bright counter", "cafe", P.brightCounter, "Pendant bulbs over the espresso machine.", {
    cafeSlug: "bicycle-room",
    tags: ["counter", "interior"],
  }),
  row("long-tables", "Long tables", "cafe", P.longTables, "Everyone working, nobody rushing.", {
    tags: ["interior", "workday"],
  }),
  row("concrete-cafe", "Concrete and bicycles", "cafe", P.concreteCafe, "Raw walls, a menu board, two bikes parked inside.", {
    cafeSlug: "bicycle-room",
    tags: ["concrete", "bikes"],
  }),
  row("blue-cup", "Blue saucer", "cafe", P.blueCup, "One espresso, one saucer, soft light.", {
    cafeSlug: "blue-cup",
    tags: ["espresso", "detail"],
  }),

  row("pancake-stack", "Pancake stack", "food", P.pancakes, "Syrup mid-pour on a tall stack.", {
    tags: ["breakfast", "sweet"],
  }),
  row("salad-and-juice", "Salad and juice", "food", P.saladJuice, "A bowl of colour and something orange to drink.", {
    tags: ["salad", "lunch"],
  }),
  row("grilled-mezze", "Grilled board", "food", P.mezze, "Halloumi, salad, warm bread.", {
    tags: ["grilled", "sharing"],
  }),
  row("breakfast-spread", "Breakfast spread", "food", P.breakfastSpread, "Bowls and plates, all within reach.", {
    tags: ["breakfast", "flat lay"],
  }),
  row("pasta-salad", "Green pasta", "food", P.pastaSalad, "Pesto, tomato, a handful of rocket.", {
    tags: ["pasta", "lunch"],
  }),
  row("charred-pizza", "Charred crust", "food", P.pizza, "Basil on top, the edge just burnt enough.", {
    tags: ["pizza", "dinner"],
  }),
  row("candlelit-table", "Candlelit table", "food", P.candlelitTable, "Dinner laid out, the room gone quiet.", {
    tags: ["dinner", "candlelight"],
  }),
]);

/* ------------------------------------------------------------------------------------------ */

const sampleDestinations: Destination[] = [
  {
    slug: "alps",
    name: "The Alps",
    country: "Switzerland & Italy",
    description: "High snow, cloud seas below the ridgeline and lakes the colour of sea glass.",
    coverImage: P.aboveClouds,
    isSample: true,
    sortOrder: 1,
  },
  {
    slug: "japan",
    name: "Japan",
    country: "Japan",
    description: "Wooden lanes at dusk, red pagodas, and one mountain that keeps showing up.",
    coverImage: P.fujiPagoda,
    isSample: true,
    sortOrder: 2,
  },
  {
    slug: "india",
    name: "India",
    country: "India",
    description: "Marble at dawn, yellow taxis at night, and streets that never quite empty.",
    coverImage: P.tajReflection,
    isSample: true,
    sortOrder: 3,
  },
  {
    slug: "indonesia",
    name: "Indonesia",
    country: "Indonesia",
    description: "Temples in mist, on lakes and on hilltops, from Bali to Java.",
    coverImage: P.borobudur,
    isSample: true,
    sortOrder: 4,
  },
  {
    slug: "paris",
    name: "Paris",
    country: "France",
    region: "Île-de-France",
    description: "The river at dusk, gilded lamps coming on, and a skyline you already know.",
    coverImage: P.eiffelDusk,
    coordinates: { lat: 48.857, lng: 2.352 },
    isSample: true,
    sortOrder: 5,
  },
];

const sampleTrips: Trip[] = [
  {
    slug: "alpine-light",
    title: "Alpine Light",
    summary: "Cloud seas at sunrise, turquoise lakes and a long blue hour in the high country.",
    story:
      "The mountains do most of the work here. Light arrives from the side, catches one ridge at a time, and leaves the valleys in blue shadow.\n\nThese frames are arranged the way a day moves: sunrise above the cloud, midday on the lake, and the stars that come out once the last hut light goes off.",
    coverImage: P.braiesTurquoise,
    destinationSlug: "alps",
    isSample: true,
    featured: true,
    sortOrder: 1,
  },
  {
    slug: "paper-lanterns",
    title: "Paper Lanterns",
    summary: "Wooden lanes, red pagodas and the hour after dusk.",
    story:
      "A collection built around evening: the moment shopfronts glow, lanterns come on and a mountain turns pink behind a pagoda.",
    coverImage: P.kyotoStreet,
    destinationSlug: "japan",
    isSample: true,
    featured: true,
    sortOrder: 2,
  },
  {
    slug: "subcontinent-days",
    title: "Subcontinent Days",
    summary: "Marble at first light, then yellow cabs once the sun is gone.",
    coverImage: P.tajReflection,
    destinationSlug: "india",
    isSample: true,
    featured: false,
    sortOrder: 3,
  },
  {
    slug: "island-temples",
    title: "Island Temples",
    summary: "Stone and water, mist and morning, from a lake in Bali to a hilltop in Java.",
    coverImage: P.borobudur,
    destinationSlug: "indonesia",
    isSample: true,
    featured: false,
    sortOrder: 4,
  },
  {
    slug: "weekend-escapes",
    title: "Weekend Escapes",
    summary: "Short drives, long roads and places to switch off for two days.",
    story:
      "Not every trip needs a passport. These are the quick ones: a van, a forest path, a waterfall and a ridge with the weather coming in.",
    coverImage: P.redRockRoad,
    isSample: true,
    featured: true,
    sortOrder: 5,
  },
];

const sampleCafes: Cafe[] = [
  {
    slug: "greenhouse-corner",
    name: "Greenhouse Corner",
    neighborhood: "By the glass wall",
    coverImage: P.greenhouseCafe,
    vibeTags: ["plants", "window seat", "slow morning"],
    notes: "Sample entry. A café where the garden presses against the glass and nobody minds how long you stay.",
    favoriteOrder: "French press",
    isSample: true,
    sortOrder: 1,
  },
  {
    slug: "bicycle-room",
    name: "The Bicycle Room",
    neighborhood: "Concrete and pendant bulbs",
    coverImage: P.concreteCafe,
    vibeTags: ["industrial", "bikes", "bright"],
    notes: "Sample entry. Raw concrete, a long counter and a couple of bicycles that live inside.",
    favoriteOrder: "Cortado",
    isSample: true,
    sortOrder: 2,
  },
  {
    slug: "slow-pour",
    name: "Slow Pour",
    neighborhood: "Brew bar",
    coverImage: P.pourOver,
    vibeTags: ["pour-over", "filter", "beans"],
    notes: "Sample entry. A bar that treats filter coffee as a small ceremony.",
    favoriteOrder: "Pour-over",
    isSample: true,
    sortOrder: 3,
  },
  {
    slug: "blue-cup",
    name: "Blue Cup",
    neighborhood: "Corner table",
    coverImage: P.flatWhites,
    vibeTags: ["flat white", "wood", "quiet"],
    notes: "Sample entry. Blue saucers, warm wood and the kind of light that makes a flat white look good.",
    favoriteOrder: "Flat white",
    isSample: true,
    sortOrder: 4,
  },
];

const sampleStories: Story[] = [
  {
    slug: "reading-the-light-in-the-alps",
    title: "Reading the light in the Alps",
    subtitle: "Sunrise, lake and stars in one mountain day",
    readingTimeMinutes: 3,
    excerpt: "Mountains are patient subjects. The light is what moves, and the trick is knowing where to stand when it does.",
    body:
      "Mountains are patient subjects. The light is what moves, and the trick is knowing where to stand when it does.\n\n## First light\n\nBefore the sun clears the ridge, the valley fills with cloud. From above it looks like water that has forgotten to fall. The peaks stand out of it, pink for a minute, then white.\n\n## The lake at midday\n\nBy noon the cloud is gone and the lake takes over. Limestone walls turn the water green-blue, and a single wooden boat is enough to give the whole frame its scale.\n\n## After dark\n\nWhen the last hut light goes off the sky shows its depth. A long exposure, a tripod on cold rock, and the galaxy lies along the ridge like a second mountain range.\n\nThis is a sample story. It shows how a longer piece reads next to its photographs.",
    coverImage: P.aboveClouds,
    tripSlug: "alpine-light",
    destinationSlug: "alps",
    isSample: true,
    featured: true,
    sortOrder: 1,
  },
  {
    slug: "a-slow-cup-somewhere-warm",
    title: "A slow cup, somewhere warm",
    subtitle: "On choosing cafés by the table, not the menu",
    readingTimeMinutes: 2,
    excerpt: "The best cafés are decided at the table: where the light falls, whether the chair is comfortable, how long you can stay.",
    body:
      "The best cafés are decided at the table: where the light falls, whether the chair is comfortable, how long you can stay.\n\n## Look for the window\n\nLight is the first thing worth checking. A table by the glass turns a flat white into a still life without any effort.\n\n## Count the plants\n\nA café with plants is a café that someone cares about. Green on the shelves, green on the counter, green leaning in from outside.\n\n## Order slowly\n\nThe pour-over takes four minutes. That is the point.\n\nThis is a sample story, written to show how café notes will sit alongside the photographs.",
    coverImage: P.greenhouseCafe,
    isSample: true,
    featured: false,
    sortOrder: 2,
  },
  {
    slug: "lanterns-pagodas-and-the-hour-after-dusk",
    title: "Lanterns, pagodas and the hour after dusk",
    subtitle: "Why evening is the best time to walk an old street",
    readingTimeMinutes: 2,
    excerpt: "The hour after dusk is when old streets change character. Shopfronts glow, lanterns come on and the crowds thin.",
    body:
      "The hour after dusk is when old streets change character. Shopfronts glow, lanterns come on and the crowds thin.\n\n## Wood and warm light\n\nTimber fronts take lamplight well. Everything goes amber, and the sky above stays a deep, clean blue for a few extra minutes.\n\n## The pagoda on the hill\n\nFrom a hillside, a red pagoda sits in front of the mountain like a full stop. Photographed early, the peak is pink behind it.\n\nThis is a sample story, here to show how a collection and its story fit together.",
    coverImage: P.kyotoStreet,
    tripSlug: "paper-lanterns",
    destinationSlug: "japan",
    isSample: true,
    featured: false,
    sortOrder: 3,
  },
];

export const sampleJournal: Journal = {
  postcards: samplePostcards,
  trips: sampleTrips,
  destinations: sampleDestinations,
  cafes: sampleCafes,
  stories: sampleStories,
};
