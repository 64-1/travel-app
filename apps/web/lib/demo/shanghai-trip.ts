import type { DayPlan, Place, PlanBlock, Trip } from "@travel-planner/core";

function place(
  id: string,
  nameI18n: { en: string; zh: string },
  opts: Partial<Place> & Pick<Place, "kind" | "whyRecommended" | "tags">
): Place {
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
    imageUrl: opts.imageUrl,
    imageCredit: opts.imageCredit,
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

const disneyland = place("sh-disney", { en: "Shanghai Disneyland", zh: "上海迪士尼" }, {
  kind: "activity",
  neighborhood: "Pudong",
  lat: 31.144,
  lng: 121.658,
  tags: ["family", "photography"],
  whyRecommended: "Full day at China's flagship Disney resort.",
  imageUrl:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Enchanted_Storybook_Castle_of_Shanghai_Disneyland.jpg/1280px-Enchanted_Storybook_Castle_of_Shanghai_Disneyland.jpg",
  imageCredit: "Wikimedia Commons / Jeff Ng",
  intro: {
    en: "Spend a full day at Shanghai Disneyland — home to the tallest Disney castle in the world and unique attractions like TRON Lightcycle Power Run. Arrive early for shorter lines and stay for the evening parade and fireworks over Enchanted Storybook Castle.",
    zh: "在上海迪士尼乐园玩上一整天——这里有全球最高的迪士尼城堡，还有「创极速光轮」等独家项目。建议一早入园错峰排队，晚上不要错过城堡烟火与巡游表演。",
  },
});

const safari = place("sh-safari", { en: "Shanghai Wild Animal Park", zh: "上海野生动物园" }, {
  kind: "activity",
  neighborhood: "Pudong Nanhui",
  lat: 31.056,
  lng: 121.722,
  tags: ["family", "nature"],
  whyRecommended: "See giraffes, pandas, and drive-through wildlife zones.",
  imageUrl:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Giraffes_in_Shanghai_Wild_Animal_Park.jpg/1280px-Giraffes_in_Shanghai_Wild_Animal_Park.jpg",
  imageCredit: "Wikimedia Commons",
  intro: {
    en: "One of China's largest wildlife parks, where animals roam in open habitats and you can take a bus through predator zones. Great for families — allow half a day and bring snacks; it's a bit far from downtown.",
    zh: "中国规模领先的野生动物园之一，可乘车穿越猛兽区、漫步散养动物区域，适合亲子出游。园区距市区较远，建议预留半天并备好饮水零食。",
  },
});

const lujiazui = place("sh-lujiazui", { en: "Lujiazui Skyline Trio", zh: "陆家嘴三件套" }, {
  kind: "activity",
  neighborhood: "Pudong",
  lat: 31.24,
  lng: 121.5,
  tags: ["photography", "culture"],
  whyRecommended: "Iconic trio of Shanghai Tower, Jin Mao Tower, and Oriental Pearl.",
  imageUrl:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Pudong_Shanghai_November_2017_panorama.jpg/1280px-Pudong_Shanghai_November_2017_panorama.jpg",
  imageCredit: "Wikimedia Commons / King of Hearts",
  intro: {
    en: "The famous 'three-piece suit' of Pudong — Shanghai Tower, Jin Mao Tower, and the Oriental Pearl TV Tower — defines the modern Shanghai skyline. Visit at dusk when lights switch on; the riverside promenade is perfect for photos.",
    zh: "浦东天际线的标志「三件套」——上海中心、金茂大厦与东方明珠。傍晚华灯初上时最好看，滨江步道是拍夜景的绝佳机位。",
  },
});

const yuyuan = place("sh-yuyuan", { en: "Yu Garden", zh: "豫园" }, {
  kind: "activity",
  neighborhood: "Old City",
  lat: 31.227,
  lng: 121.492,
  tags: ["culture", "photography"],
  whyRecommended: "Ming-era classical garden in the heart of old Shanghai.",
  imageUrl:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Yu_Garden_shanghai.jpg/1280px-Yu_Garden_shanghai.jpg",
  imageCredit: "Wikimedia Commons",
  intro: {
    en: "A 400-year-old classical Chinese garden with dragon walls, ponds, and pavilions tucked beside the old city bazaar. Go early to beat tour groups and wander the rockeries and corridors at a slow pace.",
    zh: "始建于明代的江南古典园林，曲桥亭台、假山池沼与城隍庙商圈比邻。建议早上开园即入，在龙墙与花厅间慢慢逛，感受老城韵味。",
  },
});

const chenghuang = place("sh-chenghuang", { en: "City God Temple", zh: "城隍庙" }, {
  kind: "activity",
  neighborhood: "Old City",
  lat: 31.226,
  lng: 121.493,
  tags: ["culture", "food", "shopping"],
  whyRecommended: "Historic temple surrounded by snack streets and old-town energy.",
  imageUrl:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Shanghai_City_God_Temple.jpg/1280px-Shanghai_City_God_Temple.jpg",
  imageCredit: "Wikimedia Commons",
  intro: {
    en: "The City God Temple anchors a lively old-town district of snack stalls, tea houses, and souvenir lanes. Pair it with Yu Garden — they're a five-minute walk apart — and sample xiaolongbao or sweet rice cakes along the way.",
    zh: "城隍庙周边是老城厢最热闹的区域，小吃摊、茶楼与手信街交织出浓浓市井气。与豫园步行可达，顺路尝尝小笼、海棠糕等地道点心。",
  },
});

const jiajia = place("sh-jiajia", { en: "Jia Jia Soup Dumplings", zh: "佳家汤包" }, {
  kind: "meal",
  mealSlot: "lunch",
  neighborhood: "Huangpu",
  lat: 31.228,
  lng: 121.478,
  tags: ["food"],
  whyRecommended: "Cult-favorite xiaolongbao spot on many must-eat lists.",
  imageUrl:
    "https://images.unsplash.com/photo-1496116218417-1a781b1df416?w=1280&q=80",
  imageCredit: "Unsplash",
  intro: {
    en: "A long-standing local favorite for thin-skinned soup dumplings — constantly recommended on Xiaohongshu must-eat lists. Order pork or crab roe fillings, dip in ginger vinegar, and expect a short queue at peak lunch.",
    zh: "本地人常去的汤包名店，频繁出现在小红书「上海必吃」清单里。皮薄汁多，蟹粉或鲜肉馅都值得点，午市可能需要稍等位。",
  },
});

const laodifang = place("sh-laodifang", { en: "Lao Di Fang Noodles", zh: "老地方面馆" }, {
  kind: "meal",
  mealSlot: "snack",
  neighborhood: "Putuo",
  lat: 31.262,
  lng: 121.478,
  tags: ["food"],
  whyRecommended: "Michelin Bib Gourmand noodle shop — great value.",
  imageUrl:
    "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=1280&q=80",
  imageCredit: "Unsplash",
  intro: {
    en: "A 2025 Michelin Bib Gourmand pick serving honest Shanghai noodles — try the pickled vegetable with cuttlefish tossed noodles for under ¥30. No-frills counter seating and a true neighborhood feel.",
    zh: "入选米其林必比登推介的本帮面馆，咸菜目鱼拌面等项目人均不到三十元。环境朴实、出餐快，是体验街头上海味的绝佳选择。",
  },
});

const nanjinglu = place("sh-nanjinglu", { en: "Nanjing Road", zh: "南京路" }, {
  kind: "activity",
  neighborhood: "Huangpu",
  lat: 31.235,
  lng: 121.475,
  tags: ["shopping", "photography"],
  whyRecommended: "Shanghai's premier pedestrian shopping boulevard.",
  imageUrl:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Nanjing_Road_Pedestrian_Street_Shanghai.jpg/1280px-Nanjing_Road_Pedestrian_Street_Shanghai.jpg",
  imageCredit: "Wikimedia Commons",
  intro: {
    en: "East Nanjing Road's pedestrian mall stretches from the Bund toward People's Square, lined with flagship stores and neon signs. Visit after dark when the street buzzes — it's classic Shanghai in motion.",
    zh: "南京路步行街从外滩延伸至人民广场，百货旗舰店与霓虹招牌林立。夜晚灯火通明时最有氛围，是感受魔都繁华的经典路线。",
  },
});

const hongling = place("sh-hongling", { en: "Hong Ling Restaurant", zh: "宏玲餐厅" }, {
  kind: "meal",
  mealSlot: "dinner",
  neighborhood: "Huangpu",
  lat: 31.219,
  lng: 121.492,
  tags: ["food", "culture"],
  whyRecommended: "Beloved old-school Shanghainese benbang cooking.",
  imageUrl:
    "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=1280&q=80",
  imageCredit: "Unsplash",
  intro: {
    en: "A no-fuss local institution for benbang dishes — braised pork belly, sweet-and-sour spare ribs, and seasonal river shrimp. Small dining room, loyal regulars, and the kind of flavors locals grew up with.",
    zh: "深受老上海人喜爱的本帮菜小馆，红烧肉、糖醋小排、油爆虾都是招牌。店面不大、常常满座，却是体验地道家常味的靠谱之选。",
  },
});

const wukang = place("sh-wukang", { en: "Wukang Road", zh: "武康路" }, {
  kind: "activity",
  neighborhood: "Former French Concession",
  lat: 31.204,
  lng: 121.44,
  tags: ["photography", "culture"],
  whyRecommended: "Tree-lined street of historic villas and cafés.",
  imageUrl:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Wukang_Road_Shanghai.jpg/1280px-Wukang_Road_Shanghai.jpg",
  imageCredit: "Wikimedia Commons",
  intro: {
    en: "Shanghai's most photogenic lane — plane trees, art deco apartments, and the landmark Wukang Mansion at the corner. Stroll slowly, duck into coffee shops, and soak up the former French Concession charm.",
    zh: "梧桐掩映的网红马路，沿线遍布老洋房与精品咖啡馆，武康大楼更是必拍地标。适合放慢脚步，感受海派风情与法式租界遗存。",
  },
});

const lüya = place("sh-lüya", { en: "Lü Ya Restaurant", zh: "绿雅酒家" }, {
  kind: "meal",
  mealSlot: "lunch",
  neighborhood: "Huangpu",
  lat: 31.222,
  lng: 121.485,
  tags: ["food"],
  whyRecommended: "Traditional Shanghainese flavors in a classic setting.",
  imageUrl:
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1280&q=80",
  imageCredit: "Unsplash",
  intro: {
    en: "A classic Shanghainese restaurant known for refined benbang home cooking — think smoked fish, slow-braised dishes, and seasonal vegetables. A step up from street food while still feeling authentically local.",
    zh: "主打精致本帮菜的老字号酒家，熏鱼、红烧类热菜与时令蔬菜都很出彩。比街边小吃更讲究，又保留了地道上海家常味。",
  },
});

const huji = place("sh-huji", { en: "Hu Ji A-Zhong Pot Stickers", zh: "胡记阿忠特色锅贴" }, {
  kind: "meal",
  mealSlot: "snack",
  neighborhood: "Xuhui",
  lat: 31.198,
  lng: 121.44,
  tags: ["food"],
  whyRecommended: "Crispy-bottomed pot stickers locals queue for.",
  imageUrl:
    "https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=1280&q=80",
  imageCredit: "Unsplash",
  intro: {
    en: "Specialists in guotie — pan-fried dumplings with a shatteringly crisp base and juicy pork filling. Order a plate fresh off the griddle, pair with vinegar, and eat standing if there's no seat.",
    zh: "以锅贴闻名的街坊小店，底部焦脆、肉馅多汁，刚出锅时最好吃。蘸醋一口一个，没座位也可以站着解决。",
  },
});

const jingan = place("sh-jingan", { en: "Jing'an Temple", zh: "静安寺" }, {
  kind: "activity",
  neighborhood: "Jing'an",
  lat: 31.223,
  lng: 121.446,
  tags: ["culture", "photography"],
  whyRecommended: "Ancient temple glowing gold amid skyscrapers.",
  imageUrl:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Jing%27an_Temple_Shanghai.jpg/1280px-Jing%27an_Temple_Shanghai.jpg",
  imageCredit: "Wikimedia Commons",
  intro: {
    en: "A Tang-dynasty temple rebuilt in gleaming gold, framed by glass towers on West Nanjing Road. The contrast of ancient bells and modern malls captures Shanghai in one frame — visit late afternoon when light hits the roof tiles.",
    zh: "始建于唐代的古寺，金顶巍峨矗立于静安商圈高楼之间。古刹与商场同框，是魔都古今交融的缩影，傍晚光线洒在庙顶时尤其好看。",
  },
});

const huaihai = place("sh-huaihai", { en: "Huaihai Road", zh: "淮海路" }, {
  kind: "activity",
  neighborhood: "Huangpu / Xuhui",
  lat: 31.22,
  lng: 121.465,
  tags: ["shopping", "culture"],
  whyRecommended: "Elegant shopping avenue with boutiques and heritage architecture.",
  imageUrl:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Huaihai_Road_Shanghai.jpg/1280px-Huaihai_Road_Shanghai.jpg",
  imageCredit: "Wikimedia Commons",
  intro: {
    en: "Shanghai's stylish counterpart to Nanjing Road — designer boutiques, historic apartment blocks, and leafy side streets. Walk from Jing'an Temple eastward and branch into alleys for hidden bakeries and vintage shops.",
    zh: "与南京路齐名的时尚轴线，精品店、老公寓与支弄咖啡馆交织。从静安寺一路向东，拐进小路常能发现惊喜小店与复古建筑。",
  },
});

const lailai = place("sh-lailai", { en: "Lai Lai Xiaolong", zh: "莱莱小笼" }, {
  kind: "meal",
  mealSlot: "snack",
  neighborhood: "Huangpu",
  lat: 31.228,
  lng: 121.47,
  tags: ["food", "photography"],
  whyRecommended: "Colorful xiaolongbao that's endlessly photogenic.",
  imageUrl:
    "https://images.unsplash.com/photo-1552611052-33e04de081de?w=1280&q=80",
  imageCredit: "Unsplash",
  intro: {
    en: "Famous on Xiaohongshu for vivid colored soup dumplings — crab, spinach, and classic pork in rainbow hues. As photogenic as they are tasty; go off-peak to snap your shots without the crowd.",
    zh: "小红书超高人气的彩色小笼包，蟹粉、菠菜与鲜肉馅色泽诱人。好看也好吃，错峰前往更容易拍到满意的照片。",
  },
});

const sanmalu = place("sh-sanmalu", { en: "San Ma Lu Restaurant", zh: "三玛璐酒楼" }, {
  kind: "meal",
  mealSlot: "dinner",
  neighborhood: "Huangpu",
  lat: 31.218,
  lng: 121.488,
  tags: ["food"],
  whyRecommended: "Old-school Shanghainese banquet-style cooking.",
  imageUrl:
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1280&q=80",
  imageCredit: "Unsplash",
  intro: {
    en: "A traditional Shanghainese restaurant serving generous portions of classic banquet dishes — perfect for a proper sit-down dinner after a long walking day. Reserve ahead on weekends.",
    zh: "老牌本帮酒楼，菜式地道、分量实在，适合走了一天路之后好好坐下来吃一顿。周末建议提前订位。",
  },
});

const gubei = place("sh-gubei", { en: "Gubei Japanese Food Street", zh: "古北日料一条街" }, {
  kind: "meal",
  mealSlot: "lunch",
  neighborhood: "Gubei / Hongqiao",
  lat: 31.196,
  lng: 121.405,
  tags: ["food", "culture"],
  whyRecommended: "Tokyo-like concentration of Japanese restaurants on Golden Street.",
  imageUrl:
    "https://images.unsplash.com/photo-1579027989536-b7b1f875659b?w=1280&q=80",
  imageCredit: "Unsplash",
  intro: {
    en: "Shanghai's 'Little Tokyo' along Golden Street (Huangjin Chengdao) and Ronghua roads — dozens of izakayas, sushi bars, and ramen shops. Try Shokudō Zhiteng for lunch sets, Chūdai Mishizō for teishoku, or Tetote for casual izakaya vibes.",
    zh: "黄金城道与古北荣华路一带聚集大量日料店，被称为上海的「小东京」。午餐可选植藤定食、初代味藏定食，或 TETOTE 居酒屋小酌，盲点都不容易踩雷。",
  },
});

const chiikawa = place("sh-chiikawa", { en: "Chiikawa Pop-up", zh: "吉伊卡哇快闪店" }, {
  kind: "activity",
  neighborhood: "Wujiaochang",
  lat: 31.3,
  lng: 121.515,
  tags: ["shopping", "photography", "family"],
  whyRecommended: "Limited-time Chiikawa pop-up with merch and photo spots.",
  imageUrl:
    "https://images.unsplash.com/photo-1612036782181-6f0b6cd0470c?w=1280&q=80",
  imageCredit: "Unsplash",
  intro: {
    en: "The Chiikawa pop-up at Wujiaochang Hopson One (May 11 – Jun 29, 2026) — free entry, no reservation, photo walls, and exclusive merch. Also check the Nanjing East Road flagship and ZX Funland for backup character goods.",
    zh: "吉伊卡哇快闪落地五角场合生汇 L1 中庭（2026.5.11–6.29），免费入场无需预约，打卡墙与限定周边齐全。若错过展期，可去南京东路旗舰店或百联 ZX 创趣场补货。",
  },
});

const mrx = place("sh-mrx", { en: "Mr.X Escape Room", zh: "MrX密室" }, {
  kind: "activity",
  neighborhood: "Huangpu",
  lat: 31.23,
  lng: 121.474,
  tags: ["nightlife", "family"],
  whyRecommended: "Immersive escape rooms — a fun evening activity.",
  imageUrl:
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1280&q=80",
  imageCredit: "Unsplash",
  intro: {
    en: "One of Shanghai's best-known escape room brands with cinematic sets and clever puzzles. Book a evening slot in advance, gather your team, and pick a theme that matches your group's scare tolerance.",
    zh: "上海知名的沉浸式密室品牌，场景制作精良、谜题设计用心。建议提前预订晚间场次，选一款适合全队胆量的主题一起闯关。",
  },
});

const days: DayPlan[] = [
  day(0, "童话一日 · Fairy-tale Day", ["Pudong"], [
    block("d1-b1", "Full day", disneyland),
  ]),
  day(1, "自然与天际 · Nature & Skyline", ["Pudong Nanhui", "Pudong"], [
    block("d2-b1", "Morning – Afternoon", safari),
    block("d2-b2", "Evening", lujiazui),
  ]),
  day(2, "老城味道 · Old Shanghai Flavors", ["Old City", "Huangpu"], [
    block("d3-b1", "Morning", yuyuan),
    block("d3-b2", "Morning", chenghuang),
    block("d3-b3", "Lunch", jiajia),
    block("d3-b4", "Snack", laodifang),
    block("d3-b5", "Afternoon", nanjinglu),
    block("d3-b6", "Dinner", hongling),
  ]),
  day(3, "梧桐区漫步 · French Concession Stroll", ["Xuhui", "Jing'an", "Huangpu"], [
    block("d4-b1", "Morning", wukang),
    block("d4-b2", "Lunch", lüya),
    block("d4-b3", "Snack", huji),
    block("d4-b4", "Afternoon", jingan),
    block("d4-b5", "Afternoon", huaihai),
    block("d4-b6", "Snack", lailai),
    block("d4-b7", "Dinner", sanmalu),
  ]),
  day(4, "古北萌力 · Gubei, Chiikawa & Games", ["Gubei", "Wujiaochang", "Huangpu"], [
    block("d5-b1", "Lunch", gubei),
    block("d5-b2", "Afternoon", chiikawa),
    block("d5-b3", "Evening", mrx),
  ]),
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
