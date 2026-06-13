import type { PlaceDetailRecord } from "@/lib/demo/place-details";

let runtime: Record<string, PlaceDetailRecord> = {};

export function getRuntimePlaceDetails(placeId: string): PlaceDetailRecord | undefined {
  return runtime[placeId];
}

export function registerPlaceDetail(placeId: string, details: PlaceDetailRecord) {
  runtime[placeId] = details;
}

export function setRuntimePlaceDetails(map: Record<string, PlaceDetailRecord>) {
  runtime = map;
}

export function getAllRuntimePlaceDetails() {
  return runtime;
}
