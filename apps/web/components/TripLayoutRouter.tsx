"use client";

import { usePathname } from "next/navigation";
import { TripShell } from "@/components/TripShell";
import { OwnerTripLayout } from "@/components/OwnerTripLayout";

interface Props {
  tripId: string;
  children: React.ReactNode;
}

/** Setup pages use TripShell; day/map/place use the share experience shell. */
function isShareExperiencePath(pathname: string, tripId: string) {
  const base = `/trip/${tripId}`;
  return (
    pathname.startsWith(`${base}/day/`) ||
    pathname === `${base}/map` ||
    pathname.startsWith(`${base}/place/`)
  );
}

export function TripLayoutRouter({ tripId, children }: Props) {
  const pathname = usePathname();

  if (isShareExperiencePath(pathname, tripId)) {
    return <OwnerTripLayout tripId={tripId}>{children}</OwnerTripLayout>;
  }

  return <TripShell tripId={tripId}>{children}</TripShell>;
}
