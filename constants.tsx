
import { Level, ActivityOption } from './types';

// 扩展后的本地灵感库 - 离线模式
export const LOCAL_INSPIRATION_POOL: ActivityOption[] = [
  { title: "红山动物园", icon: "fa-paw", description: "去看看顶流杜杜，和可爱的小动物们打个招呼" },
  { title: "电玩城大PK", icon: "fa-gamepad", description: "PKPKPKPKPKP，输的人请喝奶茶" },
  { title: "南京博物院", icon: "fa-landmark", description: "感受跨越时空的质感，在古物面前许个小愿望" },
  { title: "先锋书店", icon: "fa-book", description: "在安静的角落挑一本书，或者写一张寄给未来的明信片" },
  { title: "玄武湖划船", icon: "fa-ship", description: "在波光粼粼的湖面上虚度光阴，看远处的城市天际线" },
  { title: "老门东寻味", icon: "fa-utensils", description: "在古色古香的建筑间，寻找那些藏在深巷里的特色点心" },
  { title: "台球对决", icon: "fa-bowling-ball", description: "看看谁是今天真正的气运之子" },
  { title: "午后咖啡馆", icon: "fa-coffee", description: "找一家安静的店，虚度一个只有我们的下午" },
  { title: "看一场电影", icon: "fa-film", description: "躲进黑暗的放映厅，分享一桶甜咸参半的爆米花" },
  { title: "河西日落", icon: "fa-sun", description: "去江边等一场日落，记录下天空变成粉橘色的瞬间" },
  { title: "手作陶艺", icon: "fa-hands", description: "一起捏一个丑萌的杯子，那是我们共同的创作成果" },
  { title: "猫咖治愈", icon: "fa-cat", description: "被一群毛茸茸的小家伙包围，心情会瞬间变好" },
  { title: "密室逃脱", icon: "fa-key", description: "智力与胆量的双重考验，记得配合好我哦" },
  { title: "江边野餐", icon: "fa-apple-alt", description: "铺开野餐布，在草地上享受微风和美食" },
  { title: "趣味合影", icon: "fa-camera", description: "记录下今天最不经意的那些瞬间" }
];

export const DEFAULT_ACTIVITIES: ActivityOption[] = LOCAL_INSPIRATION_POOL.slice(0, 9);

export const PRESET_ICONS = [
  "fa-star", "fa-paw", "fa-gamepad", "fa-landmark", "fa-book", 
  "fa-ship", "fa-lightbulb", "fa-bowling-ball", "fa-coffee", 
  "fa-utensils", "fa-camera", "fa-ticket", "fa-ice-cream", 
  "fa-bicycle", "fa-music", "fa-cat", "fa-sun", "fa-hands", 
  "fa-film", "fa-key", "fa-apple-alt", "fa-gem", "fa-palette"
];

export const LEVELS: Level[] = [
  {
    id: 1,
    title: "记住我 · 灯笼序列",
    gameType: 'click', 
    gameInstructions: "夫子庙的晚风温柔。在摇曳的红色灯火中，记住亮起的顺序，这是属于我们的一份默契考验。",
    optionsPool: [],
    image: "" 
  },
  {
    id: 2,
    title: "城墙跨越 · 反应挑战",
    gameType: 'timing', 
    gameInstructions: "漫步明城墙需要一点活力。点击屏幕跳过障碍，看看我们的步调是否一致吧！",
    optionsPool: [],
    image: ""
  },
  {
    id: 3,
    title: "管道小鸟 · 密林穿梭",
    gameType: 'click', 
    gameInstructions: "最后一步，控制飞鸟穿过茂密的丛林。终点就在前方，惊喜锦囊在等你！",
    optionsPool: [],
    image: ""
  }
];
