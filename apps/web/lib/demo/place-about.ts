/** Extended descriptions researched from travel guides, maps & community posts */

import { getTripStoredPlaceAbout } from "@/lib/trip-place-store";

export const PLACE_ABOUT: Record<string, { en: string; zh: string }> = {
  "sh-disney": {
    en: "Shanghai Disney Resort opened in 2016 as mainland China's first Disney park. Highlights include the TRON Lightcycle Power Run coaster, Zootopia-themed land, Pirates of the Caribbean: Battle for the Sunken Treasure, and evening castle projections. Download the official app for wait times, mobile order food, and Genie+ options.",
    zh: "上海迪士尼度假区于2016年开园，是中国大陆首座迪士尼乐园。热门项目包括创极速光轮、疯狂动物城主题区、加勒比海盗沉落宝藏之战及晚间城堡光影秀。建议下载官方 App 查看排队、手机点餐与尊享卡信息。",
  },
  "sh-safari": {
    en: "Shanghai Wild Animal Park in Nanhui features walk-through zones and bus safaris through predator enclosures with lions, tigers, and bears. Feeding shows and a petting zoo make it popular with families. Allow 4–5 hours; weekdays are far less crowded than weekends.",
    zh: "上海野生动物园位于南汇，设有步行区与乘车穿越猛兽区的巴士游览，可近距离观看狮虎熊等动物。还有投喂表演与亲子互动区，建议预留4–5小时，工作日人流明显少于周末。",
  },
  "sh-lujiazui": {
    en: "Lujiazui Financial District forms Shanghai's postcard skyline — Shanghai Tower (632 m), Jin Mao Tower, and Oriental Pearl TV Tower. Riverside walkways on the Bund offer the classic cross-river view. Observation decks in each tower open until late evening.",
    zh: "陆家嘴金融区构成上海经典天际线——上海中心（632米）、金茂大厦与东方明珠。对岸外滩滨江步道是拍摄「三件套」的最佳机位，各塔观景台晚间亦开放。",
  },
  "sh-yuyuan": {
    en: "Yu Garden dates to the Ming dynasty (1559) with zigzag bridges, koi ponds, and the famous Exquisite Jade Rock. The surrounding Yuyuan Bazaar sells snacks and souvenirs — visit before 10 AM on weekends to avoid peak crowds.",
    zh: "豫园始建于明代嘉靖年间，以九曲桥、锦鲤池与玉玲珑著称。外围豫园商城小吃与伴手礼林立，周末建议10点前入园以避开人流高峰。",
  },
  "sh-chenghuang": {
    en: "Shanghai City God Temple (Chenghuang Miao) has been a Taoist center since 1403. The surrounding lanes are famous for xiaolongbao, fried stinky tofu, and sweet rice cakes — one of the best places to sample old-Shanghai street food.",
    zh: "上海城隍庙始建于明永乐年间，是老城厢的道教中心。周边街巷以小笼包、臭豆腐、海棠糕等小吃闻名，是体验老上海味道的必到之地。",
  },
  "sh-jiajia": {
    en: "Jia Jia Tang Bao on Huanghe Road is a longtime local favorite for soup dumplings — thin skin, rich broth, and pork or crab-roe fillings. Expect a short queue at lunch; order at the counter and share tables.",
    zh: "黄河路上的佳家汤包是本地人常去的汤包名店，皮薄汤鲜，鲜肉与蟹粉馅都很出彩。午餐时段常需排队，柜台点单、拼桌用餐是常态。",
  },
  "sh-nanjinglu": {
    en: "East Nanjing Road is Asia's longest pedestrian shopping street, stretching from People's Square toward the Bund. Flagship stores, neon signage, and the vintage Dangdang tram make it especially photogenic after sunset.",
    zh: "南京东路是中国最长的步行街，从人民广场一路延伸至外滩方向。旗舰店林立、霓虹闪烁，复古铛铛车穿梭其间，入夜后尤其适合拍照打卡。",
  },
  "sh-lailai": {
    en: "Lai Lai Xiaolong near People's Square went viral on Xiaohongshu for rainbow-colored soup dumplings — crab, pork, and vegetable fillings in vivid hues. A fun, quick stop between shopping and sightseeing.",
    zh: "人民广场附近的莱莱小笼因小红书爆红的彩色小笼包而出名，蟹粉、鲜肉与蔬菜馅色泽缤纷。逛街途中顺路品尝，是轻松有趣的打卡点。",
  },
  "sh-hongling": {
    en: "Hong Ling Restaurant on Sichuan South Road is a beloved benbang (Shanghainese) institution near Jinling East Road. Locals come for hongshao rou (braised pork belly), sweet-and-sour spare ribs, and seasonal river shrimp. Cash and mobile pay accepted; reservations recommended on weekends.",
    zh: "四川南路上的宏玲餐厅是近金陵东路的老牌本帮菜馆，红烧肉、糖醋小排与时令河虾是招牌。支持移动支付，周末建议提前预约。",
  },
  "sh-wukang": {
    en: "Wukang Road in the former French Concession is lined with plane trees and 1920s art-deco villas. The wedge-shaped Wukang Mansion (Normandie Apartments) is Shanghai's most photographed building — best viewed from the junction with Hunan Road.",
    zh: "武康路位于原法租界，梧桐掩映、老洋房林立。武康大楼（诺曼底公寓）是上海最具代表性的地标建筑之一，武康路与湖南路交汇处是经典拍照机位。",
  },
  "sh-huji": {
    en: "Hu Ji A-Zhong Guotie is a neighborhood institution for pan-fried dumplings with a shatteringly crisp bottom and juicy pork filling. Grab a plate fresh off the griddle — lines move quickly at lunch.",
    zh: "胡记阿忠锅贴是街坊熟知的锅贴名店，底部焦脆、肉馅多汁。建议现点现吃，午餐排队虽长但翻台较快。",
  },
  "sh-jingan": {
    en: "Jing'an Temple's origins trace to 247 AD; the current golden hall was rebuilt in 2010. The contrast between ancient Buddhism and surrounding glass towers embodies modern Shanghai. A small admission fee applies to enter the temple grounds.",
    zh: "静安寺历史可追溯至三国时期，现大雄宝殿金顶为2010年重修。古寺与摩天楼同框，是海派文化的缩影。进入寺院需购买门票。",
  },
  "sh-huaihai": {
    en: "Middle Huaihai Road is Shanghai's elegant shopping spine — luxury boutiques, historic lane houses, and leafy cafés between Xintiandi and Jing'an. K11 art mall and iapm are popular stops along the way.",
    zh: "淮海中路是上海最具气质的购物大道，精品店、里弄老公寓与咖啡馆交织，连接新天地与静安。沿途 K11、iapm 等商场也值得一逛。",
  },
  "sh-lüya": {
    en: "Lü Ya Restaurant on Fuxing Road serves refined benbang home cooking — smoked fish, slow-braised pork, and seasonal vegetables in a classic dining room setting. A relaxed dinner before heading south to the old city.",
    zh: "复兴路上的绿雅酒家主打精致本帮家常菜，熏鱼、红烧类热菜与时令蔬菜都很地道。环境雅致，适合淮海路逛街后的悠闲晚餐。",
  },
  "sh-sanmalu": {
    en: "San Ma Lu Restaurant is a traditional benbang banquet hall in the old city, known for generous portions of sweet-and-sour dishes, eel, and crab. Popular with local families celebrating special occasions.",
    zh: "三玛璐酒楼是老城厢的传统本帮宴席餐厅，糖醋类、鳝糊与蟹宴分量实在，深受本地家庭聚餐青睐。",
  },
  "sh-laodifang": {
    en: "Lao Di Fang Noodles in Putuo earned a 2025 Michelin Bib Gourmand for honest Shanghai noodles under ¥30. The pickled vegetable with cuttlefish noodles are the signature — arrive before noon to beat the lunch rush.",
    zh: "普陀老地方面馆获评2025米其林必比登推介，咸菜目鱼拌面是招牌，人均不到三十元。建议中午前到达以避开用餐高峰。",
  },
  "sh-gubei": {
    en: "Gubei's Golden Street (Huangjin Chengdao) is Shanghai's Little Tokyo — dozens of Japanese restaurants, izakayas, and grocery stores within walking distance. Shokudō Zhiteng, Chūdai Mishizō, and Tetote are community favorites on Xiaohongshu.",
    zh: "古北黄金城道被誉为上海「小东京」，步行范围内聚集大量日料店、居酒屋与日超。植藤、初代味藏、TETOTE 等在小红书口碑很好。",
  },
  "sh-chiikawa": {
    en: "The Chiikawa pop-up at Wujiaochang Hopson One (May 11 – Jun 29, 2026) features photo walls, limited merch, and free entry. Extremely popular on social media — go on weekday mornings for shorter queues.",
    zh: "吉伊卡哇快闪位于五角场合生汇（2026.5.11–6.29），免费入场，限定周边与拍照墙齐全。小红书超高人气，建议工作日上午错峰前往。",
  },
  "sh-mrx": {
    en: "Mr.X Escape Room near People's Square offers cinematic themed rooms with elaborate sets and multi-chapter storylines. Book evening slots in advance; difficulty ranges from beginner-friendly to expert.",
    zh: "人民广场附近的 MrX 密室以电影级场景与多章节剧情著称，需提前预订晚间场次。难度从新手到硬核均有选择。",
  },
};

export function getPlaceAbout(placeId: string) {
  return getTripStoredPlaceAbout(placeId) ?? PLACE_ABOUT[placeId];
}
