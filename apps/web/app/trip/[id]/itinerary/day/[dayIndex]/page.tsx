import { redirect } from "next/navigation";

export default async function ItineraryDayRedirect({
  params,
}: {
  params: Promise<{ id: string; dayIndex: string }>;
}) {
  const { id, dayIndex } = await params;
  redirect(`/trip/${id}/day/${dayIndex}`);
}
