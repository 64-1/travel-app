import { TripLayoutRouter } from "@/components/TripLayoutRouter";

export default async function TripLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TripLayoutRouter tripId={id}>{children}</TripLayoutRouter>;
}
