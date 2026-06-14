import { redirect } from "next/navigation";
import { getDemoTrip } from "@/lib/destinations/registry";

export default async function DemoSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!getDemoTrip(slug)) redirect("/");
  redirect(`/demo/${slug}/day/0`);
}
