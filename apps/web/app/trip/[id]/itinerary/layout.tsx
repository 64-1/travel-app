import { OwnerTripLayout } from "@/components/OwnerTripLayout";

export default async function OwnerItineraryLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OwnerTripLayout tripId={id}>{children}</OwnerTripLayout>;
}
