"use client";

import { useParams } from "next/navigation";
import { ShareMapPanel } from "@/components/ShareDayPanel";
import { useEditableTrip } from "@/lib/editable-trip-context";

export default function ShareMapPage() {
  const { token } = useParams<{ token: string }>();
  const { trip } = useEditableTrip();
  return <ShareMapPanel trip={trip} basePath={`/share/${token}`} />;
}
