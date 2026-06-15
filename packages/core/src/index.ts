export * from "./types";
export * from "./constants";
export * from "./schemas";
export * from "./pace-rules";
export * from "./curation";
export * from "./validation";

export const CONFIDENCE_LABELS: Record<string, string> = {
  widely_recommended: "Widely recommended",
  trending_social: "Trending on social",
  user_added: "Added by you",
  local_hidden_gem: "Local hidden gem",
};

export const REGENERATE_PRESETS: { value: string; label: string }[] = [
  { value: "too_touristy", label: "Too touristy" },
  { value: "more_local", label: "More local" },
  { value: "rainy_day", label: "Rainy day / indoor" },
  { value: "tired", label: "We're tired — lighter pace" },
  { value: "more_food", label: "More food-focused" },
  { value: "kid_friendly", label: "Kid-friendly" },
];

export const INTEREST_OPTIONS: { value: string; label: string }[] = [
  { value: "food", label: "Food" },
  { value: "culture", label: "Culture" },
  { value: "nature", label: "Nature" },
  { value: "shopping", label: "Shopping" },
  { value: "nightlife", label: "Nightlife" },
  { value: "family", label: "Family" },
  { value: "photography", label: "Photography" },
];
