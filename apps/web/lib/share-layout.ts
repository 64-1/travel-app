import { cn } from "@/lib/utils";

/** Responsive shell width — narrow on mobile, wide on desktop */
export function shareShellWidth(isPlacePage: boolean) {
  return cn(
    "mx-auto w-full px-4 sm:px-6 lg:px-8",
    isPlacePage
      ? "max-w-lg sm:max-w-2xl lg:max-w-6xl xl:max-w-7xl"
      : "max-w-lg sm:max-w-2xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl"
  );
}
