import type { Metadata } from "next";
import { DemoTripLayout } from "@/components/DemoTripLayout";
import { getDemoTrip } from "@/lib/destinations/registry";
import { metadataForTrip } from "@/lib/share-metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const trip = getDemoTrip(slug);
  if (!trip) return { title: "Demo not found" };
  return metadataForTrip(trip, `/demo/${slug}/day/0`);
}

export default async function DemoSlugLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <DemoTripLayout slug={slug}>{children}</DemoTripLayout>;
}
