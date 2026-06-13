"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Volume2, VolumeX } from "lucide-react";
import type { HeroVideoConfig } from "@/lib/demo/place-images";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

interface Props {
  config: HeroVideoConfig;
  alt: string;
  className?: string;
}

function prefersReducedData() {
  if (typeof navigator === "undefined") return false;
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } })
    .connection;
  if (!conn) return false;
  if (conn.saveData) return true;
  const slow = conn.effectiveType === "slow-2g" || conn.effectiveType === "2g";
  return slow;
}

export function ShareHeroMedia({ config, alt, className }: Props) {
  const { t } = useI18n();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [sourceIndex, setSourceIndex] = useState(0);
  const [useImage, setUseImage] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [saveData, setSaveData] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [audioOn, setAudioOn] = useState(false);
  const source = config.sources[sourceIndex];
  const showAudio = config.audio && !useImage && !reduceMotion && !saveData;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    setSaveData(prefersReducedData());
    const onChange = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    setIsReady(false);
    setAudioOn(false);
  }, [sourceIndex]);

  useEffect(() => {
    if (reduceMotion || useImage || saveData) return;
    const video = videoRef.current;
    if (!video) return;

    const play = () => {
      video.muted = !audioOn;
      void video.play().catch(() => setUseImage(true));
    };

    play();
    video.addEventListener("canplay", play);
    return () => video.removeEventListener("canplay", play);
  }, [reduceMotion, useImage, saveData, sourceIndex, audioOn]);

  function handleVideoError() {
    if (sourceIndex < config.sources.length - 1) {
      setSourceIndex((i) => i + 1);
      return;
    }
    setUseImage(true);
  }

  function toggleAudio() {
    const video = videoRef.current;
    if (!video) return;
    const next = !audioOn;
    video.muted = !next;
    setAudioOn(next);
    void video.play().catch(() => {});
  }

  if (reduceMotion || useImage || saveData || !source) {
    return (
      <Image
        src={config.poster}
        alt={alt}
        fill
        priority
        unoptimized
        className={className}
        sizes="(max-width: 768px) 100vw, 1280px"
      />
    );
  }

  const preload = config.preload ?? "metadata";

  return (
    <>
      <video
        key={source.src}
        ref={videoRef}
        className={className}
        autoPlay
        muted={!audioOn}
        loop
        playsInline
        preload={preload}
        poster={config.poster}
        onError={handleVideoError}
        onCanPlay={() => setIsReady(true)}
        onPlaying={() => setIsReady(true)}
      >
        <source src={source.src} type={source.type} />
      </video>

      {!isReady && (
        <Image
          src={config.poster}
          alt=""
          aria-hidden
          fill
          priority
          unoptimized
          className={cn(className, "z-[1]")}
          sizes="(max-width: 768px) 100vw, 1280px"
        />
      )}

      {showAudio && (
        <button
          type="button"
          onClick={toggleAudio}
          className="share-focus absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/65"
          aria-label={audioOn ? t("share.heroMute") : t("share.heroUnmute")}
          title={audioOn ? t("share.heroMute") : t("share.heroTapSound")}
        >
          {audioOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </button>
      )}
    </>
  );
}
