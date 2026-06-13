import type { Metadata } from "next";
import { DemoTripLayout } from "@/components/DemoTripLayout";
import { shanghaiDemoMetadata } from "@/lib/share-metadata";

export const metadata: Metadata = shanghaiDemoMetadata;

export default function ShanghaiDemoLayout({ children }: { children: React.ReactNode }) {
  return <DemoTripLayout>{children}</DemoTripLayout>;
}
