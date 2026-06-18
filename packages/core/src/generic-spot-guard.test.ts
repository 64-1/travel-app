import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  cacheRemovalRatio,
  dayContainsGenericContent,
  isDefaultMockTheme,
  isGenericPlace,
  stripGenericCandidates,
} from "./generic-spot-guard";
import { hasCuratedMockDestination } from "./mock-destinations";
import type { DayPlan, Place } from "./types";

function place(name: string, neighborhood = "Queenstown"): Place {
  return {
    id: "p1",
    name,
    neighborhood,
    kind: "activity",
    whyRecommended: "Nice",
    sourceLinks: [],
    tags: ["culture"],
    confidence: "widely_recommended",
    isCustom: false,
  };
}

describe("generic-spot-guard", () => {
  it("flags DEFAULT_SPOTS names as generic", () => {
    assert.equal(isGenericPlace(place("Morning Market Cafe", "City Center")), true);
    assert.equal(isGenericPlace(place("Skyline Gondola", "Queenstown")), false);
  });

  it("stripGenericCandidates removes mock placeholders", () => {
    const pool = [
      place("Morning Market Cafe"),
      place("Fergburger", "Queenstown"),
      place("Historic Main Square"),
    ];
    const stripped = stripGenericCandidates(pool);
    assert.equal(stripped.length, 1);
    assert.equal(stripped[0].name, "Fergburger");
  });

  it("detects default mock day themes", () => {
    assert.equal(isDefaultMockTheme("City Center & Old Town"), true);
    assert.equal(isDefaultMockTheme("Queenstown & Arrowtown"), false);
  });

  it("dayContainsGenericContent catches generic suggestions", () => {
    const day: DayPlan = {
      dayIndex: 0,
      date: "2026-01-01",
      theme: "Queenstown & Glenorchy",
      neighborhoods: ["Queenstown"],
      blocks: [
        {
          id: "b1",
          kind: "meal",
          label: "Breakfast",
          neighborhood: "Queenstown",
          suggestions: [place("Morning Market Cafe")],
          status: "suggested",
        },
      ],
    };
    assert.equal(dayContainsGenericContent(day), true);
  });

  it("cacheRemovalRatio measures stripped fraction", () => {
    const original = [place("A"), place("Morning Market Cafe"), place("B")];
    const stripped = stripGenericCandidates(original);
    assert.ok(cacheRemovalRatio(original, stripped) > 0.1);
  });
});

describe("hasCuratedMockDestination", () => {
  it("returns true for Tokyo and Osaka", () => {
    assert.equal(hasCuratedMockDestination("Tokyo"), true);
    assert.equal(hasCuratedMockDestination("Osaka"), true);
  });

  it("returns false for unknown destinations", () => {
    assert.equal(hasCuratedMockDestination("Queenstown"), false);
    assert.equal(hasCuratedMockDestination("New Zealand"), false);
    assert.equal(hasCuratedMockDestination("Ljubljana"), false);
  });
});
