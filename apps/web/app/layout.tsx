import type { Metadata, Viewport } from "next";
import { DM_Sans, Noto_Serif_SC } from "next/font/google";
import { ToastProvider } from "@/components/Toast";
import { I18nProvider } from "@/lib/i18n/context";
import "./globals.css";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-share-sans" });
const notoSerifSc = Noto_Serif_SC({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-share-serif",
});

export const metadata: Metadata = {
  title: "Travel Planner",
  description: "Turn your saved posts and reviews into a flexible day-by-day plan.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Travel Planner",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#9b2d30",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${dmSans.variable} ${notoSerifSc.variable} antialiased font-[family-name:var(--font-share-sans)]`}>
        <I18nProvider>
          <ToastProvider>{children}</ToastProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
