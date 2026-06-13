import { getRuntimePlaceDetails } from "@/lib/demo/runtime-place-details";

export interface PlaceDetailRecord {
  address: { en: string; zh: string };
  phone?: string;
  website?: string;
  hoursSummary?: { en: string; zh: string };
  weeklyHours?: { label: { en: string; zh: string }; time: { en: string; zh: string } }[];
  features?: { en: string[]; zh: string[] };
  relatedInfo?: { en: string; zh: string };
  gettingThere?: { en: string; zh: string };
}

export const SHANGHAI_PLACE_DETAILS: Record<string, PlaceDetailRecord> = {
  "sh-disney": {
    address: {
      en: "310 Huangzhao Road, Chuansha New Town, Pudong, Shanghai",
      zh: "上海市浦东新区川沙新镇黄赵路310号",
    },
    phone: "400-180-0000",
    website: "https://www.shanghaidisneyresort.com",
    hoursSummary: {
      en: "Typically 8:30 AM – 9:30 PM (check official calendar before visiting)",
      zh: "通常 8:30–21:30（出行前请查询官方日历）",
    },
    weeklyHours: [
      { label: { en: "Daily", zh: "每天" }, time: { en: "8:30 AM – 9:30 PM*", zh: "8:30–21:30*" } },
    ],
    features: {
      en: ["Theme park", "Family-friendly", "Parades & fireworks"],
      zh: ["主题乐园", "亲子", "巡游与烟火"],
    },
    relatedInfo: {
      en: "Allow a full day. Arrive before opening for TRON and Zootopia. Download the official app for live wait times.",
      zh: "建议预留一整天。开园前到达可错峰热门项目。下载官方 App 查看排队时间。",
    },
    gettingThere: {
      en: "Metro Line 11 to Disney Resort Station, then walk 5–10 min.",
      zh: "地铁11号线迪士尼站，步行5–10分钟。",
    },
  },
  "sh-safari": {
    address: {
      en: "178 Nanliu Highway, Pudong New Area, Shanghai",
      zh: "上海市浦东新区南六公路178号",
    },
    phone: "021-58036000",
    hoursSummary: { en: "Typically 9:00 AM – 5:00 PM", zh: "通常 9:00–17:00" },
    weeklyHours: [
      { label: { en: "Daily", zh: "每天" }, time: { en: "9:00 AM – 5:00 PM", zh: "9:00–17:00" } },
    ],
    features: {
      en: ["Wildlife park", "Drive-through safari bus", "Family"],
      zh: ["野生动物园", "乘车入猛兽区", "亲子"],
    },
    relatedInfo: {
      en: "Far from downtown — plan half a day. Bus tours through predator zones are a highlight.",
      zh: "距市区较远，建议预留半天。乘车穿越猛兽区是亮点体验。",
    },
    gettingThere: {
      en: "Metro Line 16 to Wild Animal Park Station, or taxi from Pudong.",
      zh: "地铁16号线野生动物园站，或从浦东打车前往。",
    },
  },
  "sh-lujiazui": {
    address: {
      en: "Lujiazui, Pudong New Area (Oriental Pearl · Jin Mao · Shanghai Tower)",
      zh: "上海市浦东新区陆家嘴（东方明珠·金茂·上海中心）",
    },
    hoursSummary: { en: "Outdoor viewing: anytime; tower tickets vary", zh: "户外观景：全天；登塔时间以各景点为准" },
    features: {
      en: ["Skyline", "Photography", "Riverside walk"],
      zh: ["天际线", "摄影", "滨江步道"],
    },
    relatedInfo: {
      en: "Best at dusk when lights turn on. Riverside promenade is free; tower observation decks require tickets.",
      zh: "傍晚华灯初上时最美。滨江步道免费，登塔观景需购票。",
    },
    gettingThere: {
      en: "Metro Line 2 to Lujiazui Station.",
      zh: "地铁2号线陆家嘴站。",
    },
  },
  "sh-yuyuan": {
    address: {
      en: "168 Fuyou Road, Huangpu District, Shanghai",
      zh: "上海市黄浦区福佑路168号",
    },
    phone: "021-63282465",
    hoursSummary: { en: "Garden: ~8:30 AM – 5:00 PM", zh: "园林：约 8:30–17:00" },
    weeklyHours: [
      { label: { en: "Daily", zh: "每天" }, time: { en: "8:30 AM – 5:00 PM", zh: "8:30–17:00" } },
    ],
    features: {
      en: ["Classical garden", "Ming dynasty", "Culture"],
      zh: ["江南古典园林", "明代遗存", "文化古迹"],
    },
    relatedInfo: {
      en: "Near City God Temple bazaar. Go early to avoid tour groups.",
      zh: "毗邻城隍庙商圈，建议早上开园即入避开旅行团。",
    },
    gettingThere: {
      en: "Metro Line 10 to Yuyuan Garden Station.",
      zh: "地铁10号线豫园站。",
    },
  },
  "sh-chenghuang": {
    address: {
      en: "249 Fangbang Middle Road, Huangpu District, Shanghai",
      zh: "上海市黄浦区方浜中路249号",
    },
    hoursSummary: { en: "Temple ~8:30 AM – 4:30 PM; bazaar longer", zh: "庙宇约 8:30–16:30；商圈更晚" },
    weeklyHours: [
      { label: { en: "Temple", zh: "城隍庙" }, time: { en: "8:30 AM – 4:30 PM", zh: "8:30–16:30" } },
      { label: { en: "Bazaar area", zh: "商圈" }, time: { en: "Until ~9:00 PM", zh: "至约 21:00" } },
    ],
    features: {
      en: ["Historic temple", "Street food", "Souvenirs"],
      zh: ["古庙", "小吃", "手信"],
    },
    relatedInfo: {
      en: "Five-minute walk from Yu Garden. Famous for xiaolongbao and local snacks.",
      zh: "距豫园步行五分钟，小笼与地道点心闻名。",
    },
    gettingThere: {
      en: "Metro Line 10 to Yuyuan Garden Station.",
      zh: "地铁10号线豫园站。",
    },
  },
  "sh-jiajia": {
    address: {
      en: "90 Huanghe Road, Huangpu District, Shanghai",
      zh: "上海市黄浦区黄河路90号",
    },
    phone: "021-63276878",
    hoursSummary: { en: "Open until ~8:00 PM", zh: "营业至约 20:00" },
    weeklyHours: [
      { label: { en: "Daily", zh: "每天" }, time: { en: "10:00 AM – 8:00 PM", zh: "10:00–20:00" } },
    ],
    features: {
      en: ["Soup dumplings", "Lunch", "Local favorite"],
      zh: ["汤包", "午餐", "本地名店"],
    },
    relatedInfo: {
      en: "Near People's Square on the walk toward Nanjing Road. Expect a short queue at lunch.",
      zh: "人民广场附近，走向南京路途中可顺路品尝。午市可能需排队。",
    },
    gettingThere: {
      en: "Metro Lines 1/2/8 to People's Square Station.",
      zh: "地铁1/2/8号线人民广场站。",
    },
  },
  "sh-nanjinglu": {
    address: {
      en: "East Nanjing Road Pedestrian Street, Huangpu District, Shanghai",
      zh: "上海市黄浦区南京东路步行街",
    },
    hoursSummary: { en: "Shops ~10:00 AM – 10:00 PM; street open longer", zh: "商铺约 10:00–22:00；步行街全天" },
    features: {
      en: ["Shopping", "Pedestrian street", "Night views"],
      zh: ["购物", "步行街", "夜景"],
    },
    relatedInfo: {
      en: "Stretches from the Bund toward People's Square. Most atmospheric after dark.",
      zh: "从外滩延伸至人民广场，夜晚霓虹灯火最有氛围。",
    },
    gettingThere: {
      en: "Metro Lines 1/2/8 to People's Square or Line 2/10 to East Nanjing Road.",
      zh: "地铁人民广场站或南京东路站。",
    },
  },
  "sh-lailai": {
    address: {
      en: "127 Tianjin Road, Huangpu District, Shanghai",
      zh: "上海市黄浦区天津路127号",
    },
    hoursSummary: { en: "Typically 7:00 AM – 8:00 PM", zh: "通常 7:00–20:00" },
    weeklyHours: [
      { label: { en: "Daily", zh: "每天" }, time: { en: "7:00 AM – 8:00 PM", zh: "7:00–20:00" } },
    ],
    features: {
      en: ["Colored xiaolongbao", "Snack", "Photogenic"],
      zh: ["彩色小笼", "小吃", "适合拍照"],
    },
    relatedInfo: {
      en: "Popular on Xiaohongshu for vivid dumpling colors. Go off-peak for photos.",
      zh: "小红书人气彩色小笼包，错峰前往更容易拍照。",
    },
    gettingThere: {
      en: "Near People's Square / Nanjing Road area.",
      zh: "人民广场/南京路商圈附近。",
    },
  },
  "sh-hongling": {
    address: {
      en: "29 Sichuan South Road, Huangpu District, Shanghai",
      zh: "中国上海市黄浦区四川南路29号",
    },
    phone: "+86 21 6330 3509",
    hoursSummary: { en: "Open until 9:30 PM", zh: "营业至 下午9:30" },
    weeklyHours: [
      { label: { en: "Sun – Sat", zh: "周日 – 周六" }, time: { en: "11:00 AM – 2:00 PM, 5:00 – 9:30 PM", zh: "11:00–14:00，17:00–21:30" } },
    ],
    features: {
      en: ["Lunch", "Dinner", "Shanghainese (benbang)"],
      zh: ["午餐", "晚餐", "本帮菜"],
    },
    relatedInfo: {
      en: "Near Jinling East Road in the old city. Beloved local benbang spot — braised pork, sweet-and-sour ribs.",
      zh: "近金陵东路老城厢，红烧肉、糖醋小排等本帮菜口碑很好。",
    },
    gettingThere: {
      en: "Metro Line 10 to Yuyuan Garden, walk south.",
      zh: "地铁10号线豫园站，向南步行。",
    },
  },
  "sh-wukang": {
    address: {
      en: "Wukang Road, Xuhui District, Shanghai",
      zh: "上海市徐汇区武康路",
    },
    hoursSummary: { en: "Public street — always open", zh: "公共道路 — 全天开放" },
    features: {
      en: ["Historic villas", "Cafés", "Photography"],
      zh: ["老洋房", "咖啡馆", "摄影"],
    },
    relatedInfo: {
      en: "Home to the landmark Wukang Mansion. Best enjoyed as a slow morning stroll.",
      zh: "武康大楼地标所在地，适合早上慢慢散步拍照。",
    },
    gettingThere: {
      en: "Metro Lines 10/11 to Jiaotong University Station.",
      zh: "地铁10/11号线交通大学站。",
    },
  },
  "sh-huji": {
    address: {
      en: "136 Yongjia Road, Xuhui District, Shanghai",
      zh: "上海市徐汇区永嘉路136号",
    },
    hoursSummary: { en: "Typically 6:00 AM – 7:00 PM", zh: "通常 6:00–19:00" },
    weeklyHours: [
      { label: { en: "Daily", zh: "每天" }, time: { en: "6:00 AM – 7:00 PM", zh: "6:00–19:00" } },
    ],
    features: {
      en: ["Pot stickers (guotie)", "Snack", "Street food"],
      zh: ["锅贴", "小吃", "街头美食"],
    },
    relatedInfo: {
      en: "Specialists in crispy-bottom pan-fried dumplings. Eat fresh off the griddle.",
      zh: "以底部焦脆的锅贴闻名，刚出锅时最好吃。",
    },
    gettingThere: {
      en: "Near Wukang Road / French Concession.",
      zh: "武康路/法租界一带。",
    },
  },
  "sh-jingan": {
    address: {
      en: "1686 West Nanjing Road, Jing'an District, Shanghai",
      zh: "上海市静安区南京西路1686号",
    },
    phone: "021-62566366",
    hoursSummary: { en: "Temple ~7:30 AM – 5:00 PM", zh: "寺庙约 7:30–17:00" },
    weeklyHours: [
      { label: { en: "Daily", zh: "每天" }, time: { en: "7:30 AM – 5:00 PM", zh: "7:30–17:00" } },
    ],
    features: {
      en: ["Buddhist temple", "Architecture", "Culture"],
      zh: ["佛教寺庙", "建筑", "文化"],
    },
    relatedInfo: {
      en: "Golden temple amid glass towers on West Nanjing Road. Ticket required for entry.",
      zh: "南京西路金顶古寺，与摩天楼同框，入园需购票。",
    },
    gettingThere: {
      en: "Metro Lines 2/7 to Jing'an Temple Station.",
      zh: "地铁2/7号线静安寺站。",
    },
  },
  "sh-huaihai": {
    address: {
      en: "Middle Huaihai Road, Huangpu / Xuhui, Shanghai",
      zh: "上海市黄浦区/徐汇区淮海中路",
    },
    hoursSummary: { en: "Shops ~10:00 AM – 10:00 PM", zh: "商铺约 10:00–22:00" },
    features: {
      en: ["Shopping", "Boutiques", "Dining"],
      zh: ["购物", "精品店", "餐饮"],
    },
    relatedInfo: {
      en: "Shanghai's stylish shopping axis. Walk east from Jing'an Temple.",
      zh: "上海时尚购物主轴，可从静安寺向东漫步。",
    },
    gettingThere: {
      en: "Metro Lines 1/10/12 to South Huangpi Road or Line 13 to Middle Huaihai Road.",
      zh: "地铁黄陂南路站或淮海中路站。",
    },
  },
  "sh-lüya": {
    address: {
      en: "Huaihai Road area, Huangpu District, Shanghai",
      zh: "上海市黄浦区淮海路商圈",
    },
    hoursSummary: { en: "Lunch & dinner service", zh: "午市及晚市" },
    weeklyHours: [
      { label: { en: "Daily", zh: "每天" }, time: { en: "11:00 AM – 2:00 PM, 5:00 – 9:00 PM", zh: "11:00–14:00，17:00–21:00" } },
    ],
    features: {
      en: ["Dinner", "Shanghainese", "Refined benbang"],
      zh: ["晚餐", "本帮菜", "精致上海菜"],
    },
    relatedInfo: {
      en: "Classic benbang restaurant near Huaihai Road — smoked fish and slow-braised dishes.",
      zh: "淮海路附近的本帮菜酒家，熏鱼与红烧类热菜出彩。",
    },
    gettingThere: {
      en: "Metro to Huaihai Road area.",
      zh: "地铁淮海中路沿线。",
    },
  },
  "sh-sanmalu": {
    address: {
      en: "Huangpu District (old city), Shanghai",
      zh: "上海市黄浦区老城厢",
    },
    hoursSummary: { en: "Lunch & dinner", zh: "午市及晚市" },
    weeklyHours: [
      { label: { en: "Daily", zh: "每天" }, time: { en: "11:00 AM – 2:00 PM, 5:00 – 9:30 PM", zh: "11:00–14:00，17:00–21:30" } },
    ],
    features: {
      en: ["Dinner", "Shanghainese banquet", "Old-school"],
      zh: ["晚餐", "本帮酒楼", "老字号"],
    },
    relatedInfo: {
      en: "Traditional benbang restaurant with generous portions. Reserve on weekends.",
      zh: "老牌本帮酒楼，菜式地道。周末建议提前订位。",
    },
    gettingThere: {
      en: "Metro Line 8/10 to Laoximen or Yuyuan Garden area.",
      zh: "地铁老西门站或豫园站附近。",
    },
  },
  "sh-laodifang": {
    address: {
      en: "Putuo District, Shanghai (check latest branch address)",
      zh: "上海市普陀区（请以最新门店地址为准）",
    },
    hoursSummary: { en: "Typically 7:00 AM – 8:00 PM", zh: "通常 7:00–20:00" },
    weeklyHours: [
      { label: { en: "Daily", zh: "每天" }, time: { en: "7:00 AM – 8:00 PM", zh: "7:00–20:00" } },
    ],
    features: {
      en: ["Noodles", "Snack", "Michelin Bib Gourmand"],
      zh: ["面食", "小吃", "米其林必比登"],
    },
    relatedInfo: {
      en: "Famous for pickled vegetable & cuttlefish tossed noodles (~¥28). Great value local pick.",
      zh: "咸菜目鱼拌面是招牌，人均不到三十元，性价比极高。",
    },
    gettingThere: {
      en: "Metro to Putuo district, then taxi or walk to branch.",
      zh: "地铁至普陀区后步行或短途打车。",
    },
  },
  "sh-gubei": {
    address: {
      en: "Huangjin Chengdao (Golden Street), Gubei, Changning District",
      zh: "上海市长宁区古北黄金城道",
    },
    hoursSummary: { en: "Restaurants: lunch & dinner hours vary", zh: "各店午市/晚市时间不同" },
    features: {
      en: ["Japanese cuisine", "Izakaya", "Lunch sets"],
      zh: ["日料", "居酒屋", "定食"],
    },
    relatedInfo: {
      en: "Shanghai's 'Little Tokyo' — try Shokudō Zhiteng, Chūdai Mishizō, or Tetote izakaya.",
      zh: "上海「小东京」——推荐植藤、初代味藏、TETOTE 等。",
    },
    gettingThere: {
      en: "Metro Line 10 to Hongqiao Road or Line 15 to Gubei area.",
      zh: "地铁10号线虹桥路站或15号线古北路站。",
    },
  },
  "sh-chiikawa": {
    address: {
      en: "Hopson One, L1 Atrium, Wujiaochang, Yangpu District, Shanghai",
      zh: "上海市杨浦区五角场合生汇 L1 中庭",
    },
    hoursSummary: {
      en: "Pop-up: May 11 – Jun 29, 2026 · mall hours apply",
      zh: "快闪：2026.5.11–6.29 · 跟随商场营业时间",
    },
    weeklyHours: [
      { label: { en: "Pop-up period", zh: "展期" }, time: { en: "May 11 – Jun 29, 2026", zh: "2026年5月11日 – 6月29日" } },
      { label: { en: "Mall hours", zh: "商场" }, time: { en: "10:00 AM – 10:00 PM", zh: "10:00–22:00" } },
    ],
    features: {
      en: ["Pop-up shop", "Merchandise", "Photo spots"],
      zh: ["快闪店", "限定周边", "打卡拍照"],
    },
    relatedInfo: {
      en: "Free entry, no reservation. Backup: Nanjing East Road flagship or ZX Funland.",
      zh: "免费入场无需预约。备选：南京东路旗舰店或百联 ZX 创趣场。",
    },
    gettingThere: {
      en: "Metro Line 10 to Wujiaochang Station.",
      zh: "地铁10号线五角场站。",
    },
  },
  "sh-mrx": {
    address: {
      en: "Multiple branches — People's Square area popular",
      zh: "多家分店 — 人民广场商圈较热门",
    },
    phone: "400-618-3358",
    website: "https://www.mrx.cn",
    hoursSummary: { en: "Typically 10:00 AM – midnight", zh: "通常 10:00–24:00" },
    weeklyHours: [
      { label: { en: "Daily", zh: "每天" }, time: { en: "10:00 AM – 12:00 AM", zh: "10:00–24:00" } },
    ],
    features: {
      en: ["Escape room", "Evening activity", "Group fun"],
      zh: ["密室逃脱", "晚间活动", "团建"],
    },
    relatedInfo: {
      en: "Book evening slots in advance. Choose a theme matching your group's scare tolerance.",
      zh: "建议提前预订晚间场次，按全队胆量选择主题。",
    },
    gettingThere: {
      en: "Metro Lines 1/2/8 to People's Square.",
      zh: "地铁1/2/8号线人民广场站。",
    },
  },
};

export function getPlaceDetails(placeId: string): PlaceDetailRecord | undefined {
  return getRuntimePlaceDetails(placeId) ?? SHANGHAI_PLACE_DETAILS[placeId];
}
