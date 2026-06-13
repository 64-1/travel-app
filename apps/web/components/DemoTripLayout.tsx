"use client";

import { TripShareShell } from "@/components/TripShareShell";
import { EditableTripProvider, useEditableTrip } from "@/lib/editable-trip-context";
import { shanghaiDemoTrip } from "@/lib/demo/shanghai-trip";

function DemoTripShell({ children }: { children: React.ReactNode }) {
  const { trip } = useEditableTrip();
  return (
    <TripShareShell trip={trip} basePath="/demo/shanghai" mode="demo">
      {children}
    </TripShareShell>
  );
}

export function DemoTripLayout({ children }: { children: React.ReactNode }) {
  return (
    <EditableTripProvider tripId="demo-shanghai" initialTrip={shanghaiDemoTrip}>
      <DemoTripShell>{children}</DemoTripShell>
    </EditableTripProvider>
  );
}
