import { redirect } from "next/navigation";

export default async function ItineraryMapRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/trip/${id}/map`);
}
