/**
 * Shanghai demo images — local uploads where available, remote fallbacks for the rest.
 *
 * Your photos: apps/web/public/demo/shanghai/
 * Remote images: Wikimedia Commons + Unsplash (no upload needed).
 */

const local = (filename: string) => `/demo/shanghai/${filename}`;

const wiki = (path: string) =>
  `https://upload.wikimedia.org/wikipedia/commons/thumb/${path}`;

const unsplash = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;

export const SHANGHAI_HERO = wiki(
  "d/df/Pudong_Shanghai_November_2017_panorama.jpg/1920px-Pudong_Shanghai_November_2017_panorama.jpg"
);

/** Bund timelapse — CC BY, loops in the hero banner (~37s). */
const SHANGHAI_HERO_VIDEO_REMOTE =
  "https://upload.wikimedia.org/wikipedia/commons/transcoded/9/91/Shanghai_Bund%2C_Lujiazui_Skyline_Timelapse.webm/Shanghai_Bund%2C_Lujiazui_Skyline_Timelapse.webm.480p.vp9.webm";

export interface HeroVideoConfig {
  sources: { src: string; type: string }[];
  poster: string;
  credit?: string;
  /** Show unmute control — browsers require a tap before audio can play. */
  audio?: boolean;
  /** metadata = fast first paint; auto = buffer more (use only for small files). */
  preload?: "none" | "metadata" | "auto";
}

/**
 * Hero video for the trip banner.
 *
 * Place files in: apps/web/public/demo/shanghai/
 *   hero.mp4      — your clip (recommend 1080p H.264, ~10–15 MB, faststart)
 *   hero.webm     — optional smaller VP9 copy for faster loads
 *   hero-poster.jpg — optional still (falls back to remote skyline photo)
 */
export const SHANGHAI_HERO_VIDEO: HeroVideoConfig = {
  sources: [
    { src: local("hero.mp4"), type: "video/mp4" },
    { src: SHANGHAI_HERO_VIDEO_REMOTE, type: "video/webm" },
  ],
  poster: SHANGHAI_HERO,
  audio: true,
  preload: "auto",
  credit: "Wikimedia Commons",
};

export const PLACE_IMAGES = {
  // Your uploads
  disneyland: { url: local("disneyland.jpg"), credit: "" },
  safari: { url: local("safari.jpg"), credit: "" },
  yuyuan: { url: local("yuyuan.jpg"), credit: "" },
  jiajia: { url: local("jiajia.jpg"), credit: "" },
  lailai: { url: local("lailai.jpg"), credit: "" },
  hongling: { url: local("hongling.jpg"), credit: "" },
  huji: { url: local("huji.jpg"), credit: "" },
  sanmalu: { url: local("sanmalu.jpg"), credit: "" },
  gubei: { url: local("gubei.jpg"), credit: "" },
  chiikawa: { url: local("chiikawa.jfif"), credit: "" },
  mrx: { url: local("mrx.jpg"), credit: "" },

  // Original remote photos (not uploaded locally)
  lujiazui: {
    url: wiki("d/df/Pudong_Shanghai_November_2017_panorama.jpg/1280px-Pudong_Shanghai_November_2017_panorama.jpg"),
    credit: "Wikimedia Commons / King of Hearts",
  },
  chenghuang: {
    url: wiki(
      "3/37/%E5%9F%8E%E9%9A%8D%E5%BA%99%C2%B7%E4%B8%8A%E6%B5%B7%E5%8D%97%E5%B8%82.jpg/1280px-%E5%9F%8E%E9%9A%8D%E5%BA%99%C2%B7%E4%B8%8A%E6%B5%B7%E5%8D%97%E5%B8%82.jpg"
    ),
    credit: "Wikimedia Commons",
  },
  laodifang: {
    url: unsplash("1569718212165-3a8278d5f624"),
    credit: "Unsplash",
  },
  nanjinglu: {
    url: wiki(
      "9/9f/East_Nanjing_Road_2020_%2850361842166%29.jpg/1280px-East_Nanjing_Road_2020_%2850361842166%29.jpg"
    ),
    credit: "Wikimedia Commons / N509FZ",
  },
  wukang: {
    url: wiki("2/27/Wukang_109.JPG/1280px-Wukang_109.JPG"),
    credit: "Wikimedia Commons",
  },
  lüya: {
    url: unsplash("1555396273-367ea4eb4db5"),
    credit: "Unsplash",
  },
  jingan: {
    url: wiki(
      "1/17/%E9%9D%99%E5%AE%89%E5%AF%BA%C2%B7%E4%B8%8A%E6%B5%B7%E9%9D%99%E5%AE%89.jpg/1280px-%E9%9D%99%E5%AE%89%E5%AF%BA%C2%B7%E4%B8%8A%E6%B5%B7%E9%9D%99%E5%AE%89.jpg"
    ),
    credit: "Wikimedia Commons",
  },
  huaihai: {
    url: wiki("3/39/Middle_Huaihai_Rd._2.JPG/1280px-Middle_Huaihai_Rd._2.JPG"),
    credit: "Wikimedia Commons",
  },
} as const;
