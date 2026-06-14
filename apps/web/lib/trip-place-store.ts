import type { LocalizedText, PlaceDetailRecord } from "@travel-planner/core";

let tripPlaceDetails: Record<string, PlaceDetailRecord> = {};
let tripPlaceAbout: Record<string, LocalizedText> = {};

export function setTripPlaceContext(
  details?: Record<string, PlaceDetailRecord>,
  about?: Record<string, LocalizedText>
) {
  tripPlaceDetails = details ?? {};
  tripPlaceAbout = about ?? {};
}

export function clearTripPlaceContext() {
  tripPlaceDetails = {};
  tripPlaceAbout = {};
}

export function getTripStoredPlaceDetails(placeId: string): PlaceDetailRecord | undefined {
  return tripPlaceDetails[placeId];
}

export function getTripStoredPlaceAbout(placeId: string): LocalizedText | undefined {
  return tripPlaceAbout[placeId];
}
