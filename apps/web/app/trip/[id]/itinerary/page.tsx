import { redirect } from "next/navigation";

export default async function OwnerItineraryIndex({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/trip/${id}/itinerary/day/0`);
}
