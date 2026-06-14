import { redirect } from "next/navigation";

export default async function ItineraryPlaceRedirect({
  params,
}: {
  params: Promise<{ id: string; placeId: string }>;
}) {
  const { id, placeId } = await params;
  redirect(`/trip/${id}/place/${placeId}`);
}
