"use client";

import { useState } from "react";
import Image from "next/image";
import { Camera } from "lucide-react";

interface Props {
  src: string;
  alt: string;
  className?: string;
}

export function SharePlaceImage({ src, alt, className }: Props) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`absolute inset-0 bg-gradient-to-br from-[#9B2D30]/35 via-[#1a1a2e]/50 to-[#C9A227]/25 ${className ?? ""}`}
      >
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_30%_20%,#C9A227_0%,transparent_50%),radial-gradient(circle_at_70%_80%,#9B2D30_0%,transparent_45%)]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Camera className="h-10 w-10 text-white/40" strokeWidth={1.25} />
        </div>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      unoptimized
      className={className}
      sizes="(max-width: 768px) 100vw, 720px"
      onError={() => setFailed(true)}
    />
  );
}
