"use client";

import { useParams } from "next/navigation";
import { ShareMapPanel } from "@/components/ShareDayPanel";
import { useEditableTrip } from "@/lib/editable-trip-context";

export default function DemoMapPage() {
  const { slug } = useParams<{ slug: string }>();
  const { trip } = useEditableTrip();
  return <ShareMapPanel trip={trip} basePath={`/demo/${slug}`} />;
}
