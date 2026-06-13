import type { Metadata } from "next";
import { ShareTripLayout } from "@/components/ShareTripLayout";
import { metadataForShareToken } from "@/lib/share-metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  return metadataForShareToken(token);
}

export default async function ShareTokenLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <ShareTripLayout token={token}>{children}</ShareTripLayout>;
}
