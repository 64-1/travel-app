import type { DayPlan, Interest, Place, Trip } from "@travel-planner/core";
import { getBlockLabels, inferDestinationProfile } from "@travel-planner/core";
import { generateId } from "../utils";
import { dateForDayIndex } from "@travel-planner/core";

type ContentLocale = "en" | "zh";

function makePlace(
  name: string,
  neighborhood: string,
  kind: Place["kind"],
  mealSlot: Place["mealSlot"] | undefined,
  tags: Interest[],
  locale: ContentLocale,
  confidence: Place["confidence"] = "widely_recommended"
): Place {
  return {
    id: generateId(),
    name,
    neighborhood,
    kind,
    mealSlot,
    whyRecommended: locale === "zh"
      ? `${neighborhood}的热门地点，常出现在旅行攻略和本地评价中。`
      : `Popular spot in ${neighborhood}, often mentioned in travel guides and local reviews.`,
    sourceLinks: [],
    tags,
    confidence,
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

const DESTINATION_DATA: Record<string, { neighborhoods: string[]; spots: { name: string; n: string; kind: Place["kind"]; meal?: Place["mealSlot"] }[] }> = {
  default: {
    neighborhoods: ["City Center", "Old Town", "Waterfront"],
    spots: [
      { name: "Morning Market Cafe", n: "City Center", kind: "meal", meal: "breakfast" },
      { name: "Historic Main Square", n: "Old Town", kind: "activity" },
      { name: "Local Bistro", n: "Old Town", kind: "meal", meal: "lunch" },
      { name: "Art District Walk", n: "City Center", kind: "activity" },
      { name: "Riverside Promenade", n: "Waterfront", kind: "activity" },
      { name: "Harbor Restaurant", n: "Waterfront", kind: "meal", meal: "dinner" },
      { name: "Hidden Alley Eatery", n: "Old Town", kind: "meal", meal: "lunch" },
      { name: "Sunset Viewpoint", n: "Waterfront", kind: "activity" },
    ],
  },
  tokyo: {
    neighborhoods: ["Shibuya", "Shinjuku", "Asakusa"],
    spots: [
      { name: "Tsukiji Outer Market", n: "Shibuya", kind: "meal", meal: "breakfast" },
      { name: "Meiji Shrine", n: "Shibuya", kind: "activity" },
      { name: "Ichiran Ramen Shibuya", n: "Shibuya", kind: "meal", meal: "lunch" },
      { name: "Shibuya Crossing", n: "Shibuya", kind: "activity" },
      { name: "Senso-ji Temple", n: "Asakusa", kind: "activity" },
      { name: "Asakusa Nakamise Street", n: "Asakusa", kind: "activity" },
      { name: "Omoide Yokocho", n: "Shinjuku", kind: "meal", meal: "dinner" },
      { name: "Golden Gai", n: "Shinjuku", kind: "activity" },
    ],
  },
  osaka: {
    neighborhoods: ["Dotonbori", "Shinsaibashi", "Namba"],
    spots: [
      { name: "Kuromon Ichiba Market", n: "Namba", kind: "meal", meal: "breakfast" },
      { name: "Osaka Castle", n: "Namba", kind: "activity" },
      { name: "Mizuno Okonomiyaki", n: "Dotonbori", kind: "meal", meal: "lunch" },
      { name: "Dotonbori Canal Walk", n: "Dotonbori", kind: "activity" },
      { name: "Shinsaibashi Shopping Arcade", n: "Shinsaibashi", kind: "activity" },
      { name: "Kani Doraku Dotonbori", n: "Dotonbori", kind: "meal", meal: "dinner" },
    ],
  },
};

function getDestData(destination: string) {
  const lower = destination.toLowerCase();
  for (const key of Object.keys(DESTINATION_DATA)) {
    if (key !== "default" && lower.includes(key)) {
      return DESTINATION_DATA[key];
    }
  }
  return DESTINATION_DATA.default;
}

export function mockResearchCandidates(trip: Trip, locale: ContentLocale = "en"): Place[] {
  const data = getDestData(trip.destination);
  return data.spots.map((s) =>
    makePlace(s.name, s.n, s.kind, s.meal, trip.interests.slice(0, 2) as Interest[], locale)
  );
}

export function mockGenerateDays(
  trip: Trip,
  fromDay: number,
  toDay: number,
  locale: ContentLocale = "en"
): DayPlan[] {
  const data = getDestData(trip.destination);
  const profile = inferDestinationProfile(trip.destination);
  const labels = getBlockLabels(profile, trip.interests, trip.pace).map((l) =>
    locale === "zh" ? (LABELS_ZH[l] ?? l) : l
  );
  const candidates = mockResearchCandidates(trip, locale);
  const days: DayPlan[] = [];
  let spotIndex = fromDay * labels.length;

  const savedPlaces = trip.wishlist.filter((w) => w.place).map((w) => w.place!);

  for (let d = fromDay; d <= toDay; d++) {
    const neighborhoods = data.neighborhoods;
    const blocks = labels.map((label, i) => {
      const altCount = 3;
      const suggestions: Place[] = [];
      const usedNames = new Set<string>();

      // Slot user-saved spots (e.g. Xiaohongshu) into early day-1 blocks, then fill alternatives from research pool
      if (d === fromDay && i < savedPlaces.length) {
        const saved = savedPlaces[i];
        suggestions.push(saved);
        usedNames.add(saved.name.toLowerCase());
      }

      for (let a = 0; suggestions.length < altCount; a++) {
        const c = candidates[(spotIndex + a) % candidates.length];
        if (usedNames.has(c.name.toLowerCase())) continue;
        suggestions.push({ ...c, id: generateId() });
        usedNames.add(c.name.toLowerCase());
      }

      spotIndex++;

      const neighborhood = neighborhoods[i % neighborhoods.length];
      const backup = candidates[(spotIndex + 2) % candidates.length];

      return {
        id: generateId(),
        kind: suggestions[0].kind,
        label: label.includes(neighborhood) ? label : `${label} — ${neighborhood}`,
        neighborhood,
        suggestions,
        backupPlace: { ...backup, id: generateId() },
        status: "suggested" as const,
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
