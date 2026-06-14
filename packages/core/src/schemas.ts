import { z } from "zod";

export const interestSchema = z.enum([
  "food",
  "culture",
  "nature",
  "shopping",
  "nightlife",
  "family",
  "photography",
]);

export const blockKindSchema = z.enum(["meal", "activity", "transit", "free_time"]);

export const confidenceLabelSchema = z.enum([
  "widely_recommended",
  "trending_social",
  "user_added",
  "local_hidden_gem",
]);

export const tripConstraintsSchema = z.object({
  budget: z.enum(["budget", "mid", "splurge"]),
  dietary: z.array(z.string()).optional(),
  mobility: z.enum(["minimal_walking", "moderate", "lots_of_walking"]),
  groupType: z.enum(["solo", "couple", "family", "friends", "elderly"]).optional(),
  vibe: z.enum(["must_see", "balanced", "hidden_gems"]),
});

const localizedTextSchema = z.object({
  en: z.string(),
  zh: z.string(),
});

const placeDetailRecordSchema = z.object({
  address: localizedTextSchema,
  phone: z.string().optional(),
  website: z.string().optional(),
  hoursSummary: localizedTextSchema.optional(),
  weeklyHours: z
    .array(
      z.object({
        label: localizedTextSchema,
        time: localizedTextSchema,
      })
    )
    .optional(),
  features: z.object({ en: z.array(z.string()), zh: z.array(z.string()) }).optional(),
  relatedInfo: localizedTextSchema.optional(),
  gettingThere: localizedTextSchema.optional(),
});

const destinationMediaSchema = z.object({
  heroImage: z.string().optional(),
  heroVideo: z.string().optional(),
  poster: z.string().optional(),
});

export const placeSchema = z.object({
  id: z.string(),
  name: z.string(),
  neighborhood: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  kind: blockKindSchema,
  mealSlot: z.enum(["breakfast", "lunch", "dinner", "snack"]).optional(),
  whyRecommended: z.string(),
  sourceLinks: z.array(z.string()),
  tags: z.array(interestSchema),
  confidence: confidenceLabelSchema,
  localTips: z.array(z.string()).optional(),
  isCustom: z.boolean(),
  imageUrl: z.string().url().optional(),
  imageCredit: z.string().optional(),
  intro: localizedTextSchema.optional(),
  nameI18n: localizedTextSchema.optional(),
});

export const wishlistItemSchema = z.object({
  id: z.string(),
  rawInput: z.string(),
  place: placeSchema.optional(),
  mustInclude: z.boolean(),
});

export const planBlockSchema = z.object({
  id: z.string(),
  kind: blockKindSchema,
  label: z.string(),
  neighborhood: z.string().optional(),
  suggestions: z.array(placeSchema).min(1).max(5),
  selectedPlaceId: z.string().optional(),
  backupPlace: placeSchema.optional(),
  status: z.enum(["suggested", "confirmed", "skipped"]),
  notes: z.string().optional(),
});

export const dayPlanSchema = z.object({
  dayIndex: z.number().int().min(0),
  date: z.string().optional(),
  theme: z.string().optional(),
  neighborhoods: z.array(z.string()),
  blocks: z.array(planBlockSchema),
});

export const tripSchema = z.object({
  id: z.string(),
  destination: z.string().min(1),
  country: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
  interests: z.array(interestSchema).min(1),
  pace: z.enum(["relaxed", "balanced", "packed"]),
  constraints: tripConstraintsSchema,
  wishlist: z.array(wishlistItemSchema),
  days: z.array(dayPlanSchema),
  daysGenerated: z.number().int().min(0),
  shareToken: z.string().optional(),
  placeDetails: z.record(placeDetailRecordSchema).optional(),
  destinationMedia: destinationMediaSchema.optional(),
  placeAbout: z.record(localizedTextSchema).optional(),
});

export const createTripSchema = z.object({
  destination: z.string().min(1),
  country: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
  interests: z.array(interestSchema).min(1),
  pace: z.enum(["relaxed", "balanced", "packed"]),
  constraints: tripConstraintsSchema,
});

export const addWishlistSchema = z.object({
  rawInput: z.string().min(1),
  mustInclude: z.boolean().default(false),
});

export const enrichPlaceSchema = z.object({
  rawInput: z.string().min(1),
  destination: z.string().optional(),
});

export const patchBlockSchema = z.object({
  status: z.enum(["suggested", "confirmed", "skipped"]).optional(),
  selectedPlaceId: z.string().optional(),
  notes: z.string().optional(),
  place: placeSchema.optional(),
});

export const regenerateSchema = z.object({
  scope: z.enum(["block", "day"]),
  dayIndex: z.number().int().min(0),
  blockId: z.string().optional(),
  reason: z.enum([
    "too_touristy",
    "more_local",
    "rainy_day",
    "indoor",
    "tired",
    "lighter_pace",
    "more_food",
    "kid_friendly",
    "custom",
  ]),
  customFeedback: z.string().optional(),
});

export const generateTripSchema = z.object({
  fromDay: z.number().int().min(0).default(0),
  approveDay1: z.boolean().optional(),
  locale: z.enum(["en", "zh"]).optional(),
});

export const researchCacheSchema = z.object({
  candidates: z.array(placeSchema),
  neighborhoods: z.array(z.string()),
});

export const aiDayPlanResponseSchema = z.object({
  days: z.array(dayPlanSchema),
});
