import type { DayPlan, Interest, Place, Trip } from "@travel-planner/core";
import {
  curateSuggestionsForBlock,
  extractConfirmedPicks,
  extractUsedPlaceNames,
  getBlockLabels,
  inferDestinationProfile,
  dateForDayIndex,
} from "@travel-planner/core";
import { generateId } from "../utils";

type ContentLocale = "en" | "zh";

type SpotDef = {
  name: string;
  n: string;
  kind: Place["kind"];
  meal?: Place["mealSlot"];
  confidence?: Place["confidence"];
};

function makePlace(
  def: SpotDef,
  tags: Interest[],
  locale: ContentLocale
): Place {
  return {
    id: generateId(),
    name: def.name,
    neighborhood: def.n,
    kind: def.kind,
    mealSlot: def.meal,
    whyRecommended: locale === "zh"
      ? `${def.n}的热门地点，常出现在旅行攻略和本地评价中。`
      : `Popular spot in ${def.n}, often mentioned in travel guides and local reviews.`,
    sourceLinks: [],
    tags,
    confidence: def.confidence ?? "widely_recommended",
    localTips: locale === "zh"
      ? ["出发前确认营业时间", "工作日通常人更少"]
      : ["Check opening hours before you go", "Weekdays are usually less crowded"],
    isCustom: false,
  };
}

const LABELS_ZH: Record<string, string> = {
  Breakfast: "早餐",
  "Morning explore": "上午游览",
  "Lunch nearby": "附近午餐",
  "Afternoon sights": "下午景点",
  "Afternoon snack": "下午茶",
  "Neighborhood stroll": "街区漫步",
  Dinner: "晚餐",
  "Morning activity": "上午活动",
  Lunch: "午餐",
  "Afternoon explore": "下午探索",
  "Relax / free time": "休息 / 自由时间",
  "Beach or pool time": "海滩或泳池",
  "Afternoon activity": "下午活动",
  "Sunset spot": "日落观景点",
};

const DEFAULT_SPOTS: SpotDef[] = [
  { name: "Morning Market Cafe", n: "City Center", kind: "meal", meal: "breakfast" },
  { name: "Riverside Bakery", n: "Waterfront", kind: "meal", meal: "breakfast" },
  { name: "Old Town Espresso Bar", n: "Old Town", kind: "meal", meal: "breakfast" },
  { name: "Sunrise Brunch House", n: "City Center", kind: "meal", meal: "breakfast" },
  { name: "Harbor Morning Grill", n: "Waterfront", kind: "meal", meal: "breakfast" },
  { name: "Historic Main Square", n: "Old Town", kind: "activity" },
  { name: "City Museum", n: "City Center", kind: "activity" },
  { name: "Cathedral Quarter Walk", n: "Old Town", kind: "activity" },
  { name: "Central Park Gardens", n: "City Center", kind: "activity" },
  { name: "Waterfront Sculpture Trail", n: "Waterfront", kind: "activity" },
  { name: "Local Bistro", n: "Old Town", kind: "meal", meal: "lunch" },
  { name: "Market Hall Food Stalls", n: "City Center", kind: "meal", meal: "lunch" },
  { name: "Hidden Alley Eatery", n: "Old Town", kind: "meal", meal: "lunch", confidence: "local_hidden_gem" },
  { name: "Dockside Seafood Lunch", n: "Waterfront", kind: "meal", meal: "lunch" },
  { name: "Garden Terrace Cafe", n: "City Center", kind: "meal", meal: "lunch" },
  { name: "Art District Walk", n: "City Center", kind: "activity" },
  { name: "Riverside Promenade", n: "Waterfront", kind: "activity" },
  { name: "Vintage Shopping Lane", n: "Old Town", kind: "activity" },
  { name: "Rooftop Lookout", n: "City Center", kind: "activity" },
  { name: "Canal Side Stroll", n: "Waterfront", kind: "activity" },
  { name: "Afternoon Tea Salon", n: "Old Town", kind: "meal", meal: "snack" },
  { name: "Patisserie Corner", n: "City Center", kind: "meal", meal: "snack" },
  { name: "Harbor Restaurant", n: "Waterfront", kind: "meal", meal: "dinner" },
  { name: "Chef's Table Downtown", n: "City Center", kind: "meal", meal: "dinner", confidence: "trending_social" },
  { name: "Old Town Wine Bar", n: "Old Town", kind: "meal", meal: "dinner" },
  { name: "Sunset Viewpoint", n: "Waterfront", kind: "activity" },
  { name: "Night Market Stalls", n: "City Center", kind: "meal", meal: "dinner" },
  { name: "Jazz Club Supper", n: "Old Town", kind: "meal", meal: "dinner", confidence: "local_hidden_gem" },
  { name: "Lantern Lit Alley", n: "Old Town", kind: "activity" },
  { name: "Street Food Crawl", n: "City Center", kind: "meal", meal: "snack", confidence: "trending_social" },
  { name: "Botanical Conservatory", n: "City Center", kind: "activity" },
  { name: "Craft Workshop Studio", n: "Old Town", kind: "activity" },
  { name: "Kayak Harbor Tour", n: "Waterfront", kind: "activity" },
  { name: "Farmers Market Morning", n: "City Center", kind: "activity" },
  { name: "Bookshop Cafe", n: "Old Town", kind: "meal", meal: "breakfast", confidence: "local_hidden_gem" },
  { name: "Gallery District Loop", n: "City Center", kind: "activity" },
  { name: "Pier Ice Cream Stand", n: "Waterfront", kind: "meal", meal: "snack" },
  { name: "Historic Tavern Lunch", n: "Old Town", kind: "meal", meal: "lunch" },
  { name: "Observation Deck", n: "City Center", kind: "activity" },
  { name: "Moonlit Pier Walk", n: "Waterfront", kind: "activity" },
  { name: "Neighborhood Ramen Shop", n: "City Center", kind: "meal", meal: "dinner" },
  { name: "Courtyard Coffee House", n: "Old Town", kind: "meal", meal: "snack" },
];

const TOKYO_SPOTS: SpotDef[] = [
  { name: "Tsukiji Outer Market", n: "Shibuya", kind: "meal", meal: "breakfast" },
  { name: "Bills Omotesando", n: "Shibuya", kind: "meal", meal: "breakfast", confidence: "trending_social" },
  { name: "Sarabeth's Shinjuku", n: "Shinjuku", kind: "meal", meal: "breakfast" },
  { name: "Komeda Coffee Shibuya", n: "Shibuya", kind: "meal", meal: "breakfast" },
  { name: "World Breakfast Allday", n: "Shibuya", kind: "meal", meal: "breakfast", confidence: "local_hidden_gem" },
  { name: "Meiji Shrine", n: "Shibuya", kind: "activity" },
  { name: "Shibuya Crossing", n: "Shibuya", kind: "activity" },
  { name: "Yoyogi Park", n: "Shibuya", kind: "activity" },
  { name: "Omotesando Hills", n: "Shibuya", kind: "activity" },
  { name: "Cat Street Boutiques", n: "Shibuya", kind: "activity", confidence: "trending_social" },
  { name: "Ichiran Ramen Shibuya", n: "Shibuya", kind: "meal", meal: "lunch" },
  { name: "Afuri Ramen Harajuku", n: "Shibuya", kind: "meal", meal: "lunch", confidence: "trending_social" },
  { name: "Uobei Shibuya", n: "Shibuya", kind: "meal", meal: "lunch" },
  { name: "Marugame Seimen", n: "Shinjuku", kind: "meal", meal: "lunch" },
  { name: "Tsukada Nojo Shinjuku", n: "Shinjuku", kind: "meal", meal: "lunch", confidence: "local_hidden_gem" },
  { name: "Senso-ji Temple", n: "Asakusa", kind: "activity" },
  { name: "Asakusa Nakamise Street", n: "Asakusa", kind: "activity" },
  { name: "Tokyo Skytree", n: "Asakusa", kind: "activity" },
  { name: "Sumida River Walk", n: "Asakusa", kind: "activity" },
  { name: "Kappabashi Kitchen Street", n: "Asakusa", kind: "activity", confidence: "local_hidden_gem" },
  { name: "Matcha House Asakusa", n: "Asakusa", kind: "meal", meal: "snack" },
  { name: "Higashiya Man", n: "Shibuya", kind: "meal", meal: "snack", confidence: "local_hidden_gem" },
  { name: "Starbucks Reserve Roastery", n: "Shibuya", kind: "meal", meal: "snack", confidence: "trending_social" },
  { name: "Omoide Yokocho", n: "Shinjuku", kind: "meal", meal: "dinner" },
  { name: "Golden Gai", n: "Shinjuku", kind: "activity" },
  { name: "Torikizoku Shinjuku", n: "Shinjuku", kind: "meal", meal: "dinner" },
  { name: "Ichiran Shinjuku", n: "Shinjuku", kind: "meal", meal: "dinner" },
  { name: "Nakano Broadway", n: "Shinjuku", kind: "activity", confidence: "local_hidden_gem" },
  { name: "Shinjuku Gyoen", n: "Shinjuku", kind: "activity" },
  { name: "Robot Restaurant Area Walk", n: "Shinjuku", kind: "activity", confidence: "trending_social" },
  { name: "Depachika Food Hall", n: "Shibuya", kind: "meal", meal: "lunch" },
  { name: "TeamLab Borderless", n: "Shibuya", kind: "activity", confidence: "trending_social" },
  { name: "Nezu Museum", n: "Shibuya", kind: "activity", confidence: "local_hidden_gem" },
  { name: "Shimokitazawa Vintage Shops", n: "Shibuya", kind: "activity", confidence: "local_hidden_gem" },
  { name: "Tonkatsu Maisen Omotesando", n: "Shibuya", kind: "meal", meal: "lunch" },
  { name: "Happiness Pancake Harajuku", n: "Shibuya", kind: "meal", meal: "snack", confidence: "trending_social" },
  { name: "Imperial Palace East Gardens", n: "Shinjuku", kind: "activity" },
  { name: "Ameyoko Market", n: "Asakusa", kind: "activity" },
  { name: "Kura Sushi Asakusa", n: "Asakusa", kind: "meal", meal: "dinner" },
  { name: "Ramen Street Tokyo Station", n: "Shinjuku", kind: "meal", meal: "lunch" },
  { name: "Shibuya Sky", n: "Shibuya", kind: "activity", confidence: "widely_recommended" },
  { name: "Yakitori Alley Memory Lane", n: "Shinjuku", kind: "meal", meal: "dinner", confidence: "local_hidden_gem" },
];

const OSAKA_SPOTS: SpotDef[] = [
  { name: "Kuromon Ichiba Market", n: "Namba", kind: "meal", meal: "breakfast" },
  { name: "Rikuro Cheesecake Namba", n: "Namba", kind: "meal", meal: "breakfast", confidence: "trending_social" },
  { name: "Pablo Mini Cheesecake", n: "Shinsaibashi", kind: "meal", meal: "breakfast" },
  { name: "Morning Set Kissaten", n: "Namba", kind: "meal", meal: "breakfast", confidence: "local_hidden_gem" },
  { name: "Namba Parks Garden", n: "Namba", kind: "activity" },
  { name: "Osaka Castle", n: "Namba", kind: "activity" },
  { name: "Osaka Museum of History", n: "Namba", kind: "activity" },
  { name: "Nakanoshima Rose Garden", n: "Namba", kind: "activity", confidence: "local_hidden_gem" },
  { name: "Mizuno Okonomiyaki", n: "Dotonbori", kind: "meal", meal: "lunch" },
  { name: "Kukuru Takoyaki Dotonbori", n: "Dotonbori", kind: "meal", meal: "lunch", confidence: "trending_social" },
  { name: "Ichiran Dotonbori", n: "Dotonbori", kind: "meal", meal: "lunch" },
  { name: "Matsusakagyu Yakiniku", n: "Shinsaibashi", kind: "meal", meal: "lunch" },
  { name: "Hariju Tonkatsu", n: "Shinsaibashi", kind: "meal", meal: "lunch", confidence: "local_hidden_gem" },
  { name: "Dotonbori Canal Walk", n: "Dotonbori", kind: "activity" },
  { name: "Shinsaibashi Shopping Arcade", n: "Shinsaibashi", kind: "activity" },
  { name: "Amerikamura", n: "Shinsaibashi", kind: "activity", confidence: "trending_social" },
  { name: "Hozenji Yokocho", n: "Dotonbori", kind: "activity", confidence: "local_hidden_gem" },
  { name: "Glico Sign Photo Spot", n: "Dotonbori", kind: "activity" },
  { name: "Melon Pan Ice Shinsaibashi", n: "Shinsaibashi", kind: "meal", meal: "snack", confidence: "trending_social" },
  { name: "Kani Doraku Dotonbori", n: "Dotonbori", kind: "meal", meal: "dinner" },
  { name: "Kushikatsu Daruma", n: "Shinsekai", kind: "meal", meal: "dinner" },
  { name: "Mizuno Okonomiyaki Dinner", n: "Dotonbori", kind: "meal", meal: "dinner" },
  { name: "Tsutenkaku Tower", n: "Shinsekai", kind: "activity" },
  { name: "Shinsekai Arcade Street", n: "Shinsekai", kind: "activity", confidence: "local_hidden_gem" },
  { name: "Tenjinbashisuji Shopping Street", n: "Namba", kind: "activity" },
  { name: "Umeda Sky Building", n: "Namba", kind: "activity" },
  { name: "Spa World", n: "Namba", kind: "activity", confidence: "trending_social" },
  { name: "Namba Yasaka Shrine", n: "Namba", kind: "activity" },
  { name: "Kuromon Seafood Grill", n: "Namba", kind: "meal", meal: "lunch" },
  { name: "Rikyu Gyutan Namba", n: "Namba", kind: "meal", meal: "dinner" },
  { name: "Nipponbashi Den Den Town", n: "Namba", kind: "activity" },
  { name: "Cup Noodles Museum", n: "Namba", kind: "activity", confidence: "trending_social" },
  { name: "Tempozan Ferris Wheel", n: "Waterfront", kind: "activity" },
  { name: "Kaiyukan Aquarium", n: "Waterfront", kind: "activity" },
  { name: "Okonomiyaki Chitose", n: "Dotonbori", kind: "meal", meal: "dinner", confidence: "local_hidden_gem" },
  { name: "Maido Namba", n: "Namba", kind: "meal", meal: "snack" },
  { name: "Orange Street Horie", n: "Shinsaibashi", kind: "activity", confidence: "local_hidden_gem" },
  { name: "Takoyaki Wanaka", n: "Dotonbori", kind: "meal", meal: "snack" },
  { name: "Sumiyoshi Taisha", n: "Namba", kind: "activity", confidence: "local_hidden_gem" },
  { name: "Abeno Harukas", n: "Namba", kind: "activity" },
  { name: "Yakiniku M Namba", n: "Namba", kind: "meal", meal: "dinner" },
  { name: "Namba Grand Kagetsu", n: "Namba", kind: "activity", confidence: "trending_social" },
];

const DESTINATION_DATA: Record<
  string,
  { neighborhoods: string[]; spots: SpotDef[] }
> = {
  default: { neighborhoods: ["City Center", "Old Town", "Waterfront"], spots: DEFAULT_SPOTS },
  tokyo: { neighborhoods: ["Shibuya", "Shinjuku", "Asakusa"], spots: TOKYO_SPOTS },
  osaka: {
    neighborhoods: ["Dotonbori", "Shinsaibashi", "Namba", "Shinsekai", "Waterfront"],
    spots: OSAKA_SPOTS,
  },
};

function getDestData(destination: string, allowDefault = true) {
  const lower = destination.toLowerCase();
  for (const key of Object.keys(DESTINATION_DATA)) {
    if (key !== "default" && lower.includes(key)) {
      return DESTINATION_DATA[key];
    }
  }
  return allowDefault ? DESTINATION_DATA.default : null;
}

export function getCuratedNeighborhoods(destination: string): string[] {
  return getDestData(destination)?.neighborhoods ?? [];
}

export function mockResearchCandidates(trip: Trip, locale: ContentLocale = "en"): Place[] {
  const data = getDestData(trip.destination);
  if (!data) return [];
  const tags = trip.interests.slice(0, 2) as Interest[];
  return data.spots.map((s) => makePlace(s, tags, locale));
}

export function mockGenerateDays(
  trip: Trip,
  fromDay: number,
  toDay: number,
  locale: ContentLocale = "en"
): DayPlan[] {
  const data = getDestData(trip.destination);
  if (!data) return [];
  const profile = inferDestinationProfile(trip.destination);
  const labels = getBlockLabels(profile, trip.interests, trip.pace).map((l) =>
    locale === "zh" ? (LABELS_ZH[l] ?? l) : l
  );
  const candidates = mockResearchCandidates(trip, locale);
  const days: DayPlan[] = [];
  const usedPlaceNames = extractUsedPlaceNames(trip, fromDay);
  const confirmedPicks = extractConfirmedPicks(trip, fromDay);

  for (let d = fromDay; d <= toDay; d++) {
    const neighborhoods = data.neighborhoods;
    const usedInDay = new Set<string>();
    const savedPlaces = trip.wishlist.filter((w) => w.place).map((w) => w.place!);

    const blocks = labels.map((label, i) => {
      const neighborhood = neighborhoods[i % neighborhoods.length];
      const blockLabel = label.includes(neighborhood) ? label : `${label} — ${neighborhood}`;
      const kind = label.toLowerCase().includes("breakfast") ||
        label.toLowerCase().includes("lunch") ||
        label.toLowerCase().includes("dinner") ||
        label.toLowerCase().includes("snack")
        ? ("meal" as const)
        : ("activity" as const);

      const seedSuggestions: Place[] = [];
      if (d === fromDay && i < savedPlaces.length) {
        seedSuggestions.push(savedPlaces[i]);
      }

      const draftBlock = {
        id: generateId(),
        kind,
        label: blockLabel,
        neighborhood,
        suggestions: seedSuggestions.length ? seedSuggestions : [candidates[i % candidates.length]],
        status: "suggested" as const,
      };

      const suggestions = curateSuggestionsForBlock(draftBlock, candidates, trip, {
        seedSuggestions,
        usedPlaceNames,
        usedInDay,
        confirmedPicks,
        newId: generateId,
      });

      const backup = candidates[(i + 3) % candidates.length];

      return {
        ...draftBlock,
        suggestions,
        selectedPlaceId: suggestions[0]?.id,
        backupPlace: { ...backup, id: generateId() },
      };
    });

    days.push({
      dayIndex: d,
      date: dateForDayIndex(trip.startDate, d),
      theme: locale === "zh"
        ? `${data.neighborhoods[d % data.neighborhoods.length]} & ${data.neighborhoods[(d + 1) % data.neighborhoods.length]}`
        : `${data.neighborhoods[d % data.neighborhoods.length]} & ${data.neighborhoods[(d + 1) % data.neighborhoods.length]}`,
      neighborhoods: data.neighborhoods,
      blocks,
    });
  }

  return days;
}
