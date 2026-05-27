/**
 * VNDB 标签智能清洗模块
 * 
 * 三层过滤：
 * 1. 黑名单过滤（垃圾标签直接丢弃）
 * 2. 静态词典翻译（核心术语精准映射）
 * 3. 模式匹配翻译（"X Heroine"/"X Protagonist" 等格式化翻译）
 * 4. 去重
 */

// ── 精确映射词典 ──
const TAG_MAP: Record<string, string> = {
  // 缩写/术语
  "GAL": "GAL", "AVG": "AVG", "ADV": "ADV", "RPG": "RPG",
  "Live2D": "Live2D", "3D": "3D", "VR": "VR", "PC": "PC",
  "NSFW": "NSFW", "VN": "VN", "NVL": "NVL", "ADV/NVL": "ADV/NVL",
  "PTSD": "PTSD", "LGBT": "LGBT", "BGM": "BGM", "SE": "SE",
  "QTE": "QTE", "DLC": "DLC",
  "Kinetic Novel": "动态小说", "Sound Novel": "音声小说",
  "Visual Novel": "视觉小说", "Interactive Fiction": "互动小说",

  // 角色原型
  "Tsundere": "傲娇", "Yandere": "病娇", "Kuudere": "冷娇",
  "Dandere": "默娇", "Deredere": "开朗", "Himedere": "公主病",
  "Sadodere": "S娇", "Bakadere": "天然呆", "Ojou-sama": "大小姐",
  "Childhood Friend": "青梅竹马", "Childhood Friends": "青梅竹马",
  "Classmate": "同班同学", "Roommate": "室友",
  "Stepsister": "义妹", "Stepbrother": "义兄",
  "Cousin": "表亲", "Twin": "双胞胎", "Siblings": "兄弟姐妹",
  "Master-Servant": "主仆", "Senpai-Kouhai": "前辈后辈",
  "Master-Disciple": "师徒", "Neighbor": "邻居",

  // 主角类型
  "Protagonist with Voice Acting": "有声主角",
  "Nameable Protagonist": "可命名主角",
  "Silent Protagonist": "沉默主角",
  "Female Protagonist": "女主角",
  "Male Protagonist": "男主角",
  "Multiple Protagonists": "多主角",
  "Crossdressing Protagonist": "女装主角",
  "Time Traveler Protagonist": "时间旅行主角",
  "Chuunibyou Protagonist": "中二主角",
  "Glasses-wearing Protagonist": "眼镜主角",
  "Unlockable Protagonist": "可解锁主角",

  // 女主特定类型
  "Ponytail Heroine": "马尾女主",
  "Energetic Heroine": "元气女主",
  "Central Heroine": "核心女主",
  "No Common Sense Heroine": "无常识女主",
  "Only Younger Heroines": "仅年幼女主",
  "Ojou-sama Heroine": "大小姐女主",
  "Loli Heroine": "萝莉女主",
  "Mature Heroine": "成熟女主",
  "Yamato Nadeshiko Heroine": "大和抚子女主",
  "Tomboy Heroine": "假小子女主",
  "Gyaru Heroine": "辣妹女主",
  "Nerd Heroine": "书呆子女主",
  "Ninja Heroine": "忍者女主",
  "Miko Heroine": "巫女主",
  "Feminine Heroine": "温柔女主",
  "Warrior Heroine": "战士女主",
  "Knight Heroine": "骑士女主",
  "Rich Heroine": "富家女主",
  "Royal Heroine": "王族女主",
  "Heroine with Wings": "有翼女主",
  "Amnesiac Heroine": "失忆女主",
  "Amnesiac Protagonist": "失忆主角",
  "Divine Heroine": "神圣女主",
  "Goddess Heroine": "女神女主",
  "Student Club Member Heroine": "社团成员女主",
  "High School Student Heroine": "高中生女主",
  "Student Club President Heroine": "社团团长女主",
  "Death of Heroine": "女主死亡",
  "Death of Protagonist": "主角死亡",
  "Unavoidable Heroine Death": "不可避免的女主死亡",
  "Unavoidable Protagonist Death": "不可避免的主角死亡",
  "Completely Unavoidable Heroine Death": "完全不可避免的女主死亡",

  // 配角类型
  "Mother Support Character": "母亲角色",
  "Father Support Character": "父亲角色",
  "Older Sister Support Character": "姐姐角色",
  "Younger Sister Support Character": "妹妹角色",
  "Pet Support Character": "宠物角色",
  "Non-human Support Character": "非人配角",
  "Artificial Human Support Character": "人造人配角",
  "Ghost Support Character": "幽灵配角",
  "Shrine Maiden Support Character": "巫女配角",

  // 故事/世界观
  "Fantasy": "奇幻", "Sci-Fi": "科幻", "Horror": "恐怖",
  "Mystery": "悬疑", "Romance": "恋爱", "Comedy": "喜剧",
  "Drama": "剧情", "Action": "动作", "Adventure": "冒险",
  "Slice of Life": "日常", "School Life": "校园",
  "Supernatural": "超自然", "Mecha": "机甲",
  "Historical": "历史", "Martial Arts": "武道",
  "Music": "音乐", "Sports": "运动", "Military": "军事",
  "Psychological": "心理", "Thriller": "惊悚", "Tragedy": "悲剧",
  "Crime": "犯罪", "Cyberpunk": "赛博朋克", "Steampunk": "蒸汽朋克",
  "Post-Apocalyptic": "末日", "Dystopia": "反乌托邦",
  "Isekai": "异世界", "Time Travel": "时间旅行",
  "Gothic": "哥特", "Noir": "黑色",
  "Slice of Life Comedy": "日常喜剧",
  "Multiple Route Mystery": "多线悬疑",
  "Episodic Story": "单元剧", "Episodic": "单元剧",

  // 结局
  "Multiple Endings": "多结局",
  "One True End": "唯一真结局",
  "Open Ending(s)": "开放结局",
  "More Than Seven Endings": "7个以上结局",
  "Bad Endings with Story": "有剧情的坏结局",

  // 机制/剧情结构
  "Enforced Playing Order": "强制攻略顺序",
  "Unlockable Routes": "可解锁路线",
  "Under the Same Roof": "同居",
  "Lots of Choices": "大量选项",
  "Meaningless Choices": "无意义选项",
  "Other Perspectives": "其他视角",
  "Branching Plot": "分支剧情",
  "Choices Matter": "选择影响剧情",

  // 情感/氛围
  "Heartwarming": "温馨", "Healing": "治愈", "Bittersweet": "苦涩",
  "Dark": "黑暗", "Light-hearted": "轻松", "Gloomy": "阴郁",
  "Nostalgic": "怀旧", "Melancholic": "忧郁", "Wholesome": "正能量",
  "Fluffy": "甜蜜", "Fluff": "甜蜜", "Angst": "焦虑",
  "Gritty": "硬核", "Edgy": "边缘", "Mature": "成熟",
  "Uplifting": "积极向上", "Depressing": "压抑",
  "Hopeful": "充满希望", "Hopeless": "绝望",
  "Tense": "紧张", "Suspenseful": "悬疑", "Mysterious": "神秘",
  "Creepy": "诡异", "Disturbing": "令人不安",
  "Thought-provoking": "发人深省", "Philosophical": "哲学",
  "Satire": "讽刺", "Parody": "恶搞", "Absurdist": "荒诞",
  "Surreal": "超现实", "Epic": "史诗", "Page Turner": "引人入胜",
  "Slow Burn": "慢热", "Fast-paced": "快节奏",
  "Comfort Food": "治愈系", "Nakige": "催泪",
  "Utsuge": "郁", "Charage": "角色作", "Nukige": "拔作",
  "Eroge": "黄游", "Galge": "Galgame",
  "Bishoujo Game": "美少女游戏", "Otome Game": "乙女游戏",
  "BL Game": "BL游戏", "Yuri Game": "百合游戏",
  "Josei": "女性向", "Shoujo": "少女向", "Shounen": "少年向",
  "Seinen": "青年向", "Boys' Love": "BL", "Girls' Love": "GL",
  "Yuri": "百合", "Yaoi": "耽美", "Harem": "后宫",
  "Reverse Harem": "逆后宫", "Love Triangle": "三角关系",
  "Forbidden Love": "禁忌之恋", "Unrequited Love": "单相思",
  "First Love": "初恋",

  // 主题/事件
  "Amnesia": "失忆", "Revenge": "复仇", "Betrayal": "背叛",
  "Redemption": "救赎", "Survival": "生存", "War": "战争",
  "Conspiracy": "阴谋", "Rebellion": "叛乱", "Quest": "远征",
  "Training": "修行", "Tournament": "比赛",
  "Festival": "祭典", "School Festival": "学园祭",
  "Beach Episode": "泳装回", "Hot Spring": "温泉",
  "Trip": "旅行", "Date": "约会", "Wedding": "婚礼",
  "Christmas": "圣诞节", "Valentine": "情人节", "New Year": "新年",
  "Sacrifice": "牺牲", "Destiny": "命运", "Curse": "诅咒",
  "Prophecy": "预言", "Reincarnation": "转生",
  "Time Loop": "时间循环", "Parallel Worlds": "平行世界",
  "Dream": "梦境", "Nightmare": "噩梦", "Memory": "回忆",
  "Flashback": "回忆", "Secret": "秘密", "Identity": "身份",
  "Crossdressing": "女装",

  // 题材
  "Magic": "魔法", "Psychic": "超能力", "Telepathy": "心灵感应",
  "Telekinesis": "念力", "Alchemy": "炼金术", "Summoning": "召唤",
  "Necromancy": "死灵术", "Dark Magic": "暗黑魔法",
  "Elemental Magic": "元素魔法", "Occult": "神秘学",
  "Mythology": "神话", "Folklore": "民间传说", "Fairy Tale": "童话",
  "Urban Fantasy": "都市奇幻", "High Fantasy": "史诗奇幻",
  "Sword and Sorcery": "剑与魔法", "Space Opera": "太空歌剧",
  "Real Robot": "真实机器人", "Super Robot": "超级机器人",
  "Kaiju": "怪兽", "Wuxia": "武侠", "Xianxia": "仙侠",

  // 内容标签
  "Violence": "暴力", "Descriptions of Violence": "暴力描写",
  "Gore": "血腥", "Death": "死亡", "Murder": "杀人",
  "Suicide": "自杀", "Bullying": "霸凌",
  "Investigation": "调查", "Escape": "逃脱",
  "Insanity": "疯狂", "Depression": "抑郁症",
  "Alcoholism": "酗酒", "Smoking": "吸烟",
  "Coming of Age": "成长", "Self-Discovery": "自我发现",
  "Friendship": "友情", "Rivalry": "竞争", "Mentor": "导师",
  "Justice": "正义", "Ambition": "野心", "Power": "权力",
  "Corruption": "腐败", "Revolution": "革命",
  "Liberation": "解放", "Exploration": "探索",
  "Science": "科学", "Technology": "科技", "Nature": "自然",
  "Animals": "动物", "Dogs": "狗", "Cats": "猫", "Birds": "鸟",
  "Dragons": "龙", "Dinosaurs": "恐龙",
  "Monsters": "怪物", "Aliens": "外星人",
  "Gods": "神", "Undead": "亡灵", "Zombies": "僵尸",
  "Spirits": "精灵", "Fairies": "妖精",

  // 场景/地点
  "School": "学校", "High School": "高中", "University": "大学",
  "Academy": "学院", "Dormitory": "宿舍", "Classroom": "教室",
  "Library": "图书馆", "Rooftop": "天台", "Clubroom": "社团教室",
  "Nurse's Office": "保健室", "Cafeteria": "食堂",
  "Bedroom": "卧室", "Living Room": "客厅",
  "Park": "公园", "City": "城市", "Town": "城镇",
  "Village": "村庄", "Mountain": "山", "Forest": "森林",
  "Sea": "海", "Beach": "海滩", "Island": "岛屿",
  "Castle": "城堡", "Temple": "寺庙", "Shrine": "神社",
  "Church": "教堂", "Hospital": "医院", "Prison": "监狱",
  "Laboratory": "实验室", "Cafe": "咖啡店", "Restaurant": "餐厅",
  "Bar": "酒吧", "Train": "列车",
  "Space": "宇宙", "Spaceship": "宇宙船",
  "Another World": "异世界", "Underworld": "冥界",
  "Heaven": "天堂", "Hell": "地狱",
  "Fictional Modern Day Japanese Town": "虚构日本现代都市",
  "Fictional Modern Day Japanese Countryside": "虚构日本田园",

  // 时间/时代
  "Medieval": "中世纪", "Victorian": "维多利亚时代",
  "Meiji": "明治时代", "Taisho": "大正时代",
  "Heian Period": "平安时代", "Sengoku": "战国时代",
  "Edo": "江户时代", "Ancient": "古代",
  "Future": "未来", "Near Future": "近未来",
  "Alternate History": "架空历史", "Modern Day": "现代",

  // 玩法机制
  "Dating Sim": "恋爱模拟", "Life Sim": "生活模拟",
  "Raising Sim": "养成模拟", "Visual Novel Adventure": "视觉小说冒险",
  "Visual Novel RPG": "视觉小说RPG", "Tactical RPG": "战术RPG",
  "Action RPG": "动作RPG", "Stealth": "潜行",
  "Survival Horror": "生存恐怖", "Psychological Horror": "心理恐怖",
  "Roguelike": "Roguelike", "Puzzle": "解谜",
  "Tower Defense": "塔防", "Sandbox": "沙盒",
  "Point and Click": "点击冒险", "Text Adventure": "文字冒险",
}

// ── 黑名单（直接丢弃） ──
const TAG_BLACKLIST = new Set([
  // 发型/瞳色/外貌
  "Side Ponytail", "Low Twin Tails", "Hair Over One Eye", "Hair Buns",
  "Half Updo", "Ahoge", "Antenna Hair", "Asymmetric Hair", "Bob Cut",
  "Crew Cut", "Dreadlocks", "Emo Hair", "Hime Cut", "Pixie Cut",
  "Shag Hair", "Spiky Hair", "Straight Hair", "Wavy Hair", "Curly Hair",
  "Messy Hair", "Parted Hair", "Chonmage", "Sidetails",
  "Twin Braids", "Single Braid", "French Braid", "Crown Braid",
  "Fishtail Braid", "Dutch Braid", "Loose Braid",
  "Ponytail", "Twintails", "Short Hair", "Long Hair",
  "Very Long Hair", "Medium Hair", "Bald", "Shaved Head",
  "Long Hair Heroine", "Short Hair Heroine",
  "Red Eyes", "Blue Eyes", "Green Eyes", "Yellow Eyes", "Purple Eyes",
  "Orange Eyes", "Pink Eyes", "White Eyes", "Black Eyes", "Brown Eyes",
  "Golden Eyes", "Silver Eyes", "Grey Eyes", "Aqua Eyes", "Amber Eyes",
  "Hazel Eyes", "Teal Eyes", "Multicolored Eyes", "Heterochromia",
  "Eye Patch", "Glasses", "Sunglasses", "Monocle", "Goggles",

  // 服装配饰
  "Apron", "Bandana", "Belt", "Bikini", "Blindfold", "Boots",
  "Bowtie", "Bracelet", "Bra", "Bunny Suit", "Cape", "Cardigan",
  "Chain", "Choker", "Coat", "Collar", "Corset", "Crown", "Cuffs",
  "Earrings", "Eyepatch", "Feather", "Garter Belt", "Gloves",
  "Hair Accessory", "Hairband", "Hair Bow", "Hair Clip", "Hair Ribbon",
  "Hat", "Headband", "Headphones", "Hood", "Hoodie", "Jacket",
  "Jeans", "Jewelry", "Knee-high Socks", "Lab Coat", "Leggings",
  "Mask", "Miniskirt", "Mittens", "Necklace", "Necktie", "Pantyhose",
  "Pendant", "Piercings", "Ring", "Ribbon", "Sandals", "Scarf",
  "School Swimsuit", "Shawl", "Shirt", "Shorts", "Skirt", "Sleeveless",
  "Sneakers", "Stockings", "Suspenders", "Sweater", "Swimsuit",
  "Thigh-high Socks", "Tie", "Towel", "Uniform", "Veil", "Vest",
  "Wristband", "Yukata", "Kimono", "Hakama", "Qipao", "Cheongsam",
  "Sailor Uniform", "Military Uniform", "Maid Outfit", "Nurse Outfit",
  "School Uniform", "Tracksuit", "Tank Top", "T-shirt", "Dress",
  "Suit", "Tuxedo", "Overalls", "Overcoat", "Poncho", "Parka",
  "Armor", "Battle Bikini", "Exposed Thighs", "Zettai Ryouiki",
  "Hair Up", "Hair Down", "Side Up", "Low Twintails",
  "Braided Ponytail", "Braids", "Drill Hair",

  // 身体特征
  "Small Breasts", "Large Breasts", "Huge Breasts", "Flat Chest",
  "Wide Hips", "Narrow Waist", "Tall", "Short", "Slim", "Chubby",
  "Muscular", "Tanned", "Pale Skin", "Freckles", "Scar", "Beauty Mark",
  "Mole", "Bandaged", "Missing Limb", "Missing Eye", "Burns",
  "Dental Braces", "Fangs", "Pointy Ears", "Horns", "Tail", "Wings",
  "Third Eye", "Six-pack", "Stomachache", "Sidelocks",

  // 色情/性癖
  "Missionary Position", "Standing Sex", "Twin Handjob",
  "Sexual Fantasizing", "Defloration", "Only Virgin Heroines",
  "Sex with Protagonist Only", "Low Sexual Content",
  "Footjob", "Paizuri", "Handjob", "Blowjob", "Facial", "Creampie",
  "Gokkun", "Bukkake", "Ahegao", "Spanking", "Bondage", "Leash",
  "Chastity Belt", "Exhibitionism", "Voyeurism", "Threesome",
  "Group Sex", "Incest", "Lolicon", "Shotacon", "Bestiality",
  "Necrophilia", "Futanari", "Femdom", "Maledom", "Mind Break",
  "Brainwashing", "Hypnosis", "Netorare", "Netorase", "Netori",
  "Tentacles", "Omorashi", "Watersports", "Scat", "Vore", "Guro",
  "Snuff", "Impregnation", "Multiple Penetration", "Anal", "Rimming",
  "Rape", "Gang Rape", "Public Sex", "Outdoor Sex", "Sex Toys",
  "Vibrator", "Dildo", "Panties", "Underwear", "Nudity", "Full Nudity",
  "Partial Nudity", "Toplessness", "Bottomless", "Clothing Damage",
  "Wardrobe Malfunction", "Up-skirt", "Panty Shot", "Ecchi",
  "Fan Service", "Adult Only", "Explicit Sexual Content",
  "Uncensored", "Censored", "Mosaic Censoring", "Bar Censoring",

  // UI/系统机制
  "Varied Title Screens", "Changeable Font", "Backlog Jump",
  "Completion Status Indicator", "Read Text Marking",
  "Chosen Choices Marking", "Music Recollection", "Date Display",
  "Multiple Credit Rolls", "Brief NVL Scenes", "Auto Mode",
  "Text Skip", "Save Anywhere", "Auto Save", "Quick Save",
  "Quick Load", "Save Slots", "Dialogue History", "Scene Recollection",
  "CG Recollection", "Ending Recollection", "Sound Mode",
  "Title Screen Changes", "Opening Skip", "Ending Skip",
  "Text Log", "Backlog", "Skip Read Text", "Auto Advance",
  "Mouse Wheel Support", "Keyboard Support", "Controller Support",
  "Touch Screen Support", "Mobile Support", "Fullscreen",
  "Windowed Mode", "Resolution Options", "Display Options",
  "Language Options", "Subtitle Options",

  // 平台/发布
  "Windows", "Mac", "Linux", "Switch", "PS4", "PS5",
  "PSP", "PSVita", "Xbox", "Steam", "GOG", "itch.io", "DMM",
  "DLsite", "Getchu", "DLSite", "Nutaku", "MangaGamer",
  "JAST USA", "Sekai Project", "Frontwing", "VisualArts",
  "Prototype", "Entergram", "Shiravune", "NekoNyan",
  "Hikari Field", "Sol Press",
  "Freeware", "Commercial", "Doujin", "Fan Made",
  "Abandoned", "In Development", "Cancelled", "Released",
  "Upcoming", "Announced", "Early Access", "Alpha", "Beta",
  "Trial", "Full Version", "Trial Version", "Demo Version",
  "Remastered",
])

// ── 正则兜底规则 ──
const TAG_FILTER_RULES: RegExp[] = [
  /spoiler/i,
  /^CV[:：]/i,
  /trivia/i,
  /Translation$/i,
]

// ── 模式匹配：处理 "X Heroine" / "X Protagonist" / "X Support Character" 等格式 ──
const PATTERNS: Array<[RegExp, (m: RegExpMatchArray) => string]> = [
  [/^([\w][\w\s-]*?)\s+Heroine$/i, (m) => {
    const adj = translateWord(m[1].trim().toLowerCase())
    return adj ? adj + "女主" : ""
  }],
  [/^([\w][\w\s-]*?)\s+Protagonist$/i, (m) => {
    const adj = translateWord(m[1].trim().toLowerCase())
    return adj ? adj + "主角" : ""
  }],
  [/^([\w][\w\s-]*?)\s+Support Character$/i, (m) => {
    const adj = translateWord(m[1].trim().toLowerCase())
    return adj ? adj + "角色" : ""
  }],
  [/^([\w]+)\s+Hair Heroine$/i, (m) => {
    const color = translateColor(m[1].trim().toLowerCase())
    return color ? color + "发女主" : ""
  }],
]

function translateColor(c: string): string {
  const map: Record<string, string> = {
    blonde: "金", black: "黑", brown: "棕", red: "红", blue: "蓝",
    green: "绿", white: "白", silver: "银", pink: "粉", purple: "紫",
    orange: "橙", grey: "灰", gray: "灰", auburn: "赤棕",
  }
  return map[c] || ""
}

function translateWord(w: string): string {
  const words: Record<string, string> = {
    // 人物身份
    student: "学生", teacher: "教师", nurse: "护士", maid: "女仆",
    knight: "骑士", wizard: "魔法师", witch: "魔女", princess: "公主",
    prince: "王子", angel: "天使", demon: "恶魔", ghost: "幽灵",
    vampire: "吸血鬼", elf: "精灵", robot: "机器人", android: "机器人",
    catgirl: "猫娘", foxgirl: "狐娘", mermaid: "人鱼", idol: "偶像",
    detective: "侦探", ninja: "忍者", samurai: "武士", assassin: "刺客",
    soldier: "军人", spy: "间谍", pirate: "海盗", thief: "盗贼",
    mercenary: "佣兵", ranger: "游侠", bard: "吟游诗人",
    priest: "牧师", monk: "僧侣", paladin: "圣骑士",
    alchemist: "炼金术士", healer: "治愈师", summoner: "召唤师",
    necromancer: "死灵法师", exorcist: "驱魔师",
    bodyguard: "保镖", traveler: "旅者", adventurer: "冒险者",
    pilot: "驾驶员", researcher: "研究者",
    "cat protagonist": "猫", "animal protagonist": "动物",

    // 家庭关系
    mother: "母亲", father: "父亲", brother: "兄弟", sister: "姐妹",
    "older sister": "姐姐", "younger sister": "妹妹",
    pet: "宠物", child: "儿童", male: "男性", female: "女性",
    servant: "仆人", "artificial human": "人造人", "non-human": "非人",

    // 修饰词
    orphan: "孤儿", amnesiac: "失忆", rich: "富家", poor: "贫穷",
    royal: "王族", warrior: "战士", tomboy: "假小子", gyaru: "辣妹",
    nerd: "书呆子", miko: "巫女", feminine: "温柔",
    loli: "萝莉", mature: "成熟", "ojou-sama": "大小姐",
    divine: "神圣", goddess: "女神", energetic: "元气", central: "核心",
    crippled: "残疾", "no common sense": "无常识",
    tsundere: "傲娇", yandere: "病娇", kuudere: "冷娇",
    dandere: "默娇", deredere: "开朗", himedere: "公主病",
    sadodere: "S娇", bakadere: "天然呆",

    // 性格
    silent: "沉默", shy: "害羞", otaku: "宅系", loner: "孤独",
    perverted: "好色", "weak-willed": "软弱", depressed: "忧郁",
    delinquent: "不良", "old": "年长", "older": "年长",
    criminal: "犯罪", "sword wielding": "剑士", homeless: "流浪者",
    "crossdressing": "女装", "time traveler": "时间旅行",
    chuunibyou: "中二", unlucky: "不幸", lazy: "懒惰",
    smart: "聪明", "glasses-wearing": "眼镜",
    dull: "迟钝", stubborn: "固执", optimistic: "乐观",
    cheerful: "开朗", playful: "淘气", rude: "粗鲁",
    polite: "礼貌", patient: "耐心", honest: "诚实",
    secretive: "神秘", kind: "温柔", cold: "冷漠",
    emotionless: "无表情", flirty: "花心", loyal: "忠诚",
    rebellious: "叛逆", cunning: "狡猾", brave: "勇敢",
    cowardly: "懦弱", innocent: "天真", corruptible: "堕落",
    arrogant: "傲慢", humble: "谦虚", serious: "严肃",
    "short-tempered": "暴躁", scared: "胆小", ambitious: "有野心",
    indecisive: "优柔寡断", "well-mannered": "有教养",
    mischievous: "顽皮", violent: "暴力", reckless: "鲁莽",
    creative: "创造型", aggressive: "攻击性", gentle: "温柔",
    "hot-blooded": "热血", strategist: "策略家", talented: "天才",
    unskilled: "废柴", unaware: "迟钝", hardworking: "努力型",
    wise: "贤者", responsible: "有责任感", careless: "大意",
    charming: "有魅力", bored: "无聊",

    // 身份扩展
    shrine: "神社",
  }
  return words[w] || ""
}

// ── 主函数：清洗标签列表 ──
export function cleanTags(
  rawTags: Array<{ name: string; rating?: number }>
): string[] {
  const seen = new Set<string>()
  const result: string[] = []

  // 按 rating 降序，优先保留高质量标签
  const sorted = [...rawTags].sort(
    (a, b) => (b.rating ?? 0.5) - (a.rating ?? 0.5)
  )

  for (const { name } of sorted) {
    if (!name?.trim()) continue
    const key = name.trim()
    const lowerKey = key.toLowerCase()

    // 1) 黑名单
    if (TAG_BLACKLIST.has(key) || TAG_BLACKLIST.has(lowerKey)) continue

    // 2) 正则规则
    if (TAG_FILTER_RULES.some((r) => r.test(key))) continue

    // 3) 精确映射
    let translated = TAG_MAP[key] ?? TAG_MAP[lowerKey]

    // 4) 模式匹配
    if (!translated) {
      for (const [pattern, fn] of PATTERNS) {
        const m = key.match(pattern)
        if (m) {
          translated = fn(m)
          break
        }
      }
    }

    // 5) 未翻译的英文标签 → 丢弃（避免用户看到看不懂的英文）
    if (!translated) continue

    // 6) 去重
    const normalized = translated.toLowerCase()
    if (seen.has(normalized)) continue
    seen.add(normalized)

    result.push(translated)
  }

  return result
}