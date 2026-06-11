"use client";

import { TripShareView } from "@/components/TripShareView";
import { shanghaiDemoTrip } from "@/lib/demo/shanghai-trip";

export default function ShanghaiDemoPage() {
  return <TripShareView trip={shanghaiDemoTrip} mode="demo" />;
}
