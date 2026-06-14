export type Interest =
  | "food"
  | "culture"
  | "nature"
  | "shopping"
  | "nightlife"
  | "family"
  | "photography";

export type BlockKind = "meal" | "activity" | "transit" | "free_time";

export type ConfidenceLabel =
  | "widely_recommended"
  | "trending_social"
  | "user_added"
  | "local_hidden_gem";

export type BudgetLevel = "budget" | "mid" | "splurge";

export type MobilityLevel = "minimal_walking" | "moderate" | "lots_of_walking";

export type GroupType = "solo" | "couple" | "family" | "friends" | "elderly";

export type VibeLevel = "must_see" | "balanced" | "hidden_gems";

export type Pace = "relaxed" | "balanced" | "packed";

export type BlockStatus = "suggested" | "confirmed" | "skipped";

export type MealSlot = "breakfast" | "lunch" | "dinner" | "snack";

export interface LocalizedText {
  en: string;
  zh: string;
}

export interface PlaceDetailRecord {
  address: LocalizedText;
  phone?: string;
  website?: string;
  hoursSummary?: LocalizedText;
  weeklyHours?: { label: LocalizedText; time: LocalizedText }[];
  features?: { en: string[]; zh: string[] };
  relatedInfo?: LocalizedText;
  gettingThere?: LocalizedText;
}

export interface DestinationMedia {
  heroImage?: string;
  heroVideo?: string;
  poster?: string;
}

export interface TripConstraints {
  budget: BudgetLevel;
  dietary?: string[];
  mobility: MobilityLevel;
  groupType?: GroupType;
  vibe: VibeLevel;
}

export interface WishlistItem {
  id: string;
  rawInput: string;
  place?: Place;
  mustInclude: boolean;
}

export interface Place {
  id: string;
  name: string;
  neighborhood?: string;
  lat?: number;
  lng?: number;
  kind: BlockKind;
  mealSlot?: MealSlot;
  whyRecommended: string;
  sourceLinks: string[];
  tags: Interest[];
  confidence: ConfidenceLabel;
  localTips?: string[];
  isCustom: boolean;
  imageUrl?: string;
  imageCredit?: string;
  intro?: { en: string; zh: string };
  nameI18n?: { en: string; zh: string };
}

export interface PlanBlock {
  id: string;
  kind: BlockKind;
  label: string;
  neighborhood?: string;
  suggestions: Place[];
  selectedPlaceId?: string;
  backupPlace?: Place;
  status: BlockStatus;
  notes?: string;
}

export interface DayPlan {
  dayIndex: number;
  date?: string;
  theme?: string;
  neighborhoods: string[];
  blocks: PlanBlock[];
}

export interface Trip {
  id: string;
  destination: string;
  country?: string;
  startDate: string;
  endDate: string;
  interests: Interest[];
  pace: Pace;
  constraints: TripConstraints;
  wishlist: WishlistItem[];
  days: DayPlan[];
  daysGenerated: number;
  shareToken?: string;
  placeDetails?: Record<string, PlaceDetailRecord>;
  destinationMedia?: DestinationMedia;
  placeAbout?: Record<string, LocalizedText>;
}

export type RegenerateReason =
  | "too_touristy"
  | "more_local"
  | "rainy_day"
  | "indoor"
  | "tired"
  | "lighter_pace"
  | "more_food"
  | "kid_friendly"
  | "custom";

export interface RegenerateRequest {
  scope: "block" | "day";
  dayIndex: number;
  blockId?: string;
  reason: RegenerateReason;
  customFeedback?: string;
}

export interface ResearchCandidate extends Place {
  category?: string;
}
