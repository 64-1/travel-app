/**
 * Extra photos per stop — Wikimedia Commons, Unsplash, and local uploads.
 * Primary card image is always prepended from the Place record.
 */

const wiki = (path: string, width = 1280) => {
  const file = path.split("/").pop()!;
  return `https://upload.wikimedia.org/wikipedia/commons/thumb/${path}/${width}px-${file}`;
};

const unsplash = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1400&q=80`;

export interface GalleryPhoto {
  url: string;
  credit: string;
  caption?: { en: string; zh: string };
}

const G: Record<string, GalleryPhoto[]> = {
  "sh-disney": [
    {
      url: wiki("2/2e/Enchanted_Storybook_Castle_of_Shanghai_Disneyland.jpg"),
      credit: "Wikimedia Commons / Fayhoo",
      caption: { en: "Enchanted Storybook Castle", zh: "奇幻童话城堡" },
    },
    {
      url: wiki("4/4a/Shanghai_Disneyland_Castle_Night.jpg"),
      credit: "Wikimedia Commons",
      caption: { en: "Castle at night", zh: "夜晚城堡灯光" },
    },
    {
      url: wiki("a/a1/Shanghai_disneyland_castle.jpg"),
      credit: "Wikimedia Commons",
      caption: { en: "Main entrance area", zh: "乐园入口区域" },
    },
    {
      url: wiki("8/8c/Shanghai_Disneyland_Enchanted_Storybook_Castle.jpg"),
      credit: "Wikimedia Commons",
      caption: { en: "Castle gardens", zh: "城堡花园" },
    },
  ],
  "sh-safari": [
    {
      url: wiki("4/4e/Shanghai_Wild_Animal_Park.jpg"),
      credit: "Wikimedia Commons",
      caption: { en: "Park entrance", zh: "野生动物园入口" },
    },
    {
      url: unsplash("1549366021-9f761d450615"),
      credit: "Unsplash",
      caption: { en: "Safari wildlife", zh: "野生动物" },
    },
    {
      url: unsplash("1564349683132-77e795bda8cc"),
      credit: "Unsplash",
      caption: { en: "Giraffes on the grounds", zh: "园区长颈鹿" },
    },
  ],
  "sh-lujiazui": [
    {
      url: wiki("d/df/Pudong_Shanghai_November_2017_panorama.jpg/1920px-Pudong_Shanghai_November_2017_panorama.jpg"),
      credit: "Wikimedia Commons / King of Hearts",
      caption: { en: "Pudong skyline panorama", zh: "浦东天际线全景" },
    },
    {
      url: wiki("6/6d/Shanghai_Skyline_Panoramic.JPG/1280px-Shanghai_Skyline_Panoramic.JPG"),
      credit: "Wikimedia Commons",
      caption: { en: "Lujiazui at dusk", zh: "陆家嘴暮色" },
    },
    {
      url: wiki("e/ec/Oriental_Pearl_Tower_in_Shanghai.jpg/1280px-Oriental_Pearl_Tower_in_Shanghai.jpg"),
      credit: "Wikimedia Commons",
      caption: { en: "Oriental Pearl Tower", zh: "东方明珠" },
    },
    {
      url: wiki("0/0c/Shanghai_Tower_632m.jpg/1280px-Shanghai_Tower_632m.jpg"),
      credit: "Wikimedia Commons",
      caption: { en: "Shanghai Tower", zh: "上海中心大厦" },
    },
  ],
  "sh-yuyuan": [
    {
      url: wiki("4/4e/Yu_Garden_Shanghai_-_panoramio.jpg/1280px-Yu_Garden_Shanghai_-_panoramio.jpg"),
      credit: "Wikimedia Commons",
      caption: { en: "Classical garden pavilion", zh: "古典园林亭台" },
    },
    {
      url: wiki("8/8d/YuYuan_Garden_Shanghai.jpg/1280px-YuYuan_Garden_Shanghai.jpg"),
      credit: "Wikimedia Commons",
      caption: { en: "Dragon wall", zh: "九龙墙" },
    },
    {
      url: wiki("1/1e/Yu_Garden_2015.JPG/1280px-Yu_Garden_2015.JPG"),
      credit: "Wikimedia Commons",
      caption: { en: "Pond and rockery", zh: "池塘假山" },
    },
  ],
  "sh-chenghuang": [
    {
      url: wiki(
        "3/37/%E5%9F%8E%E9%9A%8D%E5%BA%99%C2%B7%E4%B8%8A%E6%B5%B7%E5%8D%97%E5%B8%82.jpg/1280px-%E5%9F%8E%E9%9A%8D%E5%BA%99%C2%B7%E4%B8%8A%E6%B5%B7%E5%8D%97%E5%B8%82.jpg"
      ),
      credit: "Wikimedia Commons",
      caption: { en: "City God Temple gate", zh: "城隍庙山门" },
    },
    {
      url: wiki("5/5a/Chenghuangmiao_Shanghai.jpg/1280px-Chenghuangmiao_Shanghai.jpg"),
      credit: "Wikimedia Commons",
      caption: { en: "Temple courtyard", zh: "庙内庭院" },
    },
    {
      url: unsplash("1555939594-58d7cb561ad1"),
      credit: "Unsplash",
      caption: { en: "Old city snacks", zh: "老城小吃" },
    },
  ],
  "sh-jiajia": [
    {
      url: unsplash("1559847844-5315695dadae"),
      credit: "Unsplash",
      caption: { en: "Soup dumplings", zh: "汤包" },
    },
    {
      url: unsplash("1496116218417-1a781b1f4169"),
      credit: "Unsplash",
      caption: { en: "Steamed buns", zh: "小笼蒸点" },
    },
    {
      url: unsplash("1563245372-f21724e3856d"),
      credit: "Unsplash",
      caption: { en: "Shanghai breakfast", zh: "上海早点" },
    },
  ],
  "sh-nanjinglu": [
    {
      url: wiki(
        "9/9f/East_Nanjing_Road_2020_%2850361842166%29.jpg/1280px-East_Nanjing_Road_2020_%2850361842166%29.jpg"
      ),
      credit: "Wikimedia Commons / N509FZ",
      caption: { en: "Pedestrian mall", zh: "步行街" },
    },
    {
      url: wiki("f/f4/Nanjing_Road_East_Shanghai.jpg/1280px-Nanjing_Road_East_Shanghai.jpg"),
      credit: "Wikimedia Commons",
      caption: { en: "Neon signs at night", zh: "夜晚霓虹" },
    },
    {
      url: wiki("a/a8/Nanjing_Road_%28Shanghai%29.jpg/1280px-Nanjing_Road_%28Shanghai%29.jpg"),
      credit: "Wikimedia Commons",
      caption: { en: "Shopping street", zh: "购物大街" },
    },
  ],
  "sh-lailai": [
    {
      url: unsplash("1496116218417-1a781b1f4169"),
      credit: "Unsplash",
      caption: { en: "Colorful xiaolongbao", zh: "彩色小笼包" },
    },
    {
      url: unsplash("1559847844-5315695dadae"),
      credit: "Unsplash",
      caption: { en: "Steamer baskets", zh: "蒸笼点心" },
    },
    {
      url: unsplash("1569718212165-3a8278d5f624"),
      credit: "Unsplash",
      caption: { en: "Shanghai noodles", zh: "本帮面食" },
    },
  ],
  "sh-hongling": [
    {
      url: unsplash("1555396273-367ea4eb4db5"),
      credit: "Unsplash",
      caption: { en: "Shanghainese banquet dishes", zh: "本帮宴席菜" },
    },
    {
      url: unsplash("1563245372-f21724e3856d"),
      credit: "Unsplash",
      caption: { en: "Braised pork belly", zh: "红烧肉" },
    },
    {
      url: unsplash("1555939594-58d7cb561ad1"),
      credit: "Unsplash",
      caption: { en: "Local restaurant atmosphere", zh: "本地餐馆氛围" },
    },
  ],
  "sh-wukang": [
    {
      url: wiki("2/27/Wukang_109.JPG/1280px-Wukang_109.JPG"),
      credit: "Wikimedia Commons",
      caption: { en: "Wukang Mansion", zh: "武康大楼" },
    },
    {
      url: wiki("6/6e/Wukang_Road_Shanghai.jpg/1280px-Wukang_Road_Shanghai.jpg"),
      credit: "Wikimedia Commons",
      caption: { en: "Plane-tree lined street", zh: "梧桐街道" },
    },
    {
      url: wiki("8/8f/Wukang_Building_2011.JPG/1280px-Wukang_Building_2011.JPG"),
      credit: "Wikimedia Commons",
      caption: { en: "Historic architecture", zh: "历史建筑" },
    },
  ],
  "sh-huji": [
    {
      url: unsplash("1563245372-f21724e3856d"),
      credit: "Unsplash",
      caption: { en: "Pan-fried dumplings", zh: "锅贴" },
    },
    {
      url: unsplash("1559847844-5315695dadae"),
      credit: "Unsplash",
      caption: { en: "Crispy guotie", zh: "焦脆锅贴" },
    },
    {
      url: unsplash("1555939594-58d7cb561ad1"),
      caption: { en: "Street food stall", zh: "街边小吃店" },
      credit: "Unsplash",
    },
  ],
  "sh-jingan": [
    {
      url: wiki(
        "1/17/%E9%9D%99%E5%AE%89%E5%AF%BA%C2%B7%E4%B8%8A%E6%B5%B7%E9%9D%99%E5%AE%89.jpg/1280px-%E9%9D%99%E5%AE%89%E5%AF%BA%C2%B7%E4%B8%8A%E6%B5%B7%E9%9D%99%E5%AE%89.jpg"
      ),
      credit: "Wikimedia Commons",
      caption: { en: "Golden temple roof", zh: "金顶古寺" },
    },
    {
      url: wiki("4/4b/Jing%27an_Temple_Shanghai.jpg/1280px-Jing%27an_Temple_Shanghai.jpg"),
      credit: "Wikimedia Commons",
      caption: { en: "Temple and skyscrapers", zh: "古寺与摩天楼" },
    },
    {
      url: wiki("9/9e/Jingan_Temple_2011.jpg/1280px-Jingan_Temple_2011.jpg"),
      credit: "Wikimedia Commons",
      caption: { en: "Main hall", zh: "大雄宝殿" },
    },
  ],
  "sh-huaihai": [
    {
      url: wiki("3/39/Middle_Huaihai_Rd._2.JPG/1280px-Middle_Huaihai_Rd._2.JPG"),
      credit: "Wikimedia Commons",
      caption: { en: "Huaihai Road avenue", zh: "淮海中路" },
    },
    {
      url: wiki("7/7e/Huaihai_Road_Shanghai.jpg/1280px-Huaihai_Road_Shanghai.jpg"),
      credit: "Wikimedia Commons",
      caption: { en: "Boutiques and cafés", zh: "精品店与咖啡馆" },
    },
    {
      url: unsplash("1555396273-367ea4eb4db5"),
      credit: "Unsplash",
      caption: { en: "French Concession vibes", zh: "法租界风情" },
    },
  ],
  "sh-lüya": [
    {
      url: unsplash("1555396273-367ea4eb4db5"),
      credit: "Unsplash",
      caption: { en: "Benbang cuisine", zh: "本帮菜" },
    },
    {
      url: unsplash("1563245372-f21724e3856d"),
      credit: "Unsplash",
      caption: { en: "Smoked fish cold dish", zh: "熏鱼冷盘" },
    },
    {
      url: unsplash("1555939594-58d7cb561ad1"),
      credit: "Unsplash",
      caption: { en: "Classic dining room", zh: "传统餐厅" },
    },
  ],
  "sh-sanmalu": [
    {
      url: unsplash("1555396273-367ea4eb4db5"),
      credit: "Unsplash",
      caption: { en: "Banquet-style dishes", zh: "酒楼大菜" },
    },
    {
      url: unsplash("1563245372-f21724e3856d"),
      credit: "Unsplash",
      caption: { en: "Shanghainese flavors", zh: "上海味道" },
    },
    {
      url: unsplash("1555939594-58d7cb561ad1"),
      credit: "Unsplash",
      caption: { en: "Old city dining", zh: "老城用餐" },
    },
  ],
  "sh-laodifang": [
    {
      url: unsplash("1569718212165-3a8278d5f624"),
      credit: "Unsplash",
      caption: { en: "Shanghai noodles", zh: "本帮面" },
    },
    {
      url: unsplash("1563245372-f21724e3856d"),
      credit: "Unsplash",
      caption: { en: "Noodle shop counter", zh: "面馆档口" },
    },
    {
      url: unsplash("1559847844-5315695dadae"),
      credit: "Unsplash",
      caption: { en: "Hand-pulled noodles", zh: "手工面" },
    },
  ],
  "sh-gubei": [
    {
      url: unsplash("1579027989536-b7b3a87b5a1c"),
      credit: "Unsplash",
      caption: { en: "Japanese izakaya", zh: "日式居酒屋" },
    },
    {
      url: unsplash("1553621042-f6e14724567b"),
      credit: "Unsplash",
      caption: { en: "Sushi and sashimi", zh: "寿司刺身" },
    },
    {
      url: unsplash("1559339352-11d035aa65de"),
      credit: "Unsplash",
      caption: { en: "Ramen bowl", zh: "拉面" },
    },
  ],
  "sh-chiikawa": [
    {
      url: unsplash("1607083206968-13611e3d76db"),
      credit: "Unsplash",
      caption: { en: "Pop-up merch display", zh: "快闪周边陈列" },
    },
    {
      url: unsplash("1558618666-fcd25c85cd64"),
      credit: "Unsplash",
      caption: { en: "Cute character goods", zh: "可爱角色周边" },
    },
    {
      url: unsplash("1513475382585-d06e58bcb0e0"),
      credit: "Unsplash",
      caption: { en: "Photo spot setup", zh: "打卡拍照区" },
    },
  ],
  "sh-mrx": [
    {
      url: unsplash("1518709268805-4e9042af2177"),
      credit: "Unsplash",
      caption: { en: "Immersive escape room", zh: "沉浸式密室" },
    },
    {
      url: unsplash("1552820728-8b83bb6b773f"),
      credit: "Unsplash",
      caption: { en: "Puzzle-solving theme", zh: "解谜主题场景" },
    },
    {
      url: unsplash("1511512578047-dfb367046420"),
      credit: "Unsplash",
      caption: { en: "Team adventure", zh: "团队冒险" },
    },
  ],
};

export function getPlaceGallery(
  placeId: string,
  primary?: { url: string; credit?: string }
): GalleryPhoto[] {
  const extras = G[placeId] ?? [];
  const seen = new Set<string>();
  const out: GalleryPhoto[] = [];

  if (primary?.url) {
    seen.add(primary.url);
    out.push({ url: primary.url, credit: primary.credit ?? "" });
  }

  for (const photo of extras) {
    if (!seen.has(photo.url)) {
      seen.add(photo.url);
      out.push(photo);
    }
  }

  return out;
}
