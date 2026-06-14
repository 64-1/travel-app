import { redirect } from "next/navigation";

export default async function ItineraryRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/trip/${id}/day/0`);
}
