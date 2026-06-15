import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  curateSuggestionsForBlock,
  inferMealSlotFromLabel,
  scoreCandidateForBlock,
} from "../src/curation";
import type { PlanBlock, Place, Trip } from "../src/types";

function baseTrip(overrides: Partial<Trip> = {}): Trip {
  return {
    id: "t1",
    destination: "Tokyo",
    startDate: "2026-07-01",
    endDate: "2026-07-03",
    interests: ["food", "culture"],
    pace: "balanced",
    constraints: {
      budget: "mid",
      mobility: "moderate",
      vibe: "balanced",
    },
    wishlist: [],
    days: [],
    daysGenerated: 0,
    ...overrides,
  };
}

function place(overrides: Partial<Place> = {}): Place {
  return {
    id: overrides.id ?? "p1",
    name: overrides.name ?? "Test Place",
    neighborhood: overrides.neighborhood ?? "Shibuya",
    kind: overrides.kind ?? "meal",
    mealSlot: overrides.mealSlot ?? "breakfast",
    whyRecommended: "Nice spot",
    sourceLinks: [],
    tags: overrides.tags ?? ["food"],
    confidence: overrides.confidence ?? "widely_recommended",
    isCustom: false,
    ...overrides,
  };
}

function block(overrides: Partial<PlanBlock> = {}): PlanBlock {
  return {
    id: "b1",
    kind: "meal",
    label: "Breakfast — Shibuya",
    neighborhood: "Shibuya",
    suggestions: [],
    status: "suggested",
    ...overrides,
  };
}

describe("inferMealSlotFromLabel", () => {
  it("maps breakfast labels", () => {
    assert.equal(inferMealSlotFromLabel("Breakfast in Shibuya"), "breakfast");
    assert.equal(inferMealSlotFromLabel("早餐"), "breakfast");
  });
});

describe("scoreCandidateForBlock", () => {
  it("boosts wishlist must-include matches", () => {
    const wishPlace = place({ name: "Saved Cafe", id: "w1" });
    const trip = baseTrip({
      wishlist: [{ id: "w1", rawInput: "Saved Cafe", place: wishPlace, mustInclude: true }],
    });
    const saved = scoreCandidateForBlock(wishPlace, block(), trip);
    const other = scoreCandidateForBlock(place({ name: "Random Spot" }), block(), trip);
    assert.ok(saved > other);
  });

  it("prefers matching meal slot", () => {
    const trip = baseTrip();
    const breakfast = scoreCandidateForBlock(
      place({ mealSlot: "breakfast", kind: "meal" }),
      block({ label: "Breakfast — Shibuya", kind: "meal" }),
      trip
    );
    const dinner = scoreCandidateForBlock(
      place({ mealSlot: "dinner", kind: "meal", name: "Dinner Spot" }),
      block({ label: "Breakfast — Shibuya", kind: "meal" }),
      trip
    );
    assert.ok(breakfast > dinner);
  });

  it("learns from confirmed picks on prior days", () => {
    const confirmed = place({
      name: "Ramen Shop",
      tags: ["food"],
      confidence: "local_hidden_gem",
      neighborhood: "Shinjuku",
    });
    const trip = baseTrip({
      days: [
        {
          dayIndex: 0,
          neighborhoods: ["Shinjuku"],
          blocks: [
            {
              id: "b0",
              kind: "meal",
              label: "Lunch",
              suggestions: [confirmed],
              selectedPlaceId: confirmed.id,
              status: "confirmed",
            },
          ],
        },
      ],
    });
    const similar = scoreCandidateForBlock(
      place({
        name: "Another Ramen",
        tags: ["food"],
        confidence: "local_hidden_gem",
        neighborhood: "Shinjuku",
      }),
      block({ label: "Breakfast — Shinjuku" }),
      trip,
      { confirmedPicks: [confirmed] }
    );
    const different = scoreCandidateForBlock(
      place({
        name: "Museum",
        kind: "activity",
        mealSlot: undefined,
        tags: ["culture"],
        confidence: "widely_recommended",
        neighborhood: "Asakusa",
      }),
      block({ label: "Breakfast — Shinjuku" }),
      trip,
      { confirmedPicks: [confirmed] }
    );
    assert.ok(similar > different);
  });
});

describe("curateSuggestionsForBlock", () => {
  it("returns at least 5 unique suggestions", () => {
    const pool = Array.from({ length: 12 }, (_, i) =>
      place({
        id: `pool-${i}`,
        name: `Spot ${i}`,
        mealSlot: i % 2 === 0 ? "breakfast" : "lunch",
        kind: i % 3 === 0 ? "activity" : "meal",
        neighborhood: i % 2 === 0 ? "Shibuya" : "Shinjuku",
      })
    );
    const trip = baseTrip();
    const result = curateSuggestionsForBlock(block(), pool, trip, {
      newId: () => `gen-${Math.random()}`,
    });
    assert.ok(result.length >= 5);
    assert.ok(result.length <= 7);
    const names = new Set(result.map((p) => p.name.toLowerCase()));
    assert.equal(names.size, result.length);
  });
});
