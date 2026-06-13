"use client";

import { ShareMapPanel } from "@/components/ShareDayPanel";
import { useEditableTrip } from "@/lib/editable-trip-context";

export default function ShanghaiMapPage() {
  const { trip } = useEditableTrip();
  return <ShareMapPanel trip={trip} basePath="/demo/shanghai" />;
}
