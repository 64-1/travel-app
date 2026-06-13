import type { DayPlan, Place, PlanBlock, Trip } from "@travel-planner/core";
import { PLACE_IMAGES } from "./place-images";

function img(key: keyof typeof PLACE_IMAGES) {
  const i = PLACE_IMAGES[key];
  return { imageUrl: i.url, imageCredit: i.credit };
}

function place(
  id: string,
  nameI18n: { en: string; zh: string },
  imageKey: keyof typeof PLACE_IMAGES,
  opts: Partial<Place> & Pick<Place, "kind" | "whyRecommended" | "tags">
): Place {
  const { url, credit } = PLACE_IMAGES[imageKey];
  return {
    id,
    name: nameI18n.zh,
    nameI18n,
    neighborhood: opts.neighborhood,
    lat: opts.lat,
    lng: opts.lng,
    kind: opts.kind,
    mealSlot: opts.mealSlot,
    whyRecommended: opts.whyRecommended,
    sourceLinks: opts.sourceLinks ?? [],
    tags: opts.tags,
    confidence: opts.confidence ?? "user_added",
    localTips: opts.localTips,
    isCustom: true,
    imageUrl: url,
    imageCredit: credit,
    intro: opts.intro,
  };
}

function block(id: string, label: string, p: Place): PlanBlock {
  return {
    id,
    kind: p.kind,
    label,
    neighborhood: p.neighborhood,
    suggestions: [p],
    selectedPlaceId: p.id,
    status: "confirmed",
  };
}

function day(
  dayIndex: number,
  theme: string,
  neighborhoods: string[],
  blocks: PlanBlock[]
): DayPlan {
  return { dayIndex, theme, neighborhoods, blocks };
}

const disneyland = place("sh-disney", { en: "Shanghai Disneyland", zh: "上海迪士尼" }, "disneyland", {
  kind: "activity",
  neighborhood: "Pudong",
  lat: 31.144,
  lng: 121.658,
  tags: ["family", "photography"],
  whyRecommended: "Full day at China's flagship Disney resort.",
  intro: {
    en: "Spend a full day at Shanghai Disneyland — home to the tallest Disney castle in the world and unique attractions like TRON Lightcycle Power Run. Arrive early for shorter lines and stay for the evening parade and fireworks over Enchanted Storybook Castle.",
    zh: "在上海迪士尼乐园玩上一整天——这里有全球最高的迪士尼城堡，还有「创极速光轮」等独家项目。建议一早入园错峰排队，晚上不要错过城堡烟火与巡游表演。",
  },
});

const safari = place("sh-safari", { en: "Shanghai Wild Animal Park", zh: "上海野生动物园" }, "safari", {
  kind: "activity",
  neighborhood: "Pudong Nanhui",
  lat: 31.056,
  lng: 121.722,
  tags: ["family", "nature"],
  whyRecommended: "See giraffes, pandas, and drive-through wildlife zones.",
  intro: {
    en: "One of China's largest wildlife parks, where animals roam in open habitats and you can take a bus through predator zones. Great for families — allow half a day; pair with an evening skyline visit in central Pudong.",
    zh: "中国规模领先的野生动物园之一，可乘车穿越猛兽区、漫步散养动物区域。建议预留半天，傍晚可衔接浦东陆家嘴夜景。",
  },
});

const lujiazui = place("sh-lujiazui", { en: "Lujiazui Skyline Trio", zh: "陆家嘴三件套" }, "lujiazui", {
  kind: "activity",
  neighborhood: "Pudong",
  lat: 31.24,
  lng: 121.5,
  tags: ["photography", "culture"],
  whyRecommended: "Iconic trio of Shanghai Tower, Jin Mao Tower, and Oriental Pearl.",
  intro: {
    en: "The famous 'three-piece suit' of Pudong — Shanghai Tower, Jin Mao Tower, and the Oriental Pearl TV Tower. Only ~25 min from the safari park by car; visit at dusk when lights switch on along the riverside promenade.",
    zh: "浦东天际线的标志「三件套」——上海中心、金茂大厦与东方明珠。距野生动物园车程约二十五分钟，傍晚华灯初上时滨江步道最适合拍夜景。",
  },
});

const yuyuan = place("sh-yuyuan", { en: "Yu Garden", zh: "豫园" }, "yuyuan", {
  kind: "activity",
  neighborhood: "Old City",
  lat: 31.227,
  lng: 121.492,
  tags: ["culture", "photography"],
  whyRecommended: "Ming-era classical garden in the heart of old Shanghai.",
  intro: {
    en: "A 400-year-old classical Chinese garden with dragon walls, ponds, and pavilions tucked beside the old city bazaar. Start here before the crowds — City God Temple is a five-minute walk south.",
    zh: "始建于明代的江南古典园林，曲桥亭台与城隍庙商圈比邻。建议作为老城行程第一站，城隍庙步行五分钟即达。",
  },
});

const chenghuang = place("sh-chenghuang", { en: "City God Temple", zh: "城隍庙" }, "chenghuang", {
  kind: "activity",
  neighborhood: "Old City",
  lat: 31.226,
  lng: 121.493,
  tags: ["culture", "food", "shopping"],
  whyRecommended: "Historic temple surrounded by snack streets and old-town energy.",
  intro: {
    en: "Steps from Yu Garden — snack stalls, tea houses, and souvenir lanes radiate from the temple. Sample xiaolongbao or sweet rice cakes, then walk northwest toward Nanjing Road.",
    zh: "与豫园仅一步之遥，小吃摊与茶楼环绕城隍庙。品尝小笼或海棠糕后，向西北步行即可抵达南京路方向。",
  },
});

const jiajia = place("sh-jiajia", { en: "Jia Jia Soup Dumplings", zh: "佳家汤包" }, "jiajia", {
  kind: "meal",
  mealSlot: "lunch",
  neighborhood: "Huangpu",
  lat: 31.228,
  lng: 121.478,
  tags: ["food"],
  whyRecommended: "Cult-favorite xiaolongbao spot on many must-eat lists.",
  intro: {
    en: "On the walk toward People's Square and Nanjing Road — a local favorite for thin-skinned soup dumplings. Order pork or crab roe fillings and dip in ginger vinegar.",
    zh: "位于走向人民广场与南京路的途中，本地人常去的汤包名店。蟹粉或鲜肉馅都值得点，蘸姜醋食用风味最佳。",
  },
});

const nanjinglu = place("sh-nanjinglu", { en: "Nanjing Road", zh: "南京路" }, "nanjinglu", {
  kind: "activity",
  neighborhood: "Huangpu",
  lat: 31.235,
  lng: 121.475,
  tags: ["shopping", "photography"],
  whyRecommended: "Shanghai's premier pedestrian shopping boulevard.",
  intro: {
    en: "Continue north from the old city — East Nanjing Road's pedestrian mall stretches toward the Bund with flagship stores and neon signs. Best after dark when the street buzzes.",
    zh: "从老城厢向北延伸，南京路步行街直通外滩方向，百货与霓虹招牌林立。夜晚灯火通明时最有氛围。",
  },
});

const lailai = place("sh-lailai", { en: "Lai Lai Xiaolong", zh: "莱莱小笼" }, "lailai", {
  kind: "meal",
  mealSlot: "snack",
  neighborhood: "Huangpu",
  lat: 31.228,
  lng: 121.47,
  tags: ["food", "photography"],
  whyRecommended: "Colorful xiaolongbao that's endlessly photogenic.",
  intro: {
    en: "Near Nanjing Road and People's Square — famous on Xiaohongshu for vivid colored soup dumplings. A quick stop before heading back south for dinner in the old city.",
    zh: "毗邻人民广场商圈，小红书超高人气的彩色小笼包。在南京路逛街后，可顺路品尝再折返老城晚餐。",
  },
});

const hongling = place("sh-hongling", { en: "Hong Ling Restaurant", zh: "宏玲餐厅" }, "hongling", {
  kind: "meal",
  mealSlot: "dinner",
  neighborhood: "Huangpu",
  lat: 31.219,
  lng: 121.492,
  tags: ["food", "culture"],
  whyRecommended: "Beloved old-school Shanghainese benbang cooking.",
  intro: {
    en: "Back in the old city south of Yu Garden — a no-fuss institution for braised pork belly, sweet-and-sour spare ribs, and seasonal river shrimp. End Day 3 where you started.",
    zh: "回到豫园南侧老城厢，本帮菜小馆的红烧肉、糖醋小排与油爆虾深受本地人喜爱。第三天行程在此完美收尾。",
  },
});

const wukang = place("sh-wukang", { en: "Wukang Road", zh: "武康路" }, "wukang", {
  kind: "activity",
  neighborhood: "Former French Concession",
  lat: 31.204,
  lng: 121.44,
  tags: ["photography", "culture"],
  whyRecommended: "Tree-lined street of historic villas and cafés.",
  intro: {
    en: "Start the west-side walking day among plane trees, art deco apartments, and the landmark Wukang Mansion. From here, head northeast toward Jing'an.",
    zh: "西区漫步的起点——梧桐、老洋房与武康大楼地标。由此向东北方向步行，可衔接静安寺与淮海路。",
  },
});

const huji = place("sh-huji", { en: "Hu Ji A-Zhong Pot Stickers", zh: "胡记阿忠特色锅贴" }, "huji", {
  kind: "meal",
  mealSlot: "lunch",
  neighborhood: "Xuhui",
  lat: 31.198,
  lng: 121.44,
  tags: ["food"],
  whyRecommended: "Crispy-bottomed pot stickers locals queue for.",
  intro: {
    en: "Right in the French Concession near Wukang Road — specialists in guotie with a shatteringly crisp base. Eat fresh off the griddle before continuing east.",
    zh: "武康路附近的街坊锅贴名店，底部焦脆、肉馅多汁。吃饱后向东步行，一路逛向静安与淮海。",
  },
});

const jingan = place("sh-jingan", { en: "Jing'an Temple", zh: "静安寺" }, "jingan", {
  kind: "activity",
  neighborhood: "Jing'an",
  lat: 31.223,
  lng: 121.446,
  tags: ["culture", "photography"],
  whyRecommended: "Ancient temple glowing gold amid skyscrapers.",
  intro: {
    en: "~15 min walk northeast from Wukang Road — a Tang-dynasty temple in gleaming gold, framed by glass towers. The perfect midpoint on today's eastward stroll.",
    zh: "从武康路步行约十五分钟可达，金顶古寺与摩天楼同框。是今日自西向东漫步路线的绝佳中点。",
  },
});

const huaihai = place("sh-huaihai", { en: "Huaihai Road", zh: "淮海路" }, "huaihai", {
  kind: "activity",
  neighborhood: "Huangpu / Xuhui",
  lat: 31.22,
  lng: 121.465,
  tags: ["shopping", "culture"],
  whyRecommended: "Elegant shopping avenue with boutiques and heritage architecture.",
  intro: {
    en: "Continue east from Jing'an Temple along Huaihai Road — designer boutiques, historic apartments, and leafy alleys. Dinner options line this corridor.",
    zh: "从静安寺沿淮海中路向东，精品店与老公寓林立。沿线多家餐馆，适合安排晚餐。",
  },
});

const lüya = place("sh-lüya", { en: "Lü Ya Restaurant", zh: "绿雅酒家" }, "lüya", {
  kind: "meal",
  mealSlot: "dinner",
  neighborhood: "Huangpu",
  lat: 31.222,
  lng: 121.485,
  tags: ["food"],
  whyRecommended: "Traditional Shanghainese flavors in a classic setting.",
  intro: {
    en: "Right off Huaihai Road — refined benbang home cooking with smoked fish and slow-braised dishes. A relaxed early dinner before a short metro hop south to San Ma Lu.",
    zh: "毗邻淮海路的本帮菜酒家，熏鱼与红烧类热菜都很出彩。可先在此用餐，再乘地铁南行前往三玛璐。",
  },
});

const sanmalu = place("sh-sanmalu", { en: "San Ma Lu Restaurant", zh: "三玛璐酒楼" }, "sanmalu", {
  kind: "meal",
  mealSlot: "dinner",
  neighborhood: "Old City",
  lat: 31.218,
  lng: 121.488,
  tags: ["food"],
  whyRecommended: "Old-school Shanghainese banquet-style cooking.",
  intro: {
    en: "~10 min metro south from Huaihai Road into the old city — a traditional benbang restaurant with generous banquet-style dishes. End Day 4 near where Day 3 began.",
    zh: "从淮海路乘地铁约十分钟可达老城厢，老牌本帮酒楼菜式地道、分量实在。第四天行程在南外滩老城完美收官。",
  },
});

const laodifang = place("sh-laodifang", { en: "Lao Di Fang Noodles", zh: "老地方面馆" }, "laodifang", {
  kind: "meal",
  mealSlot: "lunch",
  neighborhood: "Putuo",
  lat: 31.262,
  lng: 121.478,
  tags: ["food"],
  whyRecommended: "Michelin Bib Gourmand noodle shop — great value.",
  intro: {
    en: "Start the northern loop in Putuo — a 2025 Michelin Bib Gourmand pick for honest Shanghai noodles under ¥30. Then metro southwest to Gubei for Japanese food.",
    zh: "北线行程从普陀起步，米其林必比登推介的本帮面馆，咸菜目鱼拌面人均不到三十元。随后乘地铁前往古北享用日料。",
  },
});

const gubei = place("sh-gubei", { en: "Gubei Japanese Food Street", zh: "古北日料一条街" }, "gubei", {
  kind: "meal",
  mealSlot: "lunch",
  neighborhood: "Gubei / Hongqiao",
  lat: 31.196,
  lng: 121.405,
  tags: ["food", "culture"],
  whyRecommended: "Tokyo-like concentration of Japanese restaurants on Golden Street.",
  intro: {
    en: "Shanghai's 'Little Tokyo' on Golden Street — try Shokudō Zhiteng, Chūdai Mishizō, or Tetote izakaya. ~20 min northeast by metro to Wujiaochang for Chiikawa.",
    zh: "黄金城道被誉为上海「小东京」，植藤、初代味藏、TETOTE 居酒屋都值得尝试。用餐后乘地铁约二十分钟可达五角场。",
  },
});

const chiikawa = place("sh-chiikawa", { en: "Chiikawa Pop-up", zh: "吉伊卡哇快闪店" }, "chiikawa", {
  kind: "activity",
  neighborhood: "Wujiaochang",
  lat: 31.3,
  lng: 121.515,
  tags: ["shopping", "photography", "family"],
  whyRecommended: "Limited-time Chiikawa pop-up with merch and photo spots.",
  intro: {
    en: "At Wujiaochang Hopson One (May 11 – Jun 29, 2026) — free entry, photo walls, and exclusive merch. Metro south toward People's Square for your evening escape room.",
    zh: "吉伊卡哇快闪位于五角场合生汇（2026.5.11–6.29），免费入场、限定周边齐全。打卡后乘地铁南下人民广场方向，衔接晚间密室。",
  },
});

const mrx = place("sh-mrx", { en: "Mr.X Escape Room", zh: "MrX密室" }, "mrx", {
  kind: "activity",
  neighborhood: "Huangpu",
  lat: 31.23,
  lng: 121.474,
  tags: ["nightlife", "family"],
  whyRecommended: "Immersive escape rooms — a fun evening activity.",
  intro: {
    en: "Central Shanghai, easy to reach from Wujiaochang via metro — cinematic sets and clever puzzles. Book an evening slot and pick a theme that suits your group.",
    zh: "位于市中心人民广场商圈，从五角场乘地铁即可到达。场景精良、谜题有趣，建议提前预订晚间场次。",
  },
});

/**
 * Itinerary grouped by geographic proximity:
 * D1 Pudong east (Disney) | D2 Pudong south→central (Safari→Lujiazui)
 * D3 Old City loop (Yu Garden→Nanjing Rd→back south) | D4 West→East walk (Wukang→Huaihai)
 * D5 North arc (Putuo→Gubei→Wujiaochang→central)
 */
const days: DayPlan[] = [
  day(0, "童话一日 · Fairy-tale Day", ["Pudong · 浦东"], [
    block("d1-b1", "Full day", disneyland),
  ]),
  day(1, "浦东纵贯 · Pudong Day", ["Pudong Nanhui → Lujiazui · 南汇 → 陆家嘴"], [
    block("d2-b1", "Morning – Afternoon", safari),
    block("d2-b2", "Evening", lujiazui),
  ]),
  day(2, "老城环线 · Old City Loop", ["Old City → Nanjing Rd → Old City · 老城厢 → 南京路"], [
    block("d3-b1", "Morning", yuyuan),
    block("d3-b2", "Morning", chenghuang),
    block("d3-b3", "Lunch", jiajia),
    block("d3-b4", "Afternoon", nanjinglu),
    block("d3-b5", "Snack", lailai),
    block("d3-b6", "Dinner", hongling),
  ]),
  day(3, "梧桐东行 · Concession to Huaihai", ["Wukang → Jing'an → Huaihai → Old City · 武康 → 淮海 → 老城"], [
    block("d4-b1", "Morning", wukang),
    block("d4-b2", "Lunch", huji),
    block("d4-b3", "Afternoon", jingan),
    block("d4-b4", "Afternoon", huaihai),
    block("d4-b5", "Dinner", lüya),
    block("d4-b6", "Late dinner", sanmalu),
  ]),
  day(4, "北线萌力 · North Arc", ["Putuo → Gubei → Wujiaochang → Downtown · 普陀 → 古北 → 五角场 → 市中心"], [
    block("d5-b1", "Brunch", laodifang),
    block("d5-b2", "Lunch", gubei),
    block("d5-b3", "Afternoon", chiikawa),
    block("d5-b4", "Evening", mrx),
  ]),
];

/** All catalogued stops — for "add from list" picker */
export const SHANGHAI_PLACE_CATALOG: Place[] = [
  disneyland,
  safari,
  lujiazui,
  yuyuan,
  chenghuang,
  jiajia,
  nanjinglu,
  lailai,
  hongling,
  wukang,
  huji,
  jingan,
  huaihai,
  lüya,
  sanmalu,
  laodifang,
  gubei,
  chiikawa,
  mrx,
];

export const shanghaiDemoTrip: Trip = {
  id: "demo-shanghai",
  destination: "Shanghai",
  country: "China",
  startDate: "2026-06-01",
  endDate: "2026-06-05",
  interests: ["food", "culture", "shopping", "photography", "family"],
  pace: "balanced",
  constraints: {
    budget: "mid",
    mobility: "moderate",
    vibe: "balanced",
    groupType: "friends",
  },
  wishlist: [],
  days,
  daysGenerated: 5,
};
