// ========== 密码保护配置 ==========
const INTERNAL_PASSWORD = 'YOUR_INTERNAL_PASSWORD';
let passwordUnlocked = false;

function checkPassword(onSuccess, title) {
  title = title || '内部内容已加密';
  if (passwordUnlocked) { onSuccess(); return; }
  var overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'pwdOverlay';
  overlay.innerHTML = '<div class="modal-box pwd-modal-box"><div class="pwd-lock-icon">🔐</div><div class="pwd-modal-title">' + title + '</div><div class="pwd-modal-hint">请输入访问密码</div><div class="pwd-input-wrap"><input type="password" id="pwdInput" class="pwd-input" placeholder="请输入密码..." autocomplete="off" /><button class="pwd-eye-btn" id="pwdEyeBtn"><i class="ri-eye-off-line"></i></button></div><div class="pwd-error hidden" id="pwdError">密码错误，请重试</div><div class="pwd-actions"><button class="modal-btn cancel" id="pwdCancelBtn">取消</button><button class="modal-btn confirm" id="pwdConfirmBtn"><i class="ri-lock-unlock-line"></i> 解锁</button></div></div>';
  document.body.appendChild(overlay);
  var input = document.getElementById('pwdInput');
  var eyeBtn = document.getElementById('pwdEyeBtn');
  var errorEl = document.getElementById('pwdError');
  var visible = false;
  eyeBtn.addEventListener('click', function() {
    visible = !visible;
    input.type = visible ? 'text' : 'password';
    eyeBtn.innerHTML = visible ? '<i class="ri-eye-line"></i>' : '<i class="ri-eye-off-line"></i>';
  });
  function doConfirm() {
    if (input.value === INTERNAL_PASSWORD) {
      passwordUnlocked = true;
      overlay.remove();
      onSuccess();
    } else {
      errorEl.classList.remove('hidden');
      input.value = '';
      input.focus();
      setTimeout(function() { errorEl.classList.add('hidden'); }, 2000);
    }
  }
  document.getElementById('pwdConfirmBtn').addEventListener('click', doConfirm);
  input.addEventListener('keydown', function(e) { if (e.key === 'Enter') doConfirm(); });
  document.getElementById('pwdCancelBtn').addEventListener('click', function() {
    overlay.remove();
    // 取消时把导航高亮还原到当前实际视图
    document.querySelectorAll('.sidebar-tab').forEach(b => {
      b.classList.toggle('active', b.dataset.view === state.currentView);
    });
  });
  setTimeout(function() { input.focus(); }, 100);
}

// ========== 数据模型 ==========
const PLATFORMS = [
  { id: 'youtube', name: 'YouTube', icon: '📺', desc: '全球最大视频平台', version: 'v20.0', color: '#c62828' },
  { id: 'twitch', name: 'Twitch', icon: '🎮', desc: '游戏直播第一平台 · PDF文档+采买广告+TwitchCon赞助指南', version: 'v36.0', color: '#6a1b9a' },
  { id: 'discord', name: 'Discord', icon: '💬', desc: '社区沟通首选工具', version: 'v31.0', color: '#283593' },
  { id: 'tiktok', name: 'TikTok', icon: '🎵', desc: '短视频全球15亿+ · 采买广告完整指南', version: 'v22.0', color: '#00695c' },
  { id: 'reddit', name: 'Reddit', icon: '🔥', desc: '海外论坛第一平台', version: 'v18.0', color: '#e65100' },
];

const DOC_TYPES = [
  { value: 'platform_policy', label: '平台政策' },
  { value: 'promo_rules', label: '推广资源规则' },
  { value: 'project_data', label: '项目效果数据' },
  { value: 'internal_report', label: '内部项目报告' },
  { value: 'other', label: '其他信息' },
];

const CATEGORIES = [
  { key: 'promo', label: '推广资源', icon: '📢', dbKey: '推广' },
  { key: 'ops', label: '运营功能', icon: '⚙️', dbKey: '运营' },
  { key: 'tech', label: '技术合作', icon: '🔧', dbKey: '技术' },
];

const INITIAL_DATA = [
  {
    _id: "s001", title: "YouTube Shorts 推广策略：利用短视频引爆海外流量",
    content: "YouTube Shorts 是当前海外短视频推广的核心渠道之一。建议策略如下：\n\n1. 内容方向：制作15-60秒的产品演示、使用教程、用户故事等短视频内容，重点突出产品差异化卖点。\n2. 发布频率：保持每周3-5条的更新频率，利用YouTube算法的推荐机制获取自然流量。\n3. 标签优化：使用热门标签如 #Shorts #ProductReview #TechTips 等，配合长尾关键词提升搜索曝光。\n4. 合作策略：联系中腰部YouTuber（10K-100K粉丝），通过产品置换或佣金分成模式开展合作。\n5. 数据追踪：重点关注CTR（点击率）、平均观看时长和转化率三个核心指标。\n\n预期效果：3个月内可实现自然流量增长200%-300%。",
    platform: "YouTube", category: "推广", source_type: "public",
    update_time: "2026-03-15T10:30:00.000Z", url: "https://youtube.com/creators"
  },
  {
    _id: "s002", title: "2026年YouTube四大季节性活动：时间、策略与操作指引",
    content: "★ 2026年四大季节性活动：时间、折扣与操作指引\n\n● 🌸 春季活动 Spring Campaign (3月19日-3月26日)\n持续8天。建议投放力度：新品(上线<6月)设25-35%预算，已过首发期40-55%，成熟频道(2年+)设60-75%。操作：提前至3月5日前注册活动。首日设最高投放可获算法加权。全站流量提升约300%，独立创作者平均增长3-5倍。\n\n● ☀️ 夏季活动 Summer Campaign (6月25日-7月9日)\n持续15天，年度最大活动。建议投放力度：独立创作者首折40-50%，成熟频道50-70%。头3天贡献全活动60%以上流量，务必首日参与。搭配Discovery推荐，日均曝光可达10万-50万次。\n\n● 🍂 秋季活动 Autumn Campaign (10月1日-10月8日)\n持续8天。建议投放力度：比春季深5-10%。适合在新品节放预告、秋季活动出首次投放的组合策略。\n\n● ❄️ 冬季活动 Winter Campaign (12月17日-2027年1月4日)\n持续19天，节日送礼高峰。建议投放力度：与夏季活动持平或略高5%。冬季活动期间礼物购买量是平时的8-12倍。\n\n📋 操作步骤（适用于所有季节活动）\nStep1: 后台→营销→活动注册 → Step2: 设置投放预算 → Step3: 准备素材更新(横幅/截图/描述) → Step4: 社交媒体预告(建议活动前3天) → Step5: 首日监控数据，必要时通过社区公告二次推广",
    platform: "YouTube", category: "推广", source_type: "public",
    update_time: "2026-03-18T09:00:00.000Z", url: "https://youtube.com/creators"
  },
  {
    _id: "s003", title: "Twitch 直播运营最佳实践：打造高互动社区",
    content: "Twitch平台的运营核心在于社区建设和互动体验。以下是经过验证的运营策略：\n\n1. 直播时间规划：根据目标市场时区安排直播，北美市场建议UTC-5晚间8-11点。\n2. 互动机制设计：设置频道积分系统、订阅者专属表情、定期Sub-only直播等。\n3. 社区活动：每月举办社区游戏日、观众对战赛等活动，增强归属感。\n4. 跨平台引流：将Twitch精彩片段剪辑后发布到YouTube和TikTok。\n5. 数据分析：利用Twitch Analytics追踪同时在线人数、聊天活跃度。",
    platform: "Twitch", category: "运营", source_type: "public",
    update_time: "2026-03-14T08:15:00.000Z", url: "https://twitch.tv/creatorcamp"
  },
  {
    _id: "s004", title: "Discord 社区搭建技术方案：Bot开发与自动化管理",
    content: "Discord作为海外社区管理的核心工具，技术层面的搭建至关重要：\n\n1. 服务器架构：按功能分区设置频道。\n2. Bot开发：欢迎Bot、审核Bot、数据Bot、票务Bot。\n3. 集成方案：Webhook集成GitHub/GitLab、接入Zapier。\n4. 安全措施：启用二次验证、设置防Raid保护。\n\n技术栈建议：Discord.js v14 + Node.js + MongoDB。",
    platform: "Discord", category: "技术", source_type: "public",
    update_time: "2026-03-13T14:20:00.000Z", url: "https://discord.com/developers/docs"
  },
  {
    _id: "s005", title: "【内部】竞品A正在大规模签约TikTok头部达人",
    content: "据内部渠道获悉，竞品A近期正在大规模接触TikTok头部达人（粉丝量500K+），计划在Q2发起集中推广攻势。\n\n关键情报：\n1. 预算规模：预计投入$500K-$800K用于达人合作。\n2. 合作模式：以固定费用+销售佣金（15%-20%）的混合模式为主。\n3. 目标品类：聚焦消费电子和智能家居两个垂直领域。\n4. 时间节点：预计4月中旬开始集中投放，持续至6月底。",
    platform: "TikTok", category: "推广", source_type: "internal",
    update_time: "2026-03-16T09:00:00.000Z", url: ""
  },
  {
    _id: "s006", title: "Reddit 社区营销策略：AMA与内容种草指南",
    content: "Reddit是一个高度依赖社区信任的平台：\n\n1. 子版块选择：根据产品定位选择相关Subreddit。\n2. AMA活动：以创始人/产品经理身份发起AMA。\n3. 内容种草：分享产品背后的技术故事。\n4. Reddit Ads：利用Promoted Posts精准定向。",
    platform: "Reddit", category: "推广", source_type: "public",
    update_time: "2026-03-12T16:45:00.000Z", url: "https://reddit.com/advertising"
  },
  {
    _id: "s007", title: "【内部】Discord社区反馈：用户强烈要求增加中文支持",
    content: "从我方Discord社区近两周的反馈汇总来看，中文用户群体的需求日益强烈：\n\n1. 超过40%的活跃用户来自中文地区。\n2. 用户多次在feedback频道要求增加中文界面。\n3. 部分用户因语言障碍已流失至竞品社区。\n\n建议行动：优先上线产品中文本地化。",
    platform: "Discord", category: "运营", source_type: "internal",
    update_time: "2026-03-15T18:30:00.000Z", url: ""
  },
  {
    _id: "s008", title: "YouTube API 数据分析技术集成方案",
    content: "利用YouTube Data API v3实现自动化数据采集与分析：\n\n1. API接入配置：Google Cloud Console创建项目。\n2. 数据采集方案：Search API、Videos API、Channels API、Analytics API。\n3. 数据存储与可视化：Cloud Functions + BigQuery + Data Studio。\n4. 告警机制：竞品播放量异常增长时自动通知。",
    platform: "YouTube", category: "技术", source_type: "public",
    update_time: "2026-03-11T11:00:00.000Z", url: "https://developers.google.com/youtube/v3"
  },
  {
    _id: "s009", title: "Twitch 推广合作：主播赞助策略",
    content: "Twitch主播赞助是触达核心玩家群体的有效手段：\n\n1. 主播筛选标准：CCV 500+、聊天互动率>5%。\n2. 合作形式：品牌赞助直播、频道订阅赞助、锦标赛赞助。\n3. 效果评估：品牌曝光、引流效果、ROI目标控制CPA在$5以下。",
    platform: "Twitch", category: "推广", source_type: "public",
    update_time: "2026-03-10T09:30:00.000Z", url: "https://twitchadvertising.tv"
  },
  {
    _id: "s012", title: "Twitch CSPON & Bounty Board 推广工具全解析",
    content: "基于Twitch官方内部文档整理，CSPON和Bounty Board是Twitch Creator Sponsorships中最核心的两个规模化推广工具。\n\n══════════════════════════════════════════\n一、CSPON（Creator Matchmaking Tool）\n══════════════════════════════════════════\n\n定义：通过Amazon DSP和Twitch创作者匹配工具，厂商可主动发起与Twitch创作者的合作。\n\n核心机制：\n· 厂商可根据品类、受众、地区、预算等条件系统性匹配主播\n· 合作以模板化方案执行，降低沟通成本\n· 使用亚马逊测量工具追踪效果（曝光量、点击率、转化等）\n· 通过Amazon DSP统一管理投放和创作者合作\n\n适用场景：\n· 需要快速对接大量创作者的品牌推广\n· 有明确受众画像和地区要求的精准营销\n· 需要标准化流程管理多个创作者合作\n\n══════════════════════════════════════════\n二、Bounty Board（悬赏任务板）\n══════════════════════════════════════════\n\n定义：品牌与大量Twitch创作者高效连接的市场平台，创作者可以自主浏览和接受品牌赞助机会（bounties）。\n\n核心机制：\n· 计费模式：CPV绩效计费（有效观看>2分钟才计费），基准出价$0.5（可根据竞争浮动至$0.7-$0.8）\n· 已全面升级为\"Always-on\"模式，品牌可长期保持活跃任务\n· 支持精准定向：语言/国家/品类/受众多维筛选\n· 品牌安全：Twitch审核机制确保内容合规\n· 高效触达：一次设置可触达海量中腰部创作者\n\n操作建议：\n· 建议预算：初次测试$5K-$10K，持续运营$20K-$50K/月\n· 素材要求：提供清晰的品牌Brief和创作者指南\n· 效果追踪：关注CPV、有效观看时长、社区讨论度三个核心指标\n· 组合策略：Bounty Board + CSPON双管齐下效果最佳\n\n══════════════════════════════════════════\n数据分析与反馈体系\n══════════════════════════════════════════\n\n· 每次合作完成后提供详细报告：总曝光量、点击率、每位主播具体表现\n· Chat Sentiment Analysis：自动分析观众评论正面/中性/负面情绪分布\n· 可监控竞争对手提及率，总结关键引用\n· 通过ADSP整合报告套件追踪ROI\n· 获取Twitch创作者驱动活动成效的第一方数据洞察",
    platform: "Twitch", category: "推广", source_type: "internal",
    update_time: "2026-03-23T12:07:00.000Z", url: "",
    channel: "Twitch官方文档"
  },
  {
    _id: "s013", title: "Twitch Creator Sponsorships 合作方案详解",
    content: "Twitch Creator Sponsorships 是通过创作者赞助激发社区对话、支持主播经济的完整合作体系。\n\n══════════════════════════════════════════\n一、Channel Takeovers（频道接管）\n══════════════════════════════════════════\n\n定义：将任意Twitch创作者的频道转变为品牌直播体验，是多周深度合作的高端产品。\n\n核心组件：\n· Channel Skins — 可点击的联合品牌图形，出现在赞助直播和移动设备上\n· Sponsored Subs — 赞助Twitch订阅，在直播过程中发放有意义的品牌体验\n· Streamer Readouts — 主播将品牌信息融入内容，选择定时推广，与新观众建立联系\n· Follower Promotions — 品牌合作展示出现在观众关注列表顶部，附带品牌宣传作为活动一部分\n\n关键数据：\n· Alpha Wall Promotion：将直播置于关注列表最顶端，最高提升30%额外CCV\n· 每次活动最多可激活12位主播\n· 交付周期：约2周\n· 购买方式：通过Amazon DSP管理服务，固定费率\n\n══════════════════════════════════════════\n二、Homepage Carousel（首页轮播位）\n══════════════════════════════════════════\n\n· 在Twitch首页轮播位推广直播频道内容\n· 作为所有BPS（Brand Partnership Studio）直播内容的推广元素\n· 数据证明：Homepage Carousel可将游戏观看人数提升至2倍\n\n══════════════════════════════════════════\n三、Streamables（全屏广告体验）\n══════════════════════════════════════════\n\n· 用户主动选择进入全屏广告体验（opt-in模式）\n· 在Twitch合作移动游戏中触发，观看30秒不可跳过的直播内容\n· 观看结束后用户可继续在Twitch观看直播或返回原应用\n\n══════════════════════════════════════════\n四、Our own Fortnite Island!\n══════════════════════════════════════════\n\n· Twitch可为品牌创建自定义Fortnite地图\n· 结合游戏体验与品牌推广，触达Fortnite庞大的活跃玩家群体",
    platform: "Twitch", category: "推广", source_type: "internal",
    update_time: "2026-03-23T12:07:00.000Z", url: "",
    channel: "Twitch官方文档"
  },
  {
    _id: "s014", title: "TwitchCon 2025 完整赞助指南：日程数据 / 赞助套餐 / 三大展区 / 区域赞助费用 / 展台方案 / Party / Rivals",
    content: "TwitchCon是Twitch官方半年度线下活动系列，是品牌深入Twitch社区的最佳线下触点。本指南整合了全部赞助手册内容。\n\n══════════════════════════════════════════\n一、TwitchCon 2025 日程与核心数据\n══════════════════════════════════════════\n\n日程安排：\n· Rotterdam（欧洲站）：2025年5月31日-6月1日\n· San Diego（美国站）：2025年10月17日-19日\n· 投资范围：$75K - $500K+\n\nTwitchCon US 2025 核心数据：\n· 24K 独立访客\n· 54K 总入场人次\n· 258 个品牌展位\n· 51% 主播参与率\n\n社区影响力：\n· 104M+ social media following（仅来自受邀顶级全球主播）\n\n══════════════════════════════════════════\n二、Your TwitchCon Journey（赞助旅程）\n══════════════════════════════════════════\n\nSTEP 1: Choose a sponsorship package（选择赞助套餐）\nSTEP 2: Make your mark at TwitchCon（在TwitchCon留下印记）\n\n购买方式：\n· Sponsorship fee（赞助费）\n· TC Terms Apply：PRE-PAY Program，Non-Cancellable，non-refundable，Media must run in 2026\n\n══════════════════════════════════════════\n三、赞助套餐详情（Legendary vs Mythic）\n══════════════════════════════════════════\n\n【Legendary Package — Presenting Sponsor】\n定位：Official Designation: Presenting Sponsor\nOnsite Activation: Turnkey or custom\nInclusions（Mythic Package基础上额外增加）：\n· Add'l TC Streamer Channel Takeover Pkg (2 total)\n· Branding in Main Theater and Content Panel Rooms\n  - Interstitial Slides + Keynote Callout\n· Logo inclusion on TwitchCon website, Twitch.tv Homepage Headliner, and official TC panel channel pages\n· Individual Lobby & Entrance Branding\n· 1 Swag Bag Slot (sponsor to supply product)\n\n【Mythic Package — Presenting Sponsor】\n定位：Official Designation: Presenting Sponsor\nOnsite Activation: Turnkey or custom\nInclusions：\n· TwitchCon IP Unlock\n· Inclusions on \"Thank You\" signs\n· Twitch marketing & PR support\n· Twitch Streamer Channel Takeover Pkg:\n  - 2x 2-hour Streams\n  - 1x Mid-Tier Streamer\n· Assigned Project Manager with support team(s)\n· Post event reports\n· Sponsor Badge Allotment\n· GA Badges for Social Giveaways\n\n【Legendary Sponsor（独立顶级赞助）】\n费用：Europe $150,000 / North America $250,000\n权益：\n· Presenting Sponsor brand recognition across all show assets\n· Category exclusivity in Presenting Sponsor category\n· Home Page Headliner + TC Channel branding inclusion on Twitch during the show weekend\n· TC Channel Take Over Package, with 2 streams (lead up or post event) & HERO Front Page Promo\n· Sponsor measurement impact report\n· Swag Bag Inclusion (sponsor to provide items)\n\n══════════════════════════════════════════\n四、STEP 2: Make Your Mark — 三大展区分类\n══════════════════════════════════════════\n\n【Arts & Entertainment 文艺娱乐区】\n· Kappa Cabana — 现场娱乐表演舞台\n· Artist Alley — 创作者市集\n· Glitch Stage Showcase — 影视首映剧场\n· Cosplay Showcase — Cosplay展示\n· Drag Showcase — Drag表演\n\n【Gaming & Streaming 游戏直播区】\n· LAN Area — PC LAN竞技\n· Streamer Station — 主播直播站\n· Twitch Rivals — 竞技赛事\n· Arcade — 游戏厅\n· Tabletop — 桌游区\n\n【Twitch Community 社区互动区】\n· Partner Lounge — 合作伙伴VIP休息室\n· Community MeetUps — 社区聚会\n· Custom Booth Sponsor — 自定义展位\n· Friendship Lounge — 友谊休息室\n· Indie Game Showcase — 独立游戏展示\n\n══════════════════════════════════════════\n五、区域赞助详情与费用\n══════════════════════════════════════════\n\n【5.1 Arcade 游戏厅】\n定义：无需投币的复古游戏天堂，提供经典游戏和当地收藏。品牌可融入空间设计，创建互动社区空间。\n赞助权益：\n· 所有Arcade游戏机和区域布置\n· Arcade顶部品牌标识\n· 全套服务：人力/管理/灯光/地毯/电力等\n· Branded Entry Experience + 品牌装饰（展台/照片墙/娃娃机等）\n· Custom Arcade Feature（三选一）：Daily High Score Challenge / Branded giveaways / CLAW machine with prizes\n费用：\n· Europe: Legendary $200,000 / Mythic $150,000\n· North America: Legendary $350,000 / Mythic $200,000\n\n【5.2 Artist Alley 创作者市集】\n定义：TwitchCon最具创意的角落，画家/雕塑家/木雕/数字艺术/蜡烛制作等创作者展示作品。\n赞助权益：\n· Artist Alley区域品牌植入（步入式体验/头顶标识/附加品牌元素）\n· Daily 1 Hour IRL Artist Alley STREAMER FEATURE（主播采访，在Twitch.TV直播）\n· OPTIONAL: Branded Sponsor Counter，或最大20'x20'空间自用\n费用：\n· Europe: Legendary $200,000 / Mythic $150,000\n· North America: Legendary $350,000 / Mythic $200,000\n\n【5.3 Community MeetUp Area 社区聚会区】\n定义：主题桌游/游戏/见面会的专属空间，品牌赞助可将社区凝聚在一起。\n赞助权益：\n· 指定Community Meetup Area（含全部家具和装饰）\n· Branded Digital Photo Booth/Photo Area\n· 1个Specialty meetup as hosting partner（含特色餐饮）\n费用：\n· Europe: Legendary $150,000 / Mythic $100,000\n· North America: Legendary $325,000 / Mythic $175,000\n\n【5.4 Glitch Stage Showcase 影视首映剧场】\n定义：将Glitch剧院改造为品牌专属场地，首映剧集/电影/预告片等独家内容。\n赞助权益：\n· TwitchCon主舞台1小时直播\n· 专业制作团队+舞台+数字标牌\n· 可播放最长30分钟高质量内容（演员/导演Panel/放映等）\n· 前500名观众免费爆米花和饮料\n· 1000份赞助商印刷品或更多赠品\n费用：\n· Europe: Legendary $200,000 / Mythic $150,000\n· North America: Legendary $300,000 / Mythic $150,000\n\n【5.5 Kappa Cabana 现场娱乐舞台】\n定义：现场音乐和表演舞台，DJ/乐队/主播表演。观众可在此hangout/听音乐/参加桌游等活动。\n赞助权益：\n· Kappa Cabana全区联合品牌（入口标识+舞台）\n· 专属品牌休息室\n· Photo activation experience\n· 出现在内容征集和艺术阵容公告中（视排期）\n· 赞助商提供品牌赠品给表演艺术家\n费用：\n· Europe: Legendary $200,000 / Mythic $150,000\n· North America: Legendary $325,000 / Mythic $175,000\n\n【5.6 Partner Lounge 合作伙伴VIP休息室】\n定义：仅限邀请的专属空间，顶级创作者可在此游戏/社交/休息。展会期间提供私密空间/品牌拍照体验/轻食饮料。\n赞助权益：\n· Partner Lounge品牌植入（含Co-Branded Entry Experience）\n· Surprise & Delight Item\n· Branded digital social photo canvas experience\n· 赞助商小型品牌物品进入Partner礼物\n· 可在general attendee Swag Bag (25-30K items) 中投放品牌小物\n· 专属activation space连接Twitch Partners\n费用：\n· Europe: Legendary $175,000 / Mythic $125,000\n· North America: Legendary $350,000 / Mythic $200,000\n\n【5.7 Cosplay Showcase Cosplay展示】\n定义：非竞赛性质的Cosplay社区展示，展现基于游戏/动漫/影视角色的创意服装。\n赞助权益：\n· Cosplay Content Session\n· 品牌名出现在内容标题（如\"CosPlay Show, Presented by X\"）\n· Opportunity for custom content integrations\n· Rotating lower third branding throughout program\n· Min 2x callout from stage host\n· Branded giveaway to first 1000 audience members\n费用：\n· Europe: Legendary $135,000 / Mythic $85,000\n· North America: Legendary $300,000 / Mythic $150,000\n\n【5.8 Drag Showcase Drag表演】\n定义：邀请最猛烈/最华丽的Drag表演者到TwitchCon LIVE。包括对口型/舞蹈/杂耍/脱口秀等多种表演。\n赞助权益（同Cosplay Showcase）：\n· Drag Showcase Content Session\n· 品牌名出现在内容标题\n· Rotating lower third branding\n· Min 2x callout from stage host\n· Branded giveaway to first 1000 audience members\n费用：\n· Europe: Legendary $135,000 / Mythic $85,000\n· North America: Legendary $300,000 / Mythic $150,000\n\n【5.9 Indie Game Showcase 独立游戏展示】\n定义：独立游戏的舞台，赞助品牌成为游戏最有激情的创作者和忠实社区的冠军。\n赞助权益：\n· 30'x40' / 9mx12m Floor area for Indie Stage & Seating\n· Sponsor inclusion within Indie Showcase Stage & Booth areas\n· Stage Production setup\n· Brand Ambassador Staff support\n· XX Exhibitor Badges\n费用：\n· Europe: Legendary TBD / Mythic TBD\n· North America: Legendary $500,000 / Mythic $350,000\n\n【5.10 Friendship Lounge 友谊休息室】\n定义：社区涂色/拼图/编织友谊手环的专属空间，打造温馨社交氛围。\n赞助权益：\n· Friendship Lounge setup（涂色/拼图/手环制作）\n· 品牌植入：入口/房间墙面贴纸或灯光/桌面中心装饰/照片墙\n· (1x) Branded Creative Session（含品牌纪念涂色书或其他活动）\n费用：\n· Europe: Legendary $170,000 / Mythic $120,000\n\n══════════════════════════════════════════\n六、Gaming & Streaming 区域赞助\n══════════════════════════════════════════\n\n【6.1 PC LAN Party】\n定义：品牌可承办一整天的LAN锦标赛和聚会。Twitch提供基础设施，品牌提供选手/主播/人才/奖金/游戏。\n赞助权益：\n· LAN Stage: 1 Day Content takeover at TC LAN + LAN STAGE\n· Turnkey production crew + LAN tournament + 2x hosts for the day\n· Streamed live on Twitch (6-7 hours)\n· Twitch Front Page Promotion on rotation throughout stream\n· LAN Zone: Management of open play LAN area\n· LAN Lounge Space: Dedicated lounge with light food & beverage\n· Sponsor branding integration within LAN area + digital stream overlay\n费用：\n· Europe: Legendary $200,000 / Mythic $150,000\n· North America: Legendary $325,000 / Mythic $175,000\n\n【6.2 PC LAN Presenting】\n定义：与LAN Party类似但增强版，含Twitch LAN频道直播+首页推广+品牌影响报告。\n赞助权益（LAN Party基础上额外增加）：\n· Streamed live on Twitch LAN channel\n· Twitch Front Page Promotion on rotation\n· Hosted Live TwitchCon Morning Show streamed on the Twitch LAN channel\n· Sponsor Brand Impact report\n费用：\n· Europe: Legendary $225,000 / Mythic $175,000\n· North America: Legendary $350,000 / Mythic $200,000\n\n【6.3 PC LAN Hardware】\n定义：用最新最强游戏硬件为TwitchCon LAN提供动力。\n赞助权益：\n· Management of LAN area: All PC Setups (70-90台), Internet, tables, chairs, and stage\n· Onsite Production team协助安装\n· Sponsor inclusion in rotations on TwitchCon LAN stream graphics\n· Use of sponsor's products in the LAN\n· Shared Party wall branding with other sponsors\n费用：\n· Europe: Legendary TBD / Mythic TBD\n· North America: Legendary $300,000 / Mythic $150,000\n\n【6.4 Streamer Station 主播直播站】\n定义：20台PC站点，主播可在TwitchCon现场上线直播与社区互动。周末100+场直播，将TwitchCon魔力带给线上观众。\n赞助权益：\n· Brand inclusion within Streamer Station: overhead signage, PC desktop wallpaper, reusable water bottles, Streamer Lounge Area\n· Streamer Station Area Customisation (choose one only):\n  1. Display area with QR code sweepstakes\n  2. Product display with (2x) Brand Reps\n  3. Additional Floorspace in area for booth or lounge area\n费用：\n· Europe: Legendary $150,000 / Mythic $100,000\n· North America: Legendary $350,000 / Mythic $200,000\n\n【6.5 Streamer Station: Hardware】\n定义：用品牌硬件为主播直播站供电，直接将品牌技术放入内容创作者手中。20台直播站。\n赞助权益：\n· Co-branding on Pony Walls, backdrop for live streams, PC desktop wallpaper & overlays\n· Use of sponsor's products in the Streamer Station Hardware\n· Onsite Production team协助安装\n费用：\n· Europe: Legendary TBD / Mythic TBD\n· North America: Legendary $300,000 / Mythic $150,000\n\n【6.6 Tabletop 桌游区】\n定义：从休闲对局到激烈比赛的终极桌游目的地。桌游/手办/TTRPG，品牌处于活动核心。\n赞助权益：\n· Brand inclusion within Tabletop area（signage, playmats）\n· Stage with Step & Repeat + all services for Feature Tabletop Stream\n· Table Top Production team（管理锦标赛/舞台/产品植入/赠品）\n费用：\n· Europe: Legendary $150,000 / Mythic $100,000\n· North America: Legendary $300,000 / Mythic $150,000\n\n══════════════════════════════════════════\n七、展台方案（Exhibitor）\n══════════════════════════════════════════\n\n【7.1 Custom Booths 自定义展位】\n定义：全定制展位体验，服务14,000+粉丝。从10x20到全定制方案。\n权益：\n· Floor space + full Custom Booth（含所有服务和装饰）\n· Brand Ambassadors to manage booth activities\n· Show badges for booth size\n费用：\n· Europe: Legendary $300K+ / Mythic $200K+\n· North America: Legendary $500K+ / Mythic $175K+\n\n【7.2 Floor Space 展位地面空间】\n定义：Your blank canvas — 在展会地面搭建展位。\n\nExhibitor Perks（参展商福利）：\n· Exhibitor Services Support\n· Exhibitor Kit\n· Exclusive Lounge Access\n· Lead Generation Tools (Opt-in)\n· Logo + Description on Website & Mobile App\n· Content Session at Streamer Workshop Stage (Limited spots)\n· Exhibitor Starter Booth Kit（for all in-line 3mx3m & 3mx6m floor spaces）\n\n🎮 Game Devs: 20% discount on floor space costs!\n\nEurope Floor Space 费用（$350 USD per m²）：\n· 3m x 3m: $3,150\n· 3m x 6m: $6,300\n· 6m x 6m: $12,600\n· 6m x 9m: $18,900\n· 6m x 12m: $25,200\n· 9m x 9m: $28,350\n· 9m x 12m: $37,800\n· 12m x 12m: $50,400\n· 15m x 15m: $78,750\n\nUS Floor Space 费用（$40 USD per ft²）：\n· 10' x 10': $4,000 (5 badges)\n· 10' x 20': $8,000 (7 badges)\n· 20' x 20': $16,000 (20 badges)\n· 20' x 30': $24,000 (25 badges)\n· 20' x 40': $32,000 (25 badges)\n· 30' x 30': $36,000 (30 badges)\n· 30' x 40': $48,000 (35 badges)\n· 40' x 40': $64,000 (40 badges)\n· 50' x 50': $100,000 (50 badges)\n\n══════════════════════════════════════════\n八、TwitchCon Party 官方派对\n══════════════════════════════════════════\n\n定义：The party you don't want to miss! 展会最大活动，人人想参加的派对。含私人品牌休息室。\n赞助权益：\n· Branded entrance moment, stage, and wristbands\n· Branded restaurant activation at the TwitchCon Block Party, with branding throughout\n· Specialty handout for Attendees, Trick or Treat Style\n· Opportunity to provide branded item(s) within general attendee Swag Bag\n费用：\n· North America: Legendary $350,000 / Mythic $200,000\n\n══════════════════════════════════════════\n九、Twitch Rivals & Esports\n══════════════════════════════════════════\n\nTwitch Rivals：\n· 让热门主播在Twitch最热门游戏中头对头竞技\n· 2025年计划超过60场赛事，是#1竞技娱乐目的地\n· 赞助位不适用于游戏品牌；游戏植入按个案处理\n\nEsports Sponsorships：\n· 与Twitch自有电竞团队FLASH合作\n· 可为品牌打造专属电竞锦标赛\n· 在全球电竞之家Twitch上直播\n\n══════════════════════════════════════════\n十、TwitchCon 核心结论\n══════════════════════════════════════════\n\n· TwitchCon's impact extends well beyond the event — it continues online through the community's social conversations + digital campaigns\n· TwitchCon attendees are a leaned in audience — expo floor dwell time is much longer than other gaming conventions\n· TwitchCon drives meaningful brand impact for sponsors, driving full funnel lift and outperform Twitch online advertising norms\n\n🎯 TwitchCon awaits. It's your move. This is your chance to level up, IRL.\n\n══════════════════════════════════════════\n📋 区域赞助费用速查表\n══════════════════════════════════════════\n\n| 区域 | EU Legendary | EU Mythic | NA Legendary | NA Mythic |\n|---|---|---|---|---|\n| Arcade | $200K | $150K | $350K | $200K |\n| Artist Alley | $200K | $150K | $350K | $200K |\n| Community MeetUp | $150K | $100K | $325K | $175K |\n| Glitch Stage | $200K | $150K | $300K | $150K |\n| Kappa Cabana | $200K | $150K | $325K | $175K |\n| Partner Lounge | $175K | $125K | $350K | $200K |\n| Cosplay Showcase | $135K | $85K | $300K | $150K |\n| Drag Showcase | $135K | $85K | $300K | $150K |\n| Indie Game | TBD | TBD | $500K | $350K |\n| Friendship Lounge | $170K | $120K | — | — |\n| PC LAN Party | $200K | $150K | $325K | $175K |\n| PC LAN Presenting | $225K | $175K | $350K | $200K |\n| PC LAN Hardware | TBD | TBD | $300K | $150K |\n| Streamer Station | $150K | $100K | $350K | $200K |\n| Streamer Hardware | TBD | TBD | $300K | $150K |\n| Tabletop | $150K | $100K | $300K | $150K |\n| TwitchCon Party | — | — | $350K | $200K |\n| Legendary Sponsor | $150K | — | $250K | — |",
    platform: "Twitch", category: "推广", source_type: "internal",
    update_time: "2026-03-23T15:08:00.000Z", url: "",
    channel: "TwitchCon官方赞助手册"
  },
  {
    _id: "s015", title: "Twitch 采买广告完整指南：平台数据 / 广告产品 / BPS / Signal / Campaign模型 / 创意方案 / 案例",
    content: "基于 Amazon Ads × Twitch Brand Partnership Studio (Jun 2025) 完整PPT资料（15页截图）整理。\n\n══════════════════════════════════════════\n第一章  Twitch 平台核心数据\n══════════════════════════════════════════\n\n· 全球直播娱乐领导者（Global leader in LIVE Entertainment）\n· 月活主播：5M（500万）\n· 月活观众：105M（1.05亿）\n· 2024年内容总观看时长：20B小时（200亿小时）\n· Gen Z 核心阵地（The home of Gen Z），用户停留时长为主流社交平台平均值的10倍\n· A18-34人群覆盖率比主流社媒平台高40%\n· 64%用户认为观看视频广告/赞助有益，因为支持了免费内容创作者\n· 69%用户认同Twitch提供了强烈的社区归属感\n· 定位：We are Live Multiplayer Entertainment，数千个活跃社区\n\n2024热门品类：\n· THE WORLD: Grand Theft Auto V — 1.4B hours watched\n· NORTH AMERICA: Just Chatting — 843.3M hours watched\n· ASIAN PACIFIC: Valorant — 265M hours watched\n· EUROPE/MIDDLE EAST/AFRICA: Special Events — 3.8M peak viewers\n· LATIN AMERICA: Sports — 48.7M hours watched\n\n══════════════════════════════════════════\n第二章  四大广告产品体系\n══════════════════════════════════════════\n\n一、High Impact（高影响力广告）\n定位：Give your brand a strong first impression on Twitch\n\n1. Homepage Headliners（首页头图广告）\n  · Desktop Headliner：Premium cross screen high impact ad unit，展示在Twitch桌面端首页及移动端默认首页\n  · Clickable，按天购买（per-day basis），以套餐形式售卖\n  · Mobile Headliner：移动端首页顶部位置，配套售卖\n\n2. First Impression Video Takeover (FITO)\n  · 用户当天首次Twitch直播时看到的第一条广告\n  · 按天+按地区售卖（per day per geo basis），按日费率定价\n\n───────────────────────────────────\n\n二、Premium Video & Display\n定位：Build awareness and reinforce your brand messaging\n\n1. Premium Video（6-60s）\n  · 嵌入Twitch直播中，覆盖desktop/mobile/tablet/console/streaming TV\n  · 6-60秒，不可跳过（unskippable），pre-roll和mid-roll两种形式\n  · 可点击跳转（主机和流媒体设备除外）\n\n2. Stream Display Ads\n  · 多种展示格式围绕视频内容展示，不打断视频流\n  · 与Desktop Headliner按天捆绑售卖\n\n3. Twitch Display\n  · Super Leaderboard：分类页面（category page）\n  · MREC：浏览页面（browse page）\n\n4. Mobile Mid-Feed Display Ads\n  · 全屏1080x1920展示广告，在Twitch移动App发现信息流中投放\n  · 首次发现会话为前贴片，后续每第8个信息流项目插入\n\n5. Premium Video - Mobile Mid-Feed Video [BETA]\n  · 全新premium native video格式，全屏视频体验\n  · 适配竖版social video或横版Twitch premium video creative\n\n───────────────────────────────────\n\n三、Creator Sponsorships\n定位：Generate conversation and support the streamer economy\n\n1. Homepage Carousel — 首页轮播推广\n2. Streamables — 全屏opt-in广告体验\n3. Channel Takeovers — 频道深度接管\n4. Bounty Board — 创作者悬赏市场\n5. CSPON — 创作者匹配工具\n6. Our own Fortnite Island!\n\n───────────────────────────────────\n\n四、Events & Promotions\n定位：Become an authentic part of the Twitch community\n\n1. TwitchCon US & EU\n2. Sponsorships\n3. Esports Sponsorships\n4. Your own custom Fortnite Map\n\n══════════════════════════════════════════\n第三章  Brand Partnership Studio (BPS)\n══════════════════════════════════════════\n\n核心定位：Ascend from reach — drive LIVE engagement and create brand love\n\n一、BPS 四大功能模块（What we're made of — 4 functions, 1 pizza）\n1. CREATIVE — The secret sauce：概念构思与内容策略\n2. ACTIVATION — The cheese：内容交付与利益相关者管理，bringing it all together\n3. PRODUCTIONS — The dough：内容创作的基础\n4. INFLUENCER MANAGERS — The toppings：精准匹配主播资源\n\n二、Custom LIVE Content 增值服务（ADDED VALUE）\n· 定制全球表情（Custom global emote）\n· 首页游戏展示（Front page shelf featuring gameplay）\n· 针对性主播通知（Targeted notifications for gamers）\n\n三、BPS 中国游戏出海经验\nBPS has helped countless titles scale global launches through custom, live, streamer led programs\n合作过的中国游戏：绝区零(Zenless)、使命召唤(CoD Black Ops)、原神(Genshin)、Nightreign、FarCry6、黑神话悟空(Wukong)、Delta Force、后裔(The First Descendant)、PUBG、暗区突围(Warzone)、暗黑4(Diablo)、派对动物(Party Animals)、NIKKE、鸣潮(Naraka)、永劫无间等\n\n══════════════════════════════════════════\n第四章  Twitch Signal + 社区增长飞轮\n══════════════════════════════════════════\n\n一、Measurement - Signal\nSignal是Twitch第一方游戏健康度评估工具，基于三个关键类别评估：\n1. Awareness（认知度）— Use media products like our cost efficient high performing video ads to drive measurable and effective awareness of your game\n2. Creator Validation（创作者验证）— Creators on Twitch are the celebrities of our generation. Having many creators visible playing your game is the ultimate stamp of approval\n3. Viewer Engagement（观众参与）— Once awareness is established and creators have given their stamp of approval we turn our attention to retention and viewer engagement\n\n徽章等级：Ultraviolet(最高) → Gold → Silver → Bronze\n通过Privacy Sandbox workspace in Mode访问报告\n\n二、社区驱动有机增长飞轮\nBuilding a live community fuels audience growth, driving organic game discovery and sustainable player acquisition\n💰 付费（Paid or unlocked via ad spend）：Bounty Board → Media(video ads) → Homepage Promotion\n🆓 免费（Organic / free to use）：Signal Insights、Twitch Drops、Game Key Distribution、Twitch Extension、Data Dashboard\n\n三、Homepage Carousel效果数据\n· Homepage Carousel has the power to up to double viewers for your game\n· Breaking Silos: Twitch Headliner + Carousel Strategy Elevates Twitch Game Trend & Steam Player Simultaneously\n· 数据证明：Average Viewers on Twitch与Number of concurrent players on Steam呈同步上涨\n\n══════════════════════════════════════════\n第五章  三大Campaign模型\n══════════════════════════════════════════\n\nGame campaigns on Twitch broadly falls into one of three categories:\n\n一、Premium Title Launch（高端大作发布）\nMODEL CAMPAIGN PLAN — 1 MONTH CAMPAIGN — US\n· 预算：2.5MM USD in net media spend\n· 媒体：80M ad impressions with video and high impact ads\n· 创作者：20 Creators in channel takeover program\n· 增值服务：Custom LIVE content — turn your game launch into a major moment on Twitch\n· 预算拆分：2M USD / 80% of spend（媒体）+ 500K USD / 20% of spend（创作者）\n· 目标：Drive early awareness and creator validation to drive up the launch spike\n\n二、Live Service Title Launch（服务型游戏首发）\nMODEL CAMPAIGN PLAN — 2 MONTH CAMPAIGN — US\n· 预算：2MM USD in net media spend\n· 媒体：40M in video and high impact ad impressions\n· 创作者：36 Creators in channel takeover program\n· Bounty：~800K mins of gameplay via Bounty Board\n· 预算拆分：1M(50%) 媒体 + 800K(40%) 创作者 + 200K(10%) Bounty\n· 目标：Take care of baseline awareness but focus on creator validation and viewer engagement to drive trial and stickiness at launch\n\n三、Live Service Title Update（版本更新）\nMODEL CAMPAIGN PLAN — 2 MONTH CAMPAIGN — US\n· 预算：1MM USD in net media spend\n· 媒体：16M in video and high impact ad impressions\n· 创作者：24 Creators in channel takeover program\n· 预算拆分：500K USD(50%) 媒体 + 500K USD(50%) 创作者\n· 目标：Continue driving creator validation and incentivize lapsed viewer engagement\n\n新游戏发布标准时间线（Case Sharing — New Launch Game）：\n· 3 month before Launch：Create Twitch Developer Account / Submit Game Metadata via IGDB / Secure Early-Access Streamer Partnerships / Develop Custom Drops Campaign / Prepare Bounty Board Campaign Brief\n· Launch Date / Major Updates：Premier Streams with Top-Tier Creators / Activate Twitch Drops Campaign / Launch Bounty Board Challenges + Media: Headliner & FITO / Homepage Carousel / Bounty Board / Premium Video - Game play\n· Ongoing：Work with BPS Content / Sustained Streamer Amplification Program / Monthly Bounty Board update / Brand Partnership Studio / Drops campaign optimization + Media: Headliner & FITO / Homepage Carousel / Bounty Board / Premium Video\n\n══════════════════════════════════════════\n第六章  BPS 创意推广方案\n══════════════════════════════════════════\n\n一、LIVE Preview Party（直播预览派对）— BPS IDEA for Premium Title Launch\n· 游戏发售前组织主播预览直播\n· 抓住玩家购买决策关键时间窗口：The days before a new title releases is when gamers are closest to the point of purchase\n· 在Twitch首页组织预览派对，让主播们带领社区体验游戏的最初几小时\n\n二、The Custom Extension（自定义扩展）— BPS IDEA for Live Service Title Launch\n· BPS为游戏构建自定义Twitch扩展，让主播在直播时与观众互动\n· Potential features：Connect to game API for deeper experience / Custom monthly quizzes and contests / Newsfeed to showcase update information / Exclusive mini-games to drive engagement with IP\n\n三、Streamer Pass（主播通行证）— BPS IDEA for Live Service Title Update\n· 灵感来自Battle Pass，为主播创建自定义奖励追踪系统\n· 阶梯奖励：5 Hours → 10 Hours → 15 Hours → 20 Hours → 25 Hours\n· 主播可为其社区提供游戏内奖励，直播越多奖励越多\n\n══════════════════════════════════════════\n第七章  BPS 跨界合作案例 + 三大要点\n══════════════════════════════════════════\n\nBroaden your game's audience and reach out to new communities:\n\n一、跨界创意合作案例\n\n1. 🍳 World of Warcraft Cook Off（Activision Blizzard）\n  · 为WoW最新资料片设计烹饪秀，展示游戏20年美食文化\n\n2. 🎨 The First Descendant Sculpting Stream（Nexon）\n  · 与主播合作将游戏角色现场雕塑，触达手工/艺术类社区\n\n3. 🎵 The Genshin Impact Live Lounge（HoYoverse）\n  · 原神2周年互动音乐频道，观众投票选歌+多位音乐主播\n\n4. 🎮 Black Myth Wukong Spotlight（Game Science）\n  · Twitch社区高度活跃，\"Fashion Myth: Wukong\" 成为热门话题\n\n二、3 main takeaways — In case you forget everything else...\n1. 🎮 Build your brand — Western audiences prefer it when they see a game deliver community good and build hype around exciting executions\n2. 👥 Serve the community — Community determines what our streamers want to play – and winning the community kicks off a positive cycle of feedback for your game\n3. 📅 Brief us early — The brand partnership studio and Twitch work best when we have time to plan and build together. Work with us early so we can deliver an amazing campaign\n\n══════════════════════════════════════════\n📋 广告产品速查表\n══════════════════════════════════════════\n\n| 大类 | 产品 | 定位 | 售卖方式 |\n|---|---|---|---|\n| High Impact | Desktop/Mobile Headliner | 首页头图强曝光 | 按天套餐 |\n| High Impact | FITO | 用户首条广告 | 按天按地区 |\n| Premium Video | Premium Video 6-60s | 直播中视频广告 | 不可跳过 |\n| Premium Video | Stream Display Ads | 直播周围展示 | 按天捆绑 |\n| Premium Video | Twitch Display | 分类/浏览页 | Leaderboard/MREC |\n| Premium Video | Mobile Mid-Feed | 移动信息流 | 每8个item插入 |\n| Creator | Homepage Carousel | 首页轮播 | BPS标配 |\n| Creator | Bounty Board | 创作者悬赏 | CPV $0.5起 |\n| Creator | Channel Takeovers | 频道深度接管 | 固定费率 |\n| Creator | CSPON | 创作者匹配 | Amazon DSP |\n| Creator | Streamables | 全屏广告体验 | 用户主动观看 |\n| Events | TwitchCon | 线下展会 | $75K-$500K+ |\n| Events | Twitch Rivals | 竞技赛事 | 需沟通 |\n| Events | Esports (Flash) | 电竞锦标赛 | 定制方案 |\n| BPS创意 | LIVE Preview Party | 首发预览直播 | 定制方案 |\n| BPS创意 | Custom Extension | 自定义扩展 | 定制方案 |\n| BPS创意 | Streamer Pass | 主播通行证 | 定制方案 |\n\n| Campaign类型 | 预算 | 周期 | 主播规模 | 核心策略 |\n|---|---|---|---|---|\n| Premium Title Launch | 2.5MM USD | 1个月 | 20 Creators | 大规模曝光驱动首发 |\n| Live Service Launch | 2MM USD | 2个月 | 36 Creators + Bounty | 社区建设+创作者验证 |\n| Live Service Update | 1MM USD | 2个月 | 24 Creators | 召回流失+重新参与 |",
    platform: "Twitch", category: "推广", source_type: "internal",
    update_time: "2026-03-23T14:20:00.000Z", url: "",
    channel: "Amazon Ads × Twitch BPS"
  },
  {
    _id: "s010", title: "TikTok运营增长策略：从0到100万粉丝路径",
    content: "TikTok频道从零到百万粉丝的系统性增长策略：\n\n1. 内容定位：选择垂直领域，保持风格一致。\n2. 发布节奏：每日1-3条，黄金时段（当地时间18:00-22:00）。\n3. 热门标签：结合时下热门话题和挑战。\n4. 互动策略：积极回复评论，与粉丝互动。\n5. 直播带货：利用TikTok Shop实现商业化。",
    platform: "TikTok", category: "运营", source_type: "public",
    update_time: "2026-03-09T15:00:00.000Z", url: ""
  },
  {
    _id: "s011", title: "Reddit API 技术集成与舆情监控方案",
    content: "利用Reddit API实现品牌舆情自动化监控：\n\n1. OAuth2 认证接入。\n2. Subreddit监控：关键词追踪、情感分析。\n3. 自动化报告：每日舆情报告推送。\n4. 预警机制：负面内容实时告警。",
    platform: "Reddit", category: "技术", source_type: "public",
    update_time: "2026-03-08T10:00:00.000Z", url: ""
  },
  {
    _id: "s016", title: "TikTok 采买广告完整指南：平台数据 / 六大广告产品 / Spark Ads / Pulse / Shopping Ads / 创意工具 / 投放策略",
    content: "基于 TikTok for Business 官方广告产品体系及行业研究整理，涵盖 TikTok 全部广告形式、投放策略与最佳实践。\n\n══════════════════════════════════════════\n第一章  TikTok 平台核心数据\n══════════════════════════════════════════\n\n· 全球短视频社交平台领导者\n· 全球月活用户：超过15亿（MAU 1.5B+）\n· 2024年全球下载量突破20亿次\n· 覆盖全球150+国家和地区\n· 核心用户画像：18-34岁占比超60%，Gen Z + 千禧一代为主力\n· 用户日均使用时长：约95分钟（远超其他社交平台）\n· 用户每天打开App频次：平均19次\n· 92%的用户在观看TikTok后会采取行动（点赞/分享/搜索/购买）\n· TikTok Shop 2024年GMV快速增长，黑五单日GMV创历史新高\n· 广告触达率：全球互联网用户中约32%可被TikTok广告触达\n\n全球热门品类：\n· 🎮 游戏：手游推广+游戏直播+游戏创作者生态\n· 🛍️ 电商：TikTok Shop + 跨境电商 + 直播带货\n· 💄 美妆：产品测评 + 教程 + 挑战赛\n· 🎵 娱乐：音乐推广 + 影视宣发 + 综艺互动\n· 📱 消费电子：产品开箱 + 技术展示 + 对比评测\n\n══════════════════════════════════════════\n第二章  六大核心广告产品\n══════════════════════════════════════════\n\n一、TopView（超级首位广告）\n定位：打开App第一眼的黄金曝光位\n\n· 用户打开TikTok时出现的第一条全屏视频广告\n· 支持5-60秒视频，全屏有声沉浸式体验\n· 每天仅一个广告主独占该位置\n· 支持用户点赞、评论、分享互动\n· 可添加CTA按钮引导至落地页/App下载/TikTok主页\n· 适用场景：新品发布、重大活动推广、品牌大事件\n· 效果数据：品牌认知度提升率高达67%（CPG品类）\n· 购买方式：合约购买（Reservation），按天/CPM\n\n───────────────────────────────────\n\n二、Brand Takeover（开屏广告）\n定位：用户打开App时的第一视觉冲击\n\n· 全屏展示3-5秒静态图片或短视频\n· 不可跳过，确保100%曝光率\n· 每天每个市场仅接一个广告主\n· 支持内部落地页（如挑战赛页面）和外部链接跳转\n· 适用场景：品牌大曝光、节日营销、产品首发\n· 优势：独占性强、曝光率极高、视觉冲击力大\n· 购买方式：合约购买，按天包断（CPT）\n\n───────────────────────────────────\n\n三、In-Feed Ads（信息流广告）\n定位：无缝融入For You推荐流的原生广告\n\n· 出现在用户\"For You\"推荐页中，与普通视频无缝衔接\n· 最长60秒（最佳时长9-15秒），全屏自动播放有声\n· 支持点赞、评论、分享、关注等完整互动\n· 可设置多种CTA按钮：立即购买/了解更多/下载App/访问主页\n· 两种购买模式：\n  a) 合约广告（Brand Premium）：保量投放，适合品牌曝光\n  b) 竞价广告（Auction）：通过TikTok Ads Manager自助投放\n· 竞价模式支持多种出价：CPM/oCPM/CPC/CPV\n· 最低预算门槛：Campaign $50/天，Ad Group $20/天\n· 适用场景：日常推广、电商转化、App下载、线索收集\n\n信息流广告子类型：\n· Brand Premium：优质流量位，保量投放\n· Reach & Frequency（R&F）：可预测的触达和频次控制\n· Auction Ads：竞价投放，灵活预算控制\n\n───────────────────────────────────\n\n四、Branded Hashtag Challenge（品牌标签挑战赛）\n定位：激发UGC创作的病毒式传播利器\n\n· 品牌发起专属话题标签挑战，鼓励用户参与创作\n· 用户创建相关内容后带上品牌标签发布\n· 所有参与视频汇聚在专属挑战页面\n· 可搭配官方音乐、贴纸、特效提升参与度\n· 挑战赛页面包含：品牌Banner + 参赛规则 + 精选视频 + 参与按钮\n· 典型周期：3-6天，可延长至30天\n· 效果数据：平均互动率8.5%，远超传统广告\n· 经典案例：奔驰#MBStarChallenge、Guess#InMyDenim\n· 购买方式：合约购买，按套餐定价\n· 参考价格：$150K-$300K+（视市场和规模而定）\n\n挑战赛升级选项：\n· Hashtag Challenge Plus：挑战赛+电商购物入口\n· Branded Mission：众包征集创作者内容，品牌可挑选优质视频加大投放\n\n───────────────────────────────────\n\n五、Branded Effects（品牌专属特效广告）\n定位：以AR/贴纸互动提升品牌记忆度\n\n· 品牌定制专属AR滤镜、贴纸、特效\n· 用户在拍摄视频时使用品牌特效，自然融入内容\n· 支持2D/3D/AR等多种技术形式\n· 可独立投放或与挑战赛组合使用（效果更佳）\n· 特效展示在拍摄页面的\"热门\"标签中\n· 最长存续期：30天\n· 适用场景：品牌互动、新品体验、节日营销\n· 购买方式：合约购买\n\n───────────────────────────────────\n\n六、Spark Ads（原生加热广告）\n定位：将优质原生内容转化为高效广告\n\n· TikTok独创的原生广告形式，2021年全球上线\n· 品牌可将自己或创作者已发布的原生视频直接加热推广\n· 保留原视频的点赞、评论、分享数据（社交证明）\n· 支持In-Feed和TopView两种投放位\n· 两种授权模式：\n  a) 推广品牌自有账号视频\n  b) 获取创作者授权码推广其视频\n· 优势：更高可信度、更高互动率、更自然的用户体验\n· 数据表现：比普通In-Feed广告CTR高出142%，CVR高出43%\n· 适用场景：KOL营销内容加热、用户好评加热、品牌原生内容推广\n· 购买方式：竞价购买或R&F投放\n\n══════════════════════════════════════════\n第三章  高级广告产品\n══════════════════════════════════════════\n\n一、TikTok Pulse（脉冲广告）\n定位：与平台Top 4%热门内容并列展示\n\n· 2022年推出，品牌广告出现在前4%热门视频内容之后\n· 12个类别可选：美妆、时尚、游戏、烹饪、运动等\n· 品牌安全：专有广告内容筛选功能，确保广告与合规内容并列\n· 创作者分成：拥有10万+粉丝的创作者获得50%广告收入\n· 适用场景：希望与优质内容关联的品牌安全型投放\n· 购买方式：合约购买\n\n二、TikTok Shopping Ads（购物广告套件）\n定位：全链路电商转化的一站式解决方案\n\n1. Video Shopping Ads（视频购物广告）\n  · 在For You页面展示带商品卡片的视频广告\n  · 用户可直接点击商品卡片进入购买页面\n  · 基于用户兴趣的个性化商品推荐\n  · 支持TikTok Shop和外部电商链接\n\n2. Catalog Listing Ads（产品目录广告）\n  · 无需制作视频，直接从产品目录提取图片投放\n  · 展示在For You页面及搜索结果中\n  · 全自动化动态展示，智能匹配高购买意愿用户\n  · 支持重定向：对浏览/加购用户再次投放\n\n3. Live Shopping Ads（直播购物广告 / LSA）\n  · 专为直播带货设计的引流广告\n  · 广告卡片引导用户从For You页面进入直播间\n  · 精准推送给具有相关购物意向的用户\n  · 提升直播间流量和实时转化\n\n三、Branded Mission（品牌任务众包）\n定位：行业首创的众包式创作者营销\n\n· 品牌发布创意Brief，向创作者征集内容\n· 创作者自主报名创作，品牌挑选最佳内容\n· 被选中的视频可作为Spark Ads加大投放\n· 创作者获得现金奖励+流量扶持\n· 适用场景：快速获取大量优质UGC内容\n\n四、Interactive Add-Ons（互动附加组件）\n定位：提升广告互动率的创意工具\n\n· Pop-out Showcase：商品弹出展示\n· Countdown Sticker：倒计时贴纸（适合限时活动）\n· Gesture Ads：手势互动广告\n· Super Like：超级点赞特效\n· Gamified Trigger：游戏化触发器\n· 可叠加在任何In-Feed广告上使用\n\n══════════════════════════════════════════\n第四章  TikTok Ads Manager 投放体系\n══════════════════════════════════════════\n\n一、账户结构（三层架构）\n· Campaign（广告系列）→ Ad Group（广告组）→ Ad（广告）\n· 每层可设置不同的目标、预算、定向和创意\n\n二、广告目标类型\n1. 品牌认知（Awareness）：触达（Reach）\n2. 购买意向（Consideration）：流量（Traffic）、视频观看（Video Views）、社区互动（Community Interaction）\n3. 转化（Conversion）：网站转化、App安装、线索收集、商品销售\n\n三、定向能力\n· 人口统计：年龄/性别/地区/语言\n· 兴趣定向：基于用户行为标签的兴趣分类\n· 行为定向：视频互动/创作者互动/标签互动\n· 自定义受众：网站访客/App用户/客户名单/互动用户\n· 相似受众（Lookalike）：基于种子用户扩展\n· 自动定向：TikTok算法智能匹配\n\n四、出价与计费模式\n· CPM（千次展示成本）：适合品牌曝光\n· oCPM（优化千次展示）：系统自动优化转化\n· CPC（点击成本）：适合引流\n· CPV（观看成本）：6秒/2秒有效观看计费\n· CPA（行动成本）：按转化计费\n\n参考CPM范围：\n· 美国市场：$10-$15\n· 欧洲市场：$8-$12\n· 东南亚市场：$3-$6\n· 全球平均：$6-$10\n（实际价格因行业、竞争和定向而异）\n\n══════════════════════════════════════════\n第五章  创意工具与最佳实践\n══════════════════════════════════════════\n\n一、官方创意工具\n1. TikTok Creative Center（创意中心）\n  · 浏览热门广告素材和趋势\n  · 竞品广告分析\n  · 创意灵感和模板\n\n2. Video Creation Kit（视频创建工具包）\n  · 图片转视频模板\n  · 无需专业编辑技能\n  · 多种行业模板可选\n\n3. Automated Creative Optimization（ACO）\n  · 自动组合素材、文案、CTA\n  · 系统测试最优创意组合\n  · 提升创意迭代效率\n\n4. TikTok Creative Exchange（TTCX）\n  · 连接品牌与专业创意服务商\n  · 端到端的创意制作流程\n  · 适合缺乏创意团队的品牌\n\n二、创意最佳实践\n· 前3秒法则：开头3秒必须抓住注意力\n· 竖版优先：9:16竖版全屏视频为标准\n· 原生风格：广告应像普通TikTok视频而非传统广告\n· 最佳时长：9-15秒（In-Feed）/ 21-34秒（品牌内容）\n· 音乐/音效：有声视频完播率高出33%\n· 文字叠加：关键信息以文字形式在视频中展示\n· CTA明确：每条广告应有清晰的行动引导\n· 趋势借力：结合当下热门音乐、挑战、特效\n· 高频迭代：建议每1-2周更新创意素材\n\n══════════════════════════════════════════\n第六章  游戏行业投放策略\n══════════════════════════════════════════\n\n一、游戏推广全周期方案（TikTok for Business GAMEON）\n\n1. 预注册期（Pre-registration）\n  · 目标：积累预约用户，建立社区期待\n  · 产品组合：TopView + In-Feed + Branded Hashtag Challenge\n  · 创意方向：预告片/角色展示/玩法揭秘\n\n2. 首发期（Launch）\n  · 目标：最大化下载量和首日DAU\n  · 产品组合：Brand Takeover + TopView + Spark Ads + In-Feed（大预算竞价）\n  · 创意方向：实机演示/KOL体验/玩家反应\n  · 关键动作：联合头部游戏创作者首发体验直播\n\n3. 运营期（Live Ops）\n  · 目标：用户留存和付费转化\n  · 产品组合：In-Feed竞价 + Spark Ads + Shopping Ads（游戏内购引导）\n  · 创意方向：版本更新/活动预告/社区UGC\n  · 关键动作：定期挑战赛保持社区活跃度\n\n4. 版本更新期（Major Update）\n  · 目标：召回流失用户+吸引新用户\n  · 产品组合：TopView + In-Feed + Branded Effects\n  · 创意方向：新内容展示/社区讨论/KOL回归体验\n\n二、游戏广告预算参考\n· 小型独立游戏首发：$10K-$50K\n· 中型游戏全球推广：$100K-$500K\n· 3A大作全球发行：$500K-$2M+\n· 持续运营月度预算：$20K-$100K/月\n\n══════════════════════════════════════════\n第七章  效果衡量与数据工具\n══════════════════════════════════════════\n\n一、TikTok Ads Manager 报告\n· 实时数据看板：展示/点击/转化/花费\n· 受众分析：人群画像/兴趣分布/地域分布\n· 创意分析：各素材表现对比\n\n二、归因与转化追踪\n· TikTok Pixel：网站转化事件追踪\n· Events API：服务端事件追踪（更精准）\n· App归因：与AppsFlyer/Adjust/Branch等MMP集成\n· View-through Attribution：展示归因窗口支持1/7天\n· Click-through Attribution：点击归因窗口支持7/14/28天\n\n三、品牌提升研究（Brand Lift Study）\n· 测量广告对品牌认知/好感度/购买意愿的提升\n· A/B对照组实验设计\n· 最低预算门槛：$50K+\n\n四、第三方验证\n· 支持Nielsen/Kantar/Oracle Moat等第三方验证\n· 可验证：可见性/品牌安全/无效流量/触达频次\n\n══════════════════════════════════════════\n📋 广告产品速查表\n══════════════════════════════════════════\n\n| 产品 | 类型 | 时长/格式 | 购买方式 | 参考价格 |\n|---|---|---|---|---|\n| TopView | 品牌广告 | 5-60秒视频 | 合约CPT/CPM | $50K-$150K/天 |\n| Brand Takeover | 品牌广告 | 3-5秒图/视频 | 合约CPT | $50K-$100K/天 |\n| In-Feed (合约) | 品牌广告 | ≤60秒视频 | 合约R&F | CPM $8-$15 |\n| In-Feed (竞价) | 效果广告 | ≤60秒视频 | 竞价 | CPM $6-$10 |\n| Branded Hashtag | 互动广告 | 3-6天 | 合约套餐 | $150K-$300K+ |\n| Branded Effects | 互动广告 | 30天 | 合约 | $80K-$120K |\n| Spark Ads | 原生广告 | 原视频时长 | 竞价/R&F | 同In-Feed |\n| TikTok Pulse | 高级广告 | 随内容 | 合约 | Premium定价 |\n| Video Shopping | 电商广告 | ≤60秒+商品卡 | 竞价 | CPA/ROAS |\n| Catalog Listing | 电商广告 | 商品图片 | 竞价 | CPA/ROAS |\n| Live Shopping | 电商广告 | 直播引流 | 竞价 | CPA |\n| Branded Mission | 众包广告 | 创作者内容 | 合约 | $50K+ |\n\n| 投放目标 | 推荐产品组合 | 预算量级 | 核心KPI |\n|---|---|---|---|\n| 品牌大曝光 | TopView + Brand Takeover + Hashtag | $200K-$500K | 触达/CPM/认知提升 |\n| 日常品牌建设 | In-Feed R&F + Spark Ads | $50K-$200K/月 | 触达/互动率/视频完播 |\n| App推广下载 | In-Feed竞价 + Spark Ads | $20K-$100K/月 | CPI/安装量/ROI |\n| 电商转化 | Shopping Ads + Spark Ads + Live | $10K-$50K/月 | ROAS/CPA/GMV |\n| 游戏首发 | TopView + In-Feed + 挑战赛 | $100K-$2M | 下载量/CPI/DAU |",
    platform: "TikTok", category: "推广", source_type: "internal",
    update_time: "2026-03-24T11:35:00.000Z", url: "https://bytedance.larkoffice.com/wiki/WZquwNi0GilsH7kqSyrcCwjzneh",
    channel: "TikTok for Business 官方资料"
  },
];

// 操作日志
const RECENT_LOGS = [
  { type: 'batch', title: '整理TikTok采买广告完整指南', desc: '[TikTok] s016 基于TikTok for Business官方资料整理：平台核心数据/六大广告产品(TopView/Brand Takeover/In-Feed/Hashtag Challenge/Branded Effects/Spark Ads)/高级产品(Pulse/Shopping Ads/Branded Mission)/Ads Manager投放体系/创意工具/游戏行业投放策略/效果衡量', time: '2026-03-24 11:35:00' },
  { type: 'batch', title: '整合TwitchCon完整赞助指南', desc: '[Twitch] s014扩展为完整TwitchCon赞助手册：10大章节涵盖赞助旅程/Legendary&Mythic套餐/三大展区/17个区域赞助方案/展台费用/Party/Rivals', time: '2026-03-23 15:08:00' },
  { type: 'batch', title: '拆分恢复Twitch采买广告策略结构', desc: '[Twitch] 恢复12:07 PDF的3条独立策略(CSPON&Bounty / Creator Sponsorships / TwitchCon 2025)，15张截图内容整合为1篇完整采买广告指南，共4条策略', time: '2026-03-23 14:39:00' },
  { type: 'batch', title: '批量导入Twitch策略（PDF文档）', desc: '[Twitch] 基于3份内部PDF文档整理了3条独立策略：s012 CSPON&Bounty推广工具 / s013 Creator Sponsorships合作方案 / s014 TwitchCon 2025展会数据', time: '2026-03-23 12:07:00' },
  { type: 'batch', title: '整理Twitch采买广告（15张截图）', desc: '[Twitch] 推广资源-采买广告：s015 完整指南，涵盖平台数据/四大广告产品/BPS品牌合作/Signal工具/三大Campaign模型/BPS创意方案/跨界案例', time: '2026-03-23 13:41:00' },
  { type: 'delete', title: '删除内部项目数据', desc: '[YouTube] 策略ID: 1, 频道: Creator Studio', time: '2026-03-16 18:01:26' },
  { type: 'delete', title: '删除内部项目数据', desc: '[YouTube] 策略ID: 1, 频道: ALL', time: '2026-03-16 17:55:19' },
  { type: 'batch', title: '批量更新策略', desc: '[YouTube] 基于8个内部项目报告更新了1个策略分类', time: '2026-03-16 17:55:15' },
  { type: 'delete', title: '删除内部项目数据', desc: '[YouTube] 策略ID: 1, 频道: ALL', time: '2026-03-16 17:55:10' },
];

// ========== 已上传的内部项目文档 ==========
const UPLOADED_DOCS = [
  {
    _id: 'doc_001', title: '【内部】竞品A签约TikTok头部达人情报',
    content: "据内部渠道获悉，竞品A近期正在大规模接触TikTok头部达人（粉丝量500K+），计划在Q2发起集中推广攻势。\n\n关键情报：\n1. 预算规模：预计投入$500K-$800K用于达人合作。\n2. 合作模式：固定费用+销售佣金（15%-20%）的混合模式。\n3. 目标品类：聚焦消费电子和智能家居两个垂直领域。\n4. 时间节点：预计4月中旬开始集中投放，持续至6月底。\n\n建议应对措施：\n- 加速我方达人签约进度，锁定核心KOL资源\n- 考虑差异化策略，转向中腰部达人矩阵打法\n- 密切关注竞品投放数据和效果反馈",
    platform: 'TikTok', docType: 'competitive_intel', source: 'ai_parse',
    fileType: 'text', fileSize: '1.8KB',
    upload_time: '2026-03-16T09:00:00.000Z'
  },
  {
    _id: 'doc_002', title: '【内部】Discord社区反馈：用户强烈要求增加中文支持',
    content: "从我方Discord社区近两周的反馈汇总来看，中文用户群体的需求日益强烈：\n\n核心反馈：\n1. 超过40%的活跃用户来自中文地区（中国大陆、台湾、东南亚华人社区）。\n2. 用户多次在feedback频道要求增加中文界面和中文客服支持。\n3. 部分用户因语言障碍已流失至竞品社区。\n\n建议行动：\n- 优先上线产品中文本地化（预计工作量2-3周）\n- 在Discord增设中文专区频道\n- 招聘1-2名中文社区运营专员\n- 制作中文版帮助文档和FAQ\n\n优先级评估：高。预计实施后可提升用户留存率15%-25%。",
    platform: 'Discord', docType: 'user_feedback', source: 'manual',
    fileType: 'text', fileSize: '2.1KB',
    upload_time: '2026-03-15T18:30:00.000Z'
  },
  {
    _id: 'doc_003', title: '【内部】Q1海外社区推广效果数据汇总',
    content: "2026年Q1（1月-3月）海外社区推广效果数据汇总报告\n\n一、整体数据概览\n- 总曝光量：1,250万次（环比+32%）\n- 总互动量：86.5万次（环比+28%）\n- 新增用户：4.2万人（环比+45%）\n- 总投入预算：$125,000\n- 综合ROI：1:3.8\n\n二、各平台数据\n1. YouTube：曝光520万，互动35万，新增用户1.8万，ROI 1:4.2\n2. TikTok：曝光380万，互动28万，新增用户1.2万，ROI 1:3.5\n3. Twitch：曝光180万，互动12万，新增用户0.5万，ROI 1:2.8\n4. Discord：社区成员增长至2.3万人，日活跃率38%\n5. Reddit：帖子总曝光170万，AMA参与人数1200+\n\n三、关键发现\n- YouTube Shorts带来的新用户转化率最高（8.2%）\n- TikTok达人合作的CPM最低（$2.1）\n- Discord社区留存率最高（月留存72%）\n\n四、Q2优化建议\n- 加大YouTube Shorts和TikTok投入\n- 优化Twitch合作主播筛选标准\n- 启动Reddit长期内容种草计划",
    platform: '', docType: 'data_report', source: 'upload',
    fileType: 'pdf', fileSize: '3.2MB',
    upload_time: '2026-04-02T10:00:00.000Z'
  },
  {
    _id: 'doc_004', title: '【内部】YouTube达人合作签约进度跟踪表',
    content: "YouTube达人合作签约进度（截至2026年4月15日）\n\n已签约达人（6位）：\n1. @TechReviewPro（粉丝85万）- 已签约，4月20日首发视频\n2. @GamingWithMax（粉丝62万）- 已签约，5月合作2条视频\n3. @DigitalNomadLife（粉丝45万）- 已签约，长期合作\n4. @SmartHomeTips（粉丝38万）- 已签约，产品评测系列\n5. @UnboxTherapy_CN（粉丝120万）- 已签约，Q2独家合作\n6. @CreatorStudio（粉丝28万）- 已签约，教程类内容\n\n洽谈中达人（4位）：\n1. @MrBeast_Gaming（粉丝2400万）- 报价$50K/条，待审批\n2. @LinusTechTips（粉丝1600万）- 初步接触，等待回复\n3. @MKBHD（粉丝1900万）- 经纪人已回复，排期Q3\n4. @iJustine（粉丝720万）- 价格谈判中\n\n预算使用情况：已使用$45,000 / 总预算$200,000",
    platform: 'YouTube', docType: 'progress_tracking', source: 'upload',
    fileType: 'xlsx', fileSize: '156KB',
    upload_time: '2026-04-15T14:20:00.000Z'
  },
  {
    _id: 'doc_005', title: '【内部】Twitch赞助活动ROI分析报告',
    content: "Twitch赞助活动ROI分析报告（2026年3月）\n\n活动概况：\n- 赞助主播数量：12位\n- 总直播时长：186小时\n- 总投入：$28,500\n\n效果数据：\n- 总观看人次：89.2万\n- 峰值同时在线：1.2万人\n- 品牌曝光时长：累计420分钟\n- 专属链接点击：15,800次\n- 优惠码使用：2,340次\n- 直接转化收入：$67,200\n- ROI：1:2.36\n\n主播表现排名（按ROI）：\n1. StreamerA - ROI 1:4.8（投入$3,000，转化$14,400）\n2. StreamerB - ROI 1:3.2（投入$5,000，转化$16,000）\n3. StreamerC - ROI 1:2.9（投入$2,500，转化$7,250）\n\n优化建议：\n- 增加与StreamerA类型主播的合作\n- 减少纯品牌曝光型合作，增加效果导向型\n- 下次活动增加Twitch Drops机制",
    platform: 'Twitch', docType: 'data_report', source: 'ai_parse',
    fileType: 'pdf', fileSize: '2.8MB',
    upload_time: '2026-04-08T16:45:00.000Z'
  },
  {
    _id: 'doc_006', title: '【内部】竞品B Reddit营销策略泄露分析',
    content: `通过公开渠道和行业交流获取的竞品B在Reddit平台的营销策略信息：\n\n1. 账号矩阵：竞品B在Reddit运营至少8个品牌相关账号\n   - 3个官方账号（品牌号、技术支持号、社区经理号）\n   - 5个"素人"种草账号（伪装为普通用户）\n\n2. 内容策略：\n   - 每周在r/technology、r/gadgets发布2-3篇深度技术帖\n   - 定期在r/deals发布限时优惠信息\n   - 通过AMA活动建立品牌权威（已举办3次）\n\n3. 投放预算：\n   - Reddit Ads月投放约$15,000-$20,000\n   - 达人合作月预算约$8,000\n\n4. 效果评估：\n   - 品牌相关帖子月均曝光约50万\n   - 社区口碑评分4.2/5.0\n\n应对建议：\n- 我方应加强Reddit官方账号运营\n- 避免使用素人账号策略（风险高）\n- 重点投入AMA和深度技术内容`,
    platform: 'Reddit', docType: 'competitive_intel', source: 'manual',
    fileType: 'text', fileSize: '3.1KB',
    upload_time: '2026-04-10T11:20:00.000Z'
  },
  {
    _id: 'doc_007', title: '【内部】4月TikTok投放计划与预算分配',
    content: "2026年4月TikTok投放计划\n\n一、投放目标\n- 月度新增用户目标：8,000人\n- 品牌曝光目标：500万次\n- 预算总额：$45,000\n\n二、预算分配\n1. 达人合作（60%）：$27,000\n   - 头部达人（1位）：$10,000\n   - 中腰部达人（5位）：$3,000/位 = $15,000\n   - 尾部达人（4位）：$500/位 = $2,000\n\n2. 信息流广告（25%）：$11,250\n   - In-Feed Ads：$7,000\n   - Spark Ads：$4,250\n\n3. 创意制作（10%）：$4,500\n   - 视频拍摄制作：$3,000\n   - 素材优化迭代：$1,500\n\n4. 预留机动（5%）：$2,250\n\n三、时间节点\n- 4月1-7日：素材准备与达人对接\n- 4月8-14日：首批达人内容上线\n- 4月15-21日：信息流广告启动\n- 4月22-30日：效果优化与数据复盘",
    platform: 'TikTok', docType: 'plan_doc', source: 'upload',
    fileType: 'pdf', fileSize: '1.5MB',
    upload_time: '2026-03-28T09:30:00.000Z'
  },
  {
    _id: 'doc_008', title: '【内部】海外社区运营周报（第16周）',
    content: "海外社区运营周报 — 2026年第16周（4月14日-4月20日）\n\n📊 本周数据概览\n- Discord社区新增成员：342人（累计23,800人）\n- Discord日均活跃率：41%（上周38%）\n- Reddit品牌帖互动量：12,500次（+18%）\n- YouTube社区帖互动：8,200次（+12%）\n\n🔥 本周亮点\n1. Discord中文频道上线首周，中文用户活跃度提升65%\n2. Reddit AMA活动参与人数创新高（1,800人）\n3. YouTube社区投票功能带动用户参与度显著提升\n\n⚠️ 本周问题\n1. Twitch合作主播StreamerD因个人原因取消本周直播\n2. Reddit r/technology版块新规限制了品牌帖发布频率\n3. Discord服务器遭遇一次小规模Raid攻击（已处理）\n\n📋 下周计划\n1. 启动Discord社区积分系统\n2. 准备Reddit第4次AMA活动\n3. 跟进Twitch替代主播方案\n4. YouTube Shorts新一批内容上线",
    platform: '', docType: 'weekly_report', source: 'manual',
    fileType: 'docx', fileSize: '890KB',
    upload_time: '2026-04-21T10:00:00.000Z'
  },
];

// ========== 映射 ==========
const platformClassMap = { 'YouTube': 'youtube', 'Twitch': 'twitch', 'Discord': 'discord', 'TikTok': 'tiktok', 'Reddit': 'reddit' };
const categoryClassMap = { '推广': 'promotion', '运营': 'operation', '技术': 'tech' };

// ========== 应用状态 ==========
let state = {
  strategyList: [],
  documentList: [],
  currentView: 'home',
  currentPlatform: null,
  currentDetail: null,
  activeCategory: 'all',
  uploadEditData: null,
  docFilter: 'all',
  docSearchKeyword: '',
};

// ========== 工具函数 ==========
function formatTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr), now = new Date(), diff = now - d;
  if (diff < 3600000) { const m = Math.floor(diff / 60000); return m <= 0 ? '刚刚' : `${m}分钟前`; }
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`;
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function formatFullTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}
function processItem(item) {
  return { ...item, platformClass: platformClassMap[item.platform] || 'youtube', categoryClass: categoryClassMap[item.category] || 'promotion', formatTime: formatTime(item.update_time), summary: item.content ? item.content.substring(0, 80) + '...' : '' };
}
function textToRich(text) {
  if (!text) return '';
  let raw = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const lines = raw.split('\n');
  let html = '';
  let inTable = false;
  let tableRows = [];

  function flushTable() {
    if (!tableRows.length) return '';
    let t = '<div class="rich-table-wrap"><table class="rich-table">';
    tableRows.forEach((row, ri) => {
      const cells = row.split('|').filter((c, idx, arr) => idx > 0 && idx < arr.length - 1).map(c => c.trim());
      if (cells.every(c => /^[-:]+$/.test(c))) return;
      const tag = ri === 0 ? 'th' : 'td';
      t += '<tr>' + cells.map(c => `<${tag}>${inlineFormat(c)}</${tag}>`).join('') + '</tr>';
    });
    t += '</table></div>';
    tableRows = [];
    inTable = false;
    return t;
  }

  function inlineFormat(str) {
    str = str.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" class="rich-link">$1</a>');
    str = str.replace(/(\$[\d,.]+[KMB]?\+?(?:\s*(?:USD|EUR|per\s+\w+²?))?)/gi, '<span class="rich-money">$1</span>');
    str = str.replace(/(\d+(?:\.\d+)?%)/g, '<span class="rich-pct">$1</span>');
    str = str.replace(/\b(\d+(?:\.\d+)?[BKMT]\+?)\b(?!\w)/gi, '<span class="rich-num">$1</span>');
    return str;
  }

  // ====== 预处理：收集STEP流程块 ======
  function tryCollectSteps(startIdx) {
    const steps = [];
    let j = startIdx;
    while (j < lines.length) {
      const t = lines[j].trim();
      if (/^STEP\s*\d+/i.test(t)) {
        const m = t.match(/^STEP\s*(\d+)\s*[:\uff1a]?\s*(.*)/i);
        if (m) steps.push({ num: m[1], text: m[2] || '' });
        j++;
      } else if (!t && steps.length > 0) {
        j++; // 跳过STEP之间的空行
        // 检查下一行是否还是STEP
        const nextNonEmpty = lines.slice(j).findIndex(l => l.trim());
        if (nextNonEmpty >= 0 && /^STEP\s*\d+/i.test(lines[j + nextNonEmpty].trim())) {
          j += nextNonEmpty;
          continue;
        }
        break;
      } else {
        break;
      }
    }
    return { steps, endIdx: j };
  }

  // ====== 预处理：检测 vs 对比块 ======
  function tryCollectVsBlock(startIdx) {
    // 向前/后查找对比项
    const items = [];
    let j = startIdx;
    // 当前行是 "xxx vs xxx" 或 "品牌在xxx的优势 vs 其他xxx"
    const vsLine = lines[startIdx].trim();
    j++;
    // 收集对比项（- 开头的行，分为两组）
    let leftItems = [], rightItems = [];
    let side = 'left';
    while (j < lines.length) {
      const t = lines[j].trim();
      if (!t) { j++; continue; }
      if (/^[·•\-]\s/.test(t) || /^\s{2,}[·•\-]\s/.test(lines[j])) {
        const content = t.replace(/^[·•\-]\s*/, '');
        // 检查是否有TwitchCon相关标记来切换到right
        if (side === 'left' && /TwitchCon/i.test(content)) { side = 'right'; }
        if (side === 'left') leftItems.push(content);
        else rightItems.push(content);
        j++;
      } else if (/TwitchCon/i.test(t) && !/^[一二三四五六七八九十]/.test(t) && !/^[【\[]/.test(t) && !/^══/.test(t)) {
        side = 'right';
        j++;
      } else if (/其他展会|other\s+conventions/i.test(t)) {
        side = 'left';
        j++;
      } else {
        break;
      }
    }
    return { leftItems, rightItems, endIdx: j };
  }

  // ====== 预处理：检测统计数据行 ======
  function isStatLine(trimmed) {
    // "24K 独立访客" / "54K 总入场人次" / "104M+ social media following"
    return /^\d+(?:\.\d+)?[BKMT]\+?\s+.{2,20}$/i.test(trimmed);
  }
  function tryCollectStats(startIdx) {
    const stats = [];
    let j = startIdx;
    while (j < lines.length) {
      const t = lines[j].trim();
      if (!t) { j++; if (stats.length > 0) { const nextNE = lines.slice(j).findIndex(l => l.trim()); if (nextNE >= 0 && isStatLine(lines[j+nextNE].trim())) { j += nextNE; continue; } break; } continue; }
      if (isStatLine(t)) {
        const m = t.match(/^(\d+(?:\.\d+)?[BKMT]\+?)\s+(.+)/i);
        if (m) stats.push({ value: m[1], label: m[2] });
        j++;
      } else if (t.startsWith('·') || t.startsWith('•') || t.startsWith('-')) {
        // 列表项里带统计数据 "· 24K 独立访客"
        const inner = t.replace(/^[·•\-]\s*/, '');
        const m2 = inner.match(/^(\d+(?:\.\d+)?[BKMT]\+?)\s+(.+)/i);
        if (m2) { stats.push({ value: m2[1], label: m2[2] }); j++; }
        else break;
      } else {
        break;
      }
    }
    return { stats, endIdx: j };
  }

  // ====== 预处理：检测费用行 ======
  function isPriceLine(trimmed) {
    // "Europe: Legendary $200,000 / Mythic $150,000" 或 "· Europe: Legendary $200K / Mythic $150K"
    return /(?:Europe|North\s+America|EU|NA)\s*[:\uff1a]/i.test(trimmed) && /\$[\d,.]+/i.test(trimmed);
  }
  function tryCollectPrices(startIdx) {
    const prices = [];
    let j = startIdx;
    while (j < lines.length) {
      const t = lines[j].trim().replace(/^[·•\-]\s*/, '');
      if (!t) { j++; continue; }
      if (isPriceLine(t)) {
        prices.push(t);
        j++;
      } else {
        break;
      }
    }
    return { prices, endIdx: j };
  }

  function renderPriceCards(priceLines) {
    let h = '<div class="rich-price-group">';
    priceLines.forEach(line => {
      const regionMatch = line.match(/^(Europe|North\s+America|EU|NA)\s*[:\uff1a]\s*(.*)/i);
      if (!regionMatch) { h += `<div class="rich-price-card"><span>${inlineFormat(line)}</span></div>`; return; }
      const region = regionMatch[1];
      const rest = regionMatch[2];
      const regionEmoji = /europe|eu/i.test(region) ? '🇪🇺' : '🇺🇸';
      const regionLabel = /europe|eu/i.test(region) ? 'Europe' : 'North America';
      // 解析价格标签
      const priceTags = [];
      const parts = rest.split(/[\/,;]/);
      parts.forEach(p => {
        const pm = p.trim().match(/(Legendary|Mythic|TBD)\s*[:\uff1a]?\s*(\$[\d,.]+[KMB]?\+?|TBD)/i);
        if (pm) priceTags.push({ tier: pm[1], amount: pm[2] });
      });
      h += `<div class="rich-price-card"><div class="rich-price-region">${regionEmoji} ${regionLabel}</div><div class="rich-price-tags">`;
      priceTags.forEach(pt => {
        const tierClass = pt.tier.toLowerCase() === 'legendary' ? 'legendary' : 'mythic';
        h += `<span class="rich-price-tag ${tierClass}"><span class="rich-price-tier">${pt.tier}</span><span class="rich-price-amount">${pt.amount}</span></span>`;
      });
      h += '</div></div>';
    });
    h += '</div>';
    return h;
  }

  // ====== 主循环 ======
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      if (inTable) html += flushTable();
      html += '<div class="rich-spacer"></div>';
      continue;
    }

    // 表格行
    if (trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.split('|').length >= 3) {
      inTable = true; tableRows.push(trimmed); continue;
    } else if (inTable) { html += flushTable(); }

    // ══ 分隔线 → 跳过
    if (/^══/.test(trimmed)) { continue; }
    // ─── 小分隔线
    if (/^───/.test(trimmed)) { html += '<hr class="rich-divider">'; continue; }

    // ====== STEP 流程图 ======
    // 单行内含 → 是流程写在一行里，渲染为inline流程标签
    if (/^STEP\s*\d+/i.test(trimmed) && trimmed.includes('→')) {
      // 按→拆分，每段渲染成 step-inline-item
      const parts = trimmed.split(/\s*→\s*/);
      html += '<div class="rich-step-inline">';
      parts.forEach((part, idx) => {
        const stepM = part.match(/^STEP\s*(\d+)\s*[:\uff1a]?\s*(.*)/i);
        if (stepM) {
          html += `<span class="rich-step-inline-item"><span class="rich-step-num">STEP ${stepM[1]}</span><span class="rich-step-inline-text">${inlineFormat(stepM[2])}</span></span>`;
        } else if (part.trim()) {
          html += `<span class="rich-step-inline-item"><span class="rich-step-inline-text">${inlineFormat(part.trim())}</span></span>`;
        }
        if (idx < parts.length - 1) html += '<span class="rich-step-inline-arrow">→</span>';
      });
      html += '</div>';
      continue;
    }
    if (/^STEP\s*\d+/i.test(trimmed) && !trimmed.includes('→')) {
      const { steps, endIdx } = tryCollectSteps(i);
      if (steps.length >= 2) {
        html += '<div class="rich-steps">';
        steps.forEach((s, si) => {
          html += `<div class="rich-step-card"><div class="rich-step-num">STEP ${s.num}</div><div class="rich-step-text">${inlineFormat(s.text)}</div></div>`;
          if (si < steps.length - 1) html += '<div class="rich-step-arrow"><i class="ri-arrow-down-line"></i></div>';
        });
        html += '</div>';
        i = endIdx - 1;
        continue;
      }
    }

    // ====== 统计数据卡片组 ======
    if (isStatLine(trimmed)) {
      const { stats, endIdx } = tryCollectStats(i);
      if (stats.length >= 2) {
        html += '<div class="rich-stats-grid">';
        stats.forEach(s => {
          html += `<div class="rich-stat-card"><div class="rich-stat-value">${s.value}</div><div class="rich-stat-label">${s.label}</div></div>`;
        });
        html += '</div>';
        i = endIdx - 1;
        continue;
      }
    }

    // ====== 费用行 → 价格卡片 ======
    if (isPriceLine(trimmed.replace(/^[·•\-]\s*/, ''))) {
      const { prices, endIdx } = tryCollectPrices(i);
      if (prices.length > 0) {
        html += renderPriceCards(prices);
        i = endIdx - 1;
        continue;
      }
    }

    // 章节大标题（最高优先级）
    if (/^(第[一二三四五六七八九十\d]+章)\s+/.test(trimmed)) {
      html += `<h2 class="rich-h2">${inlineFormat(trimmed)}</h2>`;
      continue;
    }

    // 中文序号标题（优先于 vs 对比行，避免 "三、xxx vs xxx" 被误匹配为 vs 对比）
    if (/^[一二三四五六七八九十]+[、.]/.test(trimmed)) {
      html += `<h3 class="rich-h3">${inlineFormat(trimmed)}</h3>`;
      continue;
    }

    // ====== 对比行 (含 vs) ======
    if (/\bvs\.?\b/i.test(trimmed) && trimmed.length < 80) {
      html += `<div class="rich-vs-header">${inlineFormat(trimmed)}</div>`;
      continue;
    }

    // 【x.x 标题】 带编号的区域标题 → 渲染为区域卡片头
    if (/^【\d+\.\d+\s+/.test(trimmed)) {
      const title = trimmed.replace(/^【/, '').replace(/】$/, '');
      html += `<div class="rich-area-header"><span class="rich-area-badge">${title.match(/^\d+\.\d+/)[0]}</span><span class="rich-area-title">${inlineFormat(title.replace(/^\d+\.\d+\s*/, ''))}</span></div>`;
      continue;
    }

    // 【】括号标题
    if (/^【.*】/.test(trimmed)) {
      html += `<h4 class="rich-h4">${inlineFormat(trimmed)}</h4>`;
      continue;
    }

    // 📋 ★ 🎯 等emoji标题行
    if (/^[📋📌★🎯🎮🎵🍳🎨💰🆓]/.test(trimmed) && trimmed.length < 60) {
      html += `<h3 class="rich-h3 rich-h3-emoji">${inlineFormat(trimmed)}</h3>`;
      continue;
    }

    // "定义：" 开头 → 高亮摘要框
    if (/^定义[：:]/.test(trimmed)) {
      const defText = trimmed.replace(/^定义[：:]\s*/, '');
      html += `<div class="rich-definition"><span class="rich-def-label">定义</span><span class="rich-def-text">${inlineFormat(defText)}</span></div>`;
      continue;
    }

    // 数字序号列表
    if (/^\d+[\.\)]\s/.test(trimmed)) {
      html += `<div class="rich-list-item rich-list-numbered"><span class="rich-list-bullet">${trimmed.match(/^\d+[\.\)]/)[0]}</span><span class="rich-list-text">${inlineFormat(trimmed.replace(/^\d+[\.\)]\s*/, ''))}</span></div>`;
      continue;
    }

    // · • - 列表项（合并紧跟的正文行，不再换行）
    if (/^[·•\-]\s/.test(trimmed)) {
      let itemText = trimmed.replace(/^[·•\-]\s*/, '');
      // 向前看：如果下一行不为空、不是列表项、不是标题，合并进来
      let j = i + 1;
      while (j < lines.length) {
        const nextT = lines[j].trim();
        if (!nextT) break; // 空行停止
        if (/^[·•\-●]\s/.test(nextT)) break; // 下一个列表项停止
        if (/^[★📋📌🎯【#]/.test(nextT)) break; // 标题行停止
        if (/^\s{2,}/.test(lines[j])) break; // 缩进子列表停止
        if (/^[一二三四五六七八九十]/.test(nextT)) break; // 中文序号停止
        if (/^STEP\s*\d+/i.test(nextT)) break; // STEP行停止
        if (/^\|/.test(nextT)) break; // 表格停止
        // 合并这行
        itemText += ' ' + nextT;
        j++;
      }
      html += `<div class="rich-list-item"><span class="rich-list-dot">•</span><span class="rich-list-text">${inlineFormat(itemText)}</span></div>`;
      i = j - 1; // 跳过已合并的行
      continue;
    }

    // 缩进子列表
    if (/^\s{2,}[○\-·•]\s/.test(line)) {
      html += `<div class="rich-list-item rich-list-sub"><span class="rich-list-dot">○</span><span class="rich-list-text">${inlineFormat(trimmed.replace(/^[○\-·•]\s*/, ''))}</span></div>`;
      continue;
    }

    // 缩进子列表 (数字)
    if (/^\s{2,}\d+[\.\)]\s/.test(line)) {
      html += `<div class="rich-list-item rich-list-sub rich-list-numbered"><span class="rich-list-bullet">${trimmed.match(/^\d+[\.\)]/)[0]}</span><span class="rich-list-text">${inlineFormat(trimmed.replace(/^\d+[\.\)]\s*/, ''))}</span></div>`;
      continue;
    }

    // 键值对
    const kvMatch = trimmed.match(/^([^：:]{2,8})[：:]\s*(.+)/);
    if (kvMatch && !trimmed.startsWith('http') && !/^\d+[\.\)]/.test(trimmed)) {
      const key = kvMatch[1].trim();
      const val = kvMatch[2].trim();
      if (key.length <= 8 && !key.includes('。') && !key.includes('，') && val.length > key.length) {
        html += `<div class="rich-kv"><span class="rich-kv-key">${inlineFormat(key)}</span><span class="rich-kv-val">${inlineFormat(val)}</span></div>`;
        continue;
      }
    }

    // 普通段落
    html += `<p class="rich-p">${inlineFormat(trimmed)}</p>`;
  }

  if (inTable) html += flushTable();
  return html;
}
function generateId() { return 'str_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6); }
function showToast(msg, duration = 2000) {
  const t = document.getElementById('toast'), txt = document.getElementById('toastText');
  txt.textContent = msg; t.classList.remove('hidden'); t.classList.add('show');
  setTimeout(() => { t.classList.add('hide'); setTimeout(() => { t.classList.remove('show','hide'); t.classList.add('hidden'); }, 300); }, duration);
}
function showLoading(msg = '加载中...') { document.getElementById('loadingText').textContent = msg; document.getElementById('loadingOverlay').classList.remove('hidden'); }
function hideLoading() { document.getElementById('loadingOverlay').classList.add('hidden'); }

// ========== 视图路由 ==========
function switchView(viewName) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-' + viewName).classList.add('active');
  state.currentView = viewName;
  window.scrollTo(0, 0);
}

// ========== 首页渲染 ==========

// ========== 更新日志渲染 ==========
function renderLogs() {
  switchView('logs');
  document.querySelectorAll('.sidebar-tab').forEach(b => b.classList.toggle('active', b.dataset.view === 'logs'));

  const container = document.getElementById('logsContainer');
  // 取所有策略按更新时间降序，展示最近的操作记录
  const list = [...state.strategyList].sort((a, b) => new Date(b.update_time) - new Date(a.update_time));

  if (!list.length) {
    container.innerHTML = '<div class="empty-state"><span class="empty-icon">📭</span><span class="empty-text">暂无更新记录</span></div>';
    return;
  }

  const grouped = {};
  list.forEach(item => {
    const day = (item.update_time || '').substring(0, 10);
    if (!grouped[day]) grouped[day] = [];
    grouped[day].push(item);
  });

  container.innerHTML = Object.keys(grouped).sort((a,b)=>b.localeCompare(a)).map(day => `
    <div class="log-group">
      <div class="log-date-header"><i class="ri-calendar-line"></i> ${day}</div>
      ${grouped[day].map(item => `
        <div class="log-entry">
          <div class="log-entry-left">
            <span class="log-dot"></span>
          </div>
          <div class="log-entry-right">
            <div class="log-entry-title">${item.title}</div>
            <div class="log-entry-meta">
              <span class="tag-platform tag-${item.platformClass || ''}">${item.platform}</span>
              <span class="tag-category tag-${item.categoryClass || ''}">${item.category}</span>
              ${item.source_type === 'internal' ? '<span class="tag-internal">🔒 内部</span>' : ''}
              <span class="log-entry-time">${item.formatTime || ''}</span>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `).join('');
}

function renderHome() {
  // 平台卡片
  const grid = document.getElementById('platformGrid');
  grid.innerHTML = PLATFORMS.map(p => {
    const count = state.strategyList.filter(s => s.platform === p.name).length;
    return `
      <div class="platform-card" data-platform="${p.name}">
        <span class="card-version">${p.version}</span>
        <span class="card-icon">${p.icon}</span>
        <div class="card-name">${p.name}</div>
        <div class="card-desc">${p.desc} · ${count}项策略</div>
      </div>`;
  }).join('');

  // 快捷操作
  const qa = document.getElementById('quickActions');
  qa.innerHTML = `
    <div class="quick-action-item" data-action="upload"><div class="quick-action-icon qa-upload"><i class="ri-upload-cloud-line"></i></div><span class="quick-action-label">上传文档</span></div>
    <div class="quick-action-item" data-action="log"><div class="quick-action-icon qa-log"><i class="ri-file-list-line"></i></div><span class="quick-action-label">更新日志</span></div>
    <div class="quick-action-item" data-action="doc"><div class="quick-action-icon qa-doc"><i class="ri-folder-lock-line"></i></div><span class="quick-action-label">内部文档</span></div>
  `;

  // 最近更新
  const rl = document.getElementById('recentList');
  rl.innerHTML = RECENT_LOGS.map(log => `
    <div class="recent-item">
      <div class="recent-dot"></div>
      <div class="recent-info">
        <div class="recent-title">${log.title}</div>
        <div class="recent-desc">${log.desc}</div>
        <div class="recent-time">${log.time}</div>
      </div>
    </div>
  `).join('');
}

// ========== 平台详情页渲染 ==========
function renderPlatformDetail(platformName) {
  const pf = PLATFORMS.find(p => p.name === platformName);
  if (!pf) return;
  state.currentPlatform = pf;
  state.activeCategory = 'all';

  document.getElementById('platformPageTitle').textContent = pf.name;

  const strategies = state.strategyList.filter(s => s.platform === platformName);
  const container = document.getElementById('platformDetailContent');

  container.innerHTML = `
    <!-- 平台信息卡 -->
    <div class="platform-info-card">
      <span class="platform-info-icon">${pf.icon}</span>
      <div class="platform-info-body">
        <div class="platform-info-name">${pf.name}</div>
        <div class="platform-info-desc">${pf.desc} · ${strategies.length}项策略</div>
      </div>
      <span class="platform-info-version">${pf.version}</span>
    </div>
    <!-- 分类Tab -->
    <div class="tab-bar" id="platformCatTabs">
      ${CATEGORIES.map((c, i) => `
        <div class="tab-item ${i === 0 ? 'active' : ''}" data-cat="${c.dbKey}">
          <span class="cat-tab-icon">${c.icon}</span>
          <span>${c.label}</span>
        </div>
      `).join('')}
    </div>
    <!-- 策略列表 -->
    <div class="strategy-content" id="platformStrategyList"></div>
    <!-- 底部操作 -->
    <div class="platform-bottom-actions">
      <button class="platform-bottom-btn primary" id="platformUploadBtn">
        <i class="ri-upload-line"></i> 上传新策略/信息
      </button>
      <button class="platform-bottom-btn secondary" id="platformUpdateBtn">
        <i class="ri-refresh-line"></i> 更新策略
      </button>
    </div>
  `;

  const defaultCat = CATEGORIES[0].dbKey;
  renderPlatformStrategies(platformName, defaultCat);
  highlightCatTab(defaultCat);
  switchView('platform');
}

function renderPlatformStrategies(platformName, category) {
  let list = state.strategyList.filter(s => s.platform === platformName);
  if (category !== 'all') {
    list = list.filter(s => s.category === category);
  }
  list.sort((a, b) => new Date(b.update_time) - new Date(a.update_time));

  const container = document.getElementById('platformStrategyList');
  if (!list.length) {
    container.innerHTML = '<div class="empty-state"><span class="empty-icon">📭</span><span class="empty-text">暂无相关策略</span></div>';
    return;
  }

  const sectionIcons = [
    'ri-star-line', 'ri-key-line', 'ri-lightbulb-line',
    'ri-bookmark-line', 'ri-flag-line', 'ri-compass-3-line'
  ];

  container.innerHTML = list.map((item, idx) => {
    const icon = sectionIcons[idx % sectionIcons.length];
    const isInternal = item.source_type === 'internal';
    const contentHtml = isInternal
      ? `<div class="content-locked-wrap" id="contentLockedWrap_${item._id}">
          <div class="content-locked-mask"><div class="locked-blur-text">${(item.content || '').substring(0, 200).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div></div>
          <div class="content-lock-overlay">
            <div class="lock-icon-big">🔐</div>
            <div class="lock-title">内部内容已加密</div>
            <div class="lock-hint">输入密码后查看完整内容</div>
            <button class="unlock-btn" id="unlockContentBtn_${item._id}"><i class="ri-lock-unlock-line"></i> 输入密码查看</button>
          </div>
        </div>
        <div class="rich-content hidden" id="contentUnlocked_${item._id}">${textToRich(item.content)}</div>`
      : `<div class="rich-content">${textToRich(item.content)}</div>`;

    const sourceHtml = item.url
      ? `<div class="detail-source" style="margin-top:12px;cursor:pointer;" data-url="${item.url}">
          <span class="source-label">📎 来源链接</span>
          <span class="source-url">${item.url}</span>
          <span class="source-copy">复制</span>
        </div>`
      : '';

    return `
    <div class="strategy-section" data-id="${item._id}">
      <div class="strategy-section-header">
        <i class="${icon}"></i>
        ${item.title}
        ${isInternal ? '<span class="tag-internal" style="margin-left:8px;font-size:11px;">🔒 内部</span>' : ''}
        <span class="strategy-time">${item.formatTime}</span>
      </div>
      <div class="strategy-section-body">
        ${contentHtml}
        ${sourceHtml}
      </div>
    </div>`;
  }).join('');

  // 重新绑定内部内容解锁按钮
  container.querySelectorAll('.unlock-btn').forEach(btn => {
    const itemId = btn.id.replace('unlockContentBtn_', '');
    btn.addEventListener('click', () => {
      checkPassword(function() {
        const wrap = document.getElementById('contentLockedWrap_' + itemId);
        const unlocked = document.getElementById('contentUnlocked_' + itemId);
        if (wrap) wrap.style.display = 'none';
        if (unlocked) unlocked.classList.remove('hidden');
      }, '内部内容已加密');
    });
  });

  // 来源链接复制
  container.querySelectorAll('.detail-source').forEach(el => {
    el.addEventListener('click', () => {
      const url = el.dataset.url;
      if (url) { navigator.clipboard.writeText(url).then(() => showToast('链接已复制')); }
    });
  });
}

function highlightCatTab(category) {
  state.activeCategory = category;
  document.querySelectorAll('#platformCatTabs .tab-item').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.cat === category);
  });
}

// ========== 策略详情页渲染 ==========
function renderDetail(id) {
  const item = state.strategyList.find(s => s._id === id);
  if (!item) { showToast('策略不存在'); return; }
  state.currentDetail = item;
  const isInternal = item.source_type === 'internal';
  const related = state.strategyList.filter(s => s._id !== id && (s.platform === item.platform || s.category === item.category)).slice(0, 3);

  document.getElementById('detailContent').innerHTML = `
    <div class="detail-header ${isInternal ? 'header-internal' : ''}">
      <div class="detail-tags">
        <span class="tag-platform tag-${item.platformClass}">${item.platform}</span>
        <span class="tag-category tag-${item.categoryClass}">${item.category}</span>
        ${isInternal ? '<span class="tag-internal">🔒 内部情报</span>' : ''}
      </div>
      <div class="detail-title">${item.title}</div>
      <div class="detail-meta">
        <div class="meta-item"><span class="meta-label">更新时间</span><span class="meta-value">${formatFullTime(item.update_time)}</span></div>
        <div class="meta-item"><span class="meta-label">数据来源</span><span class="meta-value ${isInternal ? 'internal-source' : ''}">${isInternal ? '内部上传' : '公开数据'}</span></div>
      </div>
    </div>
    ${isInternal ? '<div class="internal-banner"><span>⚠️</span><span class="banner-text">此条策略来源于内部情报上传，请注意信息保密</span></div>' : ''}
    <div class="detail-body">
      <div class="body-section">
        <div class="section-title"><span>📋</span> 策略内容</div>
        ${isInternal ? ('<div class="content-locked-wrap" id="contentLockedWrap_' + item._id + '"><div class="content-locked-mask"><div class="locked-blur-text">' + (item.content || '').substring(0, 200).replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</div></div><div class="content-lock-overlay"><div class="lock-icon-big">🔐</div><div class="lock-title">内部内容已加密</div><div class="lock-hint">输入密码后查看完整内容</div><button class="unlock-btn" id="unlockContentBtn_' + item._id + '"><i class="ri-lock-unlock-line"></i> 输入密码查看</button></div></div><div class="rich-content hidden" id="contentUnlocked_' + item._id + '">' + textToRich(item.content) + '</div>') : ('<div class="rich-content">' + textToRich(item.content) + '</div>')}
      </div>
    </div>
    ${item.url ? `<div class="detail-source" id="copyUrlBtn"><span class="source-label">📎 来源链接</span><span class="source-url">${item.url}</span><span class="source-copy">复制</span></div>` : ''}
    ${related.length > 0 ? `
    <div class="related-section">
      <div class="section-title"><span>📌</span> 相关策略</div>
      ${related.map(r => `
        <div class="related-card ${r.source_type === 'internal' ? 'related-internal' : ''}" data-id="${r._id}">
          <div class="related-tags">
            <span class="tag-platform tag-${r.platformClass}" style="font-size:10px;padding:1px 7px;">${r.platform}</span>
            ${r.source_type === 'internal' ? '<span class="tag-internal" style="font-size:9px;padding:0 6px;">内部</span>' : ''}
          </div>
          <div class="related-title">${r.title}</div>
        </div>`).join('')}
    </div>` : ''}
    <div style="height:80px;"></div>
  `;

  // 绑定事件
  const copyBtn = document.getElementById('copyUrlBtn');
  if (copyBtn) copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(item.url).then(() => showToast('链接已复制')).catch(() => showToast('复制失败'));
  });
  document.querySelectorAll('#detailContent .related-card').forEach(card => {
    card.addEventListener('click', () => renderDetail(card.dataset.id));
  });

  // 内部策略解锁按钮
  const unlockBtn = document.getElementById('unlockContentBtn_' + item._id);
  if (unlockBtn) {
    if (passwordUnlocked) {
      const wrapEl = document.getElementById('contentLockedWrap_' + item._id);
      const unlockedEl = document.getElementById('contentUnlocked_' + item._id);
      if (wrapEl) wrapEl.style.display = 'none';
      if (unlockedEl) unlockedEl.classList.remove('hidden');
    } else {
      unlockBtn.addEventListener('click', () => {
        checkPassword(() => {
          const wrapEl = document.getElementById('contentLockedWrap_' + item._id);
          const unlockedEl = document.getElementById('contentUnlocked_' + item._id);
          if (wrapEl) wrapEl.style.display = 'none';
          if (unlockedEl) unlockedEl.classList.remove('hidden');
        }, '内部情报已加密');
      });
    }
  }

  // 更新底部操作栏：内部情报显示编辑+删除，公开数据显示编辑+分享
  const detailActions = document.getElementById('detailActions');
  if (isInternal) {
    detailActions.innerHTML = `
      <button class="action-btn edit-btn" id="editBtn"><i class="ri-edit-line"></i> 编辑</button>
      <button class="action-btn delete-btn" id="deleteBtn"><i class="ri-delete-bin-line"></i> 删除</button>
    `;
    document.getElementById('editBtn').addEventListener('click', () => {
      renderUploadPage(state.currentDetail);
    });
    document.getElementById('deleteBtn').addEventListener('click', () => {
      showDeleteConfirm(item._id, item.title);
    });
  } else {
    detailActions.innerHTML = `
      <button class="action-btn edit-btn" id="editBtn"><i class="ri-edit-line"></i> 编辑</button>
      <button class="action-btn share-btn" id="shareBtn"><i class="ri-share-line"></i> 分享</button>
    `;
    document.getElementById('editBtn').addEventListener('click', () => {
      renderUploadPage(state.currentDetail);
    });
    document.getElementById('shareBtn').addEventListener('click', () => {
      const d = state.currentDetail;
      const text = `【海外社区策略库】\n${d.title}\n\n平台：${d.platform}\n分类：${d.category}\n\n${d.content ? d.content.substring(0, 200) + '...' : ''}`;
      navigator.clipboard.writeText(text).then(() => showToast('已复制分享内容')).catch(() => showToast('复制失败'));
    });
  }

  switchView('detail');
}

// ========== 录入信息页渲染 ==========
function renderUploadPage(editData = null, presetPlatform = '') {
  state.uploadEditData = editData;
  document.getElementById('uploadPageTitle').textContent = editData ? '编辑策略' : '录入信息';

  const platformOptions = [
    { value: '', label: '-- 通用(不关联特定平台) --' },
    ...PLATFORMS.map(p => ({ value: p.name, label: p.name }))
  ];

  const defaultPlatform = editData ? editData.platform : (presetPlatform || '');
  // 编辑模式下根据source_type推断文档类型
  let defaultDocType = '';
  if (editData) {
    if (editData.source_type === 'internal') defaultDocType = 'internal_report';
    else if (editData.category === '推广') defaultDocType = 'promo_rules';
    else if (editData.category === '技术') defaultDocType = 'platform_policy';
    else defaultDocType = 'project_data';
  }

  const body = document.getElementById('uploadBody');
  body.innerHTML = `
    <!-- 关联平台 -->
    <div class="upload-form-item">
      <label class="upload-form-label">关联平台</label>
      <div class="custom-select-wrap" id="platformSelectWrap">
        <div class="custom-select-display" id="platformSelectDisplay">
          <span id="platformSelectText">${defaultPlatform ? defaultPlatform : '-- 通用(不关联特定平台) --'}</span>
          <span class="custom-select-arrow">▾</span>
        </div>
        <div class="custom-select-dropdown hidden" id="platformSelectDropdown">
          ${platformOptions.map(o => `
            <div class="custom-select-option ${o.value === defaultPlatform ? 'selected' : ''}" data-value="${o.value}">${o.label}</div>
          `).join('')}
        </div>
      </div>
      <input type="hidden" id="uploadPlatform" value="${defaultPlatform}" />
    </div>

    <!-- 文档类型 -->
    <div class="upload-form-item">
      <label class="upload-form-label">文档类型</label>
      <div class="custom-select-wrap" id="docTypeSelectWrap">
        <div class="custom-select-display" id="docTypeSelectDisplay">
          <span id="docTypeSelectText">${defaultDocType ? DOC_TYPES.find(d => d.value === defaultDocType)?.label : '请选择文档类型'}</span>
          <span class="custom-select-arrow">▾</span>
        </div>
        <div class="custom-select-dropdown hidden" id="docTypeSelectDropdown">
          ${DOC_TYPES.map(d => `
            <div class="custom-select-option ${d.value === defaultDocType ? 'selected' : ''}" data-value="${d.value}">${d.label}</div>
          `).join('')}
        </div>
      </div>
      <input type="hidden" id="uploadDocType" value="${defaultDocType}" />
    </div>

    <!-- 动态表单区域 -->
    <div id="dynamicFormArea"></div>

    <!-- 保存按钮 -->
    <button class="btn-save-info" id="saveInfoBtn">
      <i class="ri-save-line"></i> 保存信息
    </button>
  `;

  // 渲染动态表单
  renderDynamicForm(defaultDocType, editData);

  // 绑定自定义下拉事件
  initCustomSelect('platformSelectWrap', 'platformSelectDisplay', 'platformSelectDropdown', 'platformSelectText', 'uploadPlatform');
  initCustomSelect('docTypeSelectWrap', 'docTypeSelectDisplay', 'docTypeSelectDropdown', 'docTypeSelectText', 'uploadDocType', (val) => {
    renderDynamicForm(val, null);
  });

  // 保存按钮事件
  document.getElementById('saveInfoBtn').addEventListener('click', onSaveInfo);

  switchView('upload');
}

// 自定义下拉初始化
function initCustomSelect(wrapId, displayId, dropdownId, textId, hiddenId, onChange) {
  const display = document.getElementById(displayId);
  const dropdown = document.getElementById(dropdownId);
  const textEl = document.getElementById(textId);
  const hiddenEl = document.getElementById(hiddenId);

  display.addEventListener('click', (e) => {
    e.stopPropagation();
    // 关闭所有其他下拉
    document.querySelectorAll('.custom-select-dropdown').forEach(d => {
      if (d.id !== dropdownId) d.classList.add('hidden');
    });
    dropdown.classList.toggle('hidden');
    display.classList.toggle('active', !dropdown.classList.contains('hidden'));
  });

  dropdown.addEventListener('click', (e) => {
    const opt = e.target.closest('.custom-select-option');
    if (!opt) return;
    const val = opt.dataset.value;
    hiddenEl.value = val;
    textEl.textContent = opt.textContent.trim();
    dropdown.querySelectorAll('.custom-select-option').forEach(o => o.classList.remove('selected'));
    opt.classList.add('selected');
    dropdown.classList.add('hidden');
    display.classList.remove('active');
    if (onChange) onChange(val);
  });

  // 点击外部关闭
  document.addEventListener('click', () => {
    dropdown.classList.add('hidden');
    display.classList.remove('active');
  });
}

// 根据文档类型渲染动态表单
function renderDynamicForm(docType, editData) {
  const area = document.getElementById('dynamicFormArea');
  if (!area) return;

  if (docType === 'internal_report') {
    // 内部项目报告：关联频道名 + 标题 + 内容
    const channelVal = editData?.channel || '';
    const titleVal = editData?.title || '';
    const contentVal = editData?.content || '';
    area.innerHTML = `
      <div class="upload-form-item">
        <label class="upload-form-label">🎬 关联频道/账号名 <span class="label-hint">（该报告涉及的频道/项目）</span></label>
        <input class="upload-form-input" id="formChannel" placeholder="请输入频道名称，如：PewDiePie" value="${channelVal}" />
      </div>
      <div class="upload-form-item">
        <label class="upload-form-label">标题</label>
        <input class="upload-form-input" id="formTitle" placeholder="例如：YouTube 2026春季更新政策" value="${titleVal}" />
      </div>
      <div class="upload-form-item">
        <label class="upload-form-label">内容</label>
        <textarea class="upload-form-textarea" id="formContent" placeholder="粘贴或输入政策/信息内容...">${contentVal}</textarea>
      </div>
    `;
  } else if (docType) {
    // 其他文档类型：标题 + 内容
    const titleVal = editData?.title || '';
    const contentVal = editData?.content || '';
    area.innerHTML = `
      <div class="upload-form-item">
        <label class="upload-form-label">标题</label>
        <input class="upload-form-input" id="formTitle" placeholder="例如：YouTube 2026春季更新政策" value="${titleVal}" />
      </div>
      <div class="upload-form-item">
        <label class="upload-form-label">内容</label>
        <textarea class="upload-form-textarea" id="formContent" placeholder="粘贴或输入政策/信息内容...">${contentVal}</textarea>
      </div>
    `;
  } else {
    area.innerHTML = '';
  }
}

// 保存信息
function onSaveInfo() {
  const platform = document.getElementById('uploadPlatform').value;
  const docType = document.getElementById('uploadDocType').value;
  const titleEl = document.getElementById('formTitle');
  const contentEl = document.getElementById('formContent');
  const channelEl = document.getElementById('formChannel');

  if (!docType) { showToast('请选择文档类型'); return; }

  const title = titleEl ? titleEl.value.trim() : '';
  const content = contentEl ? contentEl.value.trim() : '';

  if (!content && !title) { showToast('请输入标题或内容'); return; }

  // 如果是内部项目报告，弹出解析确认弹窗
  if (docType === 'internal_report') {
    showParseModal(content, title, platform, channelEl ? channelEl.value.trim() : '');
    return;
  }

  // 其他类型直接保存
  doSave(title, content, platform, docType, '');
}

// ========== 删除确认弹窗 ==========
function showDeleteConfirm(id, title) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'deleteConfirmOverlay';
  overlay.innerHTML = `
    <div class="modal-box" style="border-radius:20px;max-width:400px;padding:28px 24px;">
      <div class="modal-header">
        <span class="modal-icon">🗑️</span>
        <span class="modal-title">确认删除</span>
      </div>
      <div style="font-size:14px;color:#555;line-height:1.7;margin-bottom:20px;">
        确定要删除以下内部情报吗？此操作不可撤销。<br>
        <span style="color:#E65100;font-weight:600;">"${title}"</span>
      </div>
      <div class="modal-actions">
        <button class="modal-btn cancel" id="deleteCancelBtn">取消</button>
        <button class="modal-btn" id="deleteConfirmBtn" style="background:linear-gradient(135deg,#c62828,#e53935);color:#fff;box-shadow:0 4px 14px rgba(198,40,40,0.3);">
          <i class="ri-delete-bin-line"></i> 确认删除
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  document.getElementById('deleteCancelBtn').addEventListener('click', () => {
    overlay.remove();
  });
  document.getElementById('deleteConfirmBtn').addEventListener('click', () => {
    overlay.remove();
    doDelete(id);
  });
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });
}

function doDelete(id) {
  showLoading('删除中...');
  setTimeout(() => {
    hideLoading();
    const idx = state.strategyList.findIndex(s => s._id === id);
    if (idx !== -1) {
      const item = state.strategyList[idx];
      RECENT_LOGS.unshift({
        type: 'delete', title: '删除内部项目数据',
        desc: `[${item.platform}] 策略ID: ${id}, 频道: ${item.channel || 'ALL'}`,
        time: formatFullTime(new Date().toISOString())
      });
      state.strategyList.splice(idx, 1);
    }
    showToast('已删除');
    setTimeout(() => {
      if (state.currentPlatform) {
        renderPlatformDetail(state.currentPlatform.name);
      } else {
        renderHome();
        switchView('home');
      }
    }, 800);
  }, 800);
}

function doSave(title, content, platform, docType, channel) {
  showLoading('保存中...');
  setTimeout(() => {
    hideLoading();

    // 确定分类
    let category = '推广';
    if (docType === 'platform_policy' || docType === 'promo_rules') category = '推广';
    else if (docType === 'project_data' || docType === 'internal_report') category = '运营';
    else category = '推广'; // other类型默认推广

    if (state.uploadEditData && state.uploadEditData._id) {
      // 编辑模式
      const idx = state.strategyList.findIndex(s => s._id === state.uploadEditData._id);
      if (idx !== -1) {
        state.strategyList[idx] = processItem({
          ...state.strategyList[idx], title: title || state.strategyList[idx].title,
          content: content || state.strategyList[idx].content,
          platform: platform || state.strategyList[idx].platform,
          category, update_time: new Date().toISOString()
        });
      }
      showToast('修改成功');
    } else {
      // 新增
      const newId = generateId();
      const finalTitle = title || `${platform || '通用'}${DOC_TYPES.find(d => d.value === docType)?.label || ''}`;
      state.strategyList.unshift(processItem({
        _id: newId,
        title: finalTitle,
        content: content,
        platform: platform || 'YouTube',
        category,
        source_type: docType === 'internal_report' ? 'internal' : 'public',
        channel: channel || '',
        url: '', update_time: new Date().toISOString()
      }));
      // 同步到文档列表
      state.documentList.unshift({
        _id: 'doc_' + newId,
        title: finalTitle,
        content: content,
        platform: platform || 'YouTube',
        docType: docType || 'other',
        source: 'manual',
        fileType: 'text',
        fileSize: (new Blob([content || '']).size / 1024).toFixed(1) + 'KB',
        upload_time: new Date().toISOString()
      });
      showToast('保存成功');
    }

    setTimeout(() => {
      if (state.currentPlatform) {
        renderPlatformDetail(state.currentPlatform.name);
      } else {
        renderHome();
        switchView('home');
      }
    }, 800);
  }, 1000);
}

// ========== 上传文档页 ==========
let docUploadState = {
  mode: 'text',           // text / file
  docVisibility: 'public', // public / internal
  inputText: '',
  selectedFile: null,
  selectedFileContent: '',
  selectedImage: null,
  ocrText: '',
  parseResult: null,
  isParsing: false,
};

function renderDocUploadPage(presetPlatform = '') {
  docUploadState = { mode: 'text', docVisibility: 'public', inputText: '', selectedFile: null, selectedFileContent: '', selectedImage: null, ocrText: '', parseResult: null, isParsing: false, presetPlatform: presetPlatform };
  switchView('doc-upload');
  renderDocVisibilitySelector();
  updateDocUploadTabs('text');
  renderDocUploadContent('text');
}

function renderDocVisibilitySelector() {
  var selectorEl = document.getElementById("docVisibilitySelector");
  if (!selectorEl) return;
  var vis = docUploadState.docVisibility;
  var hintHtml = vis === 'internal'
    ? '<div class="doc-vis-hint internal-hint"><i class="ri-information-line"></i> 内部文档解析后的内容将加密保护，查看时需输入密码</div>'
    : '<div class="doc-vis-hint public-hint"><i class="ri-information-line"></i> 公开文档内容可直接查看，适合公开可用的平台策略资料</div>';
  selectorEl.innerHTML = '<div class="doc-visibility-label"><i class="ri-shield-line" style="color:#6C3CE1;"></i> 文档类型</div><div class="doc-visibility-btns"><button class="doc-vis-btn ' + (vis === 'public' ? 'active public' : '') + '" data-vis="public"><i class="ri-global-line"></i> 公开文档</button><button class="doc-vis-btn ' + (vis === 'internal' ? 'active internal' : '') + '" data-vis="internal"><i class="ri-lock-line"></i> 内部文档</button></div>' + hintHtml;
  selectorEl.querySelectorAll('.doc-vis-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      docUploadState.docVisibility = btn.dataset.vis;
      renderDocVisibilitySelector();
    });
  });
}

function updateDocUploadTabs(mode) {
  document.querySelectorAll('#docUploadTabs .doc-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.mode === mode);
  });
  docUploadState.mode = mode;
}

function renderDocUploadContent(mode) {
  const body = document.getElementById('docUploadBody');
  docUploadState.parseResult = null;

  const _pp = docUploadState.presetPlatform || '';
  const _ppObj = _pp ? PLATFORMS.find(p => p.name === _pp) : null;
  const _ppLabel = _ppObj ? `${_ppObj.icon} ${_ppObj.name}` : '-- 自动识别 --';

  if (mode === 'text') {
    body.innerHTML = `
      <div class="upload-section-card">
        <div class="upload-section-label"><i class="ri-file-text-line" style="color:#6C3CE1;font-size:20px;"></i> 粘贴内部消息文本</div>
        <textarea class="doc-text-area" id="docTextInput" placeholder="请在此粘贴您获取的内部消息文本内容...&#10;&#10;支持任何格式的文本，AI会自动提取关键信息并归类为：&#10;· 平台（YouTube/Twitch/Discord等）&#10;· 类别（推广/运营/技术）&#10;· 核心内容摘要"></textarea>
        <div class="doc-text-counter"><span id="docTextCount">0</span> / 5000</div>
      </div>
      <div class="doc-platform-select">
        <div class="upload-form-item">
          <label class="upload-form-label">关联平台（可选）</label>
          <div class="custom-select-wrap" id="docPlatformWrap">
            <div class="custom-select-display" id="docPlatformDisplay">
              <span id="docPlatformText">${_ppLabel}</span>
              <span class="custom-select-arrow">▾</span>
            </div>
            <div class="custom-select-dropdown hidden" id="docPlatformDropdown">
              <div class="custom-select-option ${!_pp ? 'selected' : ''}" data-value="">-- 自动识别 --</div>
              ${PLATFORMS.map(p => `<div class="custom-select-option ${p.name === _pp ? 'selected' : ''}" data-value="${p.name}">${p.icon} ${p.name}</div>`).join('')}
            </div>
          </div>
          <input type="hidden" id="docPlatformValue" value="${_pp}" />
        </div>
      </div>
      <button class="btn-ai-parse" id="docParseBtn">
        <i class="ri-robot-line" style="font-size:20px;"></i> AI 解析并入库
      </button>
      <div id="docParseResultArea"></div>
    `;
    // 绑定文字计数
    const textInput = document.getElementById('docTextInput');
    const textCount = document.getElementById('docTextCount');
    textInput.addEventListener('input', () => {
      docUploadState.inputText = textInput.value;
      textCount.textContent = textInput.value.length;
    });
    // 绑定解析按钮
    document.getElementById('docParseBtn').addEventListener('click', onDocParseText);
    // 初始化平台下拉
    initCustomSelect('docPlatformWrap', 'docPlatformDisplay', 'docPlatformDropdown', 'docPlatformText', 'docPlatformValue');

  } else if (mode === 'file') {
    body.innerHTML = `
      <div class="upload-section-card">
        <div class="upload-section-label"><i class="ri-upload-cloud-line" style="color:#6C3CE1;font-size:20px;"></i> 上传文档文件</div>
        <div id="fileDropZone" class="file-drop-zone">
          <i class="ri-file-upload-line drop-icon"></i>
          <div class="drop-text">点击选择文件 或 拖拽到此区域</div>
          <div class="drop-hint">支持 TXT、PDF、DOC、DOCX、CSV、图片等格式</div>
          <div class="drop-formats">
            <span class="format-tag">.txt</span>
            <span class="format-tag">.pdf</span>
            <span class="format-tag">.doc</span>
            <span class="format-tag">.docx</span>
            <span class="format-tag">.csv</span>
            <span class="format-tag">.md</span>
            <span class="format-tag">.png</span>
            <span class="format-tag">.jpg</span>
            <span class="format-tag">.gif</span>
          </div>
        </div>
        <input type="file" id="fileInput" accept=".txt,.pdf,.doc,.docx,.csv,.md,.json,.png,.jpg,.jpeg,.gif,.webp,.bmp" style="display:none;" />
        <div id="selectedFileArea"></div>
        <div id="fileContentPreview"></div>
      </div>
      <div class="doc-platform-select">
        <div class="upload-form-item">
          <label class="upload-form-label">关联平台（可选）</label>
          <div class="custom-select-wrap" id="filePlatformWrap">
            <div class="custom-select-display" id="filePlatformDisplay">
              <span id="filePlatformText">${_ppLabel}</span>
              <span class="custom-select-arrow">▾</span>
            </div>
            <div class="custom-select-dropdown hidden" id="filePlatformDropdown">
              <div class="custom-select-option ${!_pp ? 'selected' : ''}" data-value="">-- 自动识别 --</div>
              ${PLATFORMS.map(p => `<div class="custom-select-option ${p.name === _pp ? 'selected' : ''}" data-value="${p.name}">${p.icon} ${p.name}</div>`).join('')}
            </div>
          </div>
          <input type="hidden" id="filePlatformValue" value="${_pp}" />
        </div>
      </div>
      <button class="btn-ai-parse disabled" id="fileParseBtn">
        <i class="ri-robot-line" style="font-size:20px;"></i> AI 解析并入库
      </button>
      <div id="fileParseResultArea"></div>
    `;
    // 绑定拖拽和点击上传
    const dropZone = document.getElementById('fileDropZone');
    const fileInput = document.getElementById('fileInput');

    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('drag-over'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault(); dropZone.classList.remove('drag-over');
      if (e.dataTransfer.files.length > 0) handleFileSelect(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', () => {
      if (fileInput.files.length > 0) handleFileSelect(fileInput.files[0]);
    });
    // 绑定解析按钮
    document.getElementById('fileParseBtn').addEventListener('click', onDocParseFile);
    // 初始化平台下拉
    initCustomSelect('filePlatformWrap', 'filePlatformDisplay', 'filePlatformDropdown', 'filePlatformText', 'filePlatformValue');


}
}

// 处理文件选择
function handleFileSelect(file) {
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) { showToast('文件大小不能超过10MB'); return; }

  docUploadState.selectedFile = file;
  const sizeStr = file.size < 1024 ? file.size + 'B' :
    file.size < 1048576 ? (file.size / 1024).toFixed(1) + 'KB' :
    (file.size / 1048576).toFixed(1) + 'MB';

  // 文件图标映射
  const ext = file.name.split('.').pop().toLowerCase();
  const iconMap = { txt: '📄', pdf: '📕', doc: '📘', docx: '📘', csv: '📊', md: '📝', json: '📋' };
  const icon = iconMap[ext] || '📎';

  const selectedArea = document.getElementById('selectedFileArea');
  selectedArea.innerHTML = `
    <div class="selected-file-info">
      <span class="file-icon">${icon}</span>
      <div class="file-detail">
        <div class="file-name">${file.name}</div>
        <div class="file-size">${sizeStr}</div>
      </div>
      <button class="file-remove" id="removeFileBtn">✕</button>
    </div>
  `;
  document.getElementById('removeFileBtn').addEventListener('click', () => {
    docUploadState.selectedFile = null;
    docUploadState.selectedFileContent = '';
    selectedArea.innerHTML = '';
    document.getElementById('fileContentPreview').innerHTML = '';
    document.getElementById('fileDropZone').style.display = '';
    document.getElementById('fileParseBtn').classList.add('disabled');
  });

  // 隐藏拖拽区
  document.getElementById('fileDropZone').style.display = 'none';

  // 读取文件内容（仅文本类）
  const textExts = ['txt', 'csv', 'md', 'json'];
  if (textExts.includes(ext)) {
    const reader = new FileReader();
    reader.onload = (e) => {
      docUploadState.selectedFileContent = e.target.result;
      const preview = document.getElementById('fileContentPreview');
      const previewText = e.target.result.length > 2000 ? e.target.result.substring(0, 2000) + '\n\n... (内容已截断，共' + e.target.result.length + '个字符)' : e.target.result;
      preview.innerHTML = `<div class="file-content-preview">${previewText}</div>`;
      document.getElementById('fileParseBtn').classList.remove('disabled');
    };
    reader.readAsText(file);
  } else {
    // 非文本文件，模拟提取
    docUploadState.selectedFileContent = `[文件: ${file.name}]\n\n模拟从${ext.toUpperCase()}文件中提取的文本内容。\n\n实际项目中，此处会调用后端PDF/DOC解析服务提取文本。`;
    const preview = document.getElementById('fileContentPreview');
    preview.innerHTML = `<div class="file-content-preview" style="color:#999;font-style:italic;">⚠️ ${ext.toUpperCase()}文件将在AI解析时由服务端提取内容</div>`;
    document.getElementById('fileParseBtn').classList.remove('disabled');
  }
}

// 处理图片选择
function handleImageSelect(file) {
  if (!file.type.startsWith('image/')) { showToast('请选择图片文件'); return; }
  if (file.size > 10 * 1024 * 1024) { showToast('图片大小不能超过10MB'); return; }

  const reader = new FileReader();
  reader.onload = (e) => {
    docUploadState.selectedImage = e.target.result;

    // 隐藏上传区
    document.getElementById('imageUploadZone').style.display = 'none';

    // 显示预览
    const imgArea = document.getElementById('selectedImageArea');
    imgArea.innerHTML = `
      <div class="selected-image-preview">
        <img src="${e.target.result}" alt="上传图片" />
        <button class="img-remove" id="removeImageBtn">✕</button>
      </div>
    `;
    document.getElementById('removeImageBtn').addEventListener('click', () => {
      docUploadState.selectedImage = null;
      docUploadState.ocrText = '';
      imgArea.innerHTML = '';
      document.getElementById('ocrResultArea').innerHTML = '';
      document.getElementById('imageUploadZone').style.display = '';
      document.getElementById('imageParseBtn').classList.add('disabled');
    });

    // 模拟OCR识别
    showLoading('OCR识别中...');
    setTimeout(() => {
      hideLoading();
      docUploadState.ocrText = '模拟OCR识别结果：\n\n2026年Q1 Twitch主播合作数据报告\n\n合作主播总数：48人\n覆盖观众：520万\n品牌曝光次数：1200万+\n平均CPV：$0.42\n订阅转化率：3.8%\n\n表现最佳合作：\n1. xxx_streamer: CCV 12K，带来转化$8500\n2. game_master: CCV 8K，社区讨论度最高';
      
      const ocrArea = document.getElementById('ocrResultArea');
      ocrArea.innerHTML = `
        <div class="ocr-result-area">
          <div class="ocr-result-label"><i class="ri-scan-line" style="color:#6C3CE1;"></i> OCR 识别结果：</div>
          <textarea class="ocr-textarea" id="ocrTextarea">${docUploadState.ocrText}</textarea>
        </div>
      `;
      document.getElementById('ocrTextarea').addEventListener('input', (e) => {
        docUploadState.ocrText = e.target.value;
      });
      document.getElementById('imageParseBtn').classList.remove('disabled');
    }, 1500);
  };
  reader.readAsDataURL(file);
}

// AI解析 - 文本模式
function onDocParseText() {
  const text = document.getElementById('docTextInput')?.value.trim();
  if (!text) { showToast('请先输入文本内容'); return; }
  const platform = document.getElementById('docPlatformValue')?.value || '';
  doAIParse(text, platform, 'docParseResultArea');
}

// AI解析 - 文件模式
function onDocParseFile() {
  if (!docUploadState.selectedFileContent) { showToast('请先上传文件'); return; }
  const platform = document.getElementById('filePlatformValue')?.value || '';
  doAIParse(docUploadState.selectedFileContent, platform, 'fileParseResultArea');
}

// AI解析 - 图片模式
function onDocParseImage() {
  if (!docUploadState.ocrText) { showToast('请先上传图片并识别'); return; }
  const platform = document.getElementById('imgPlatformValue')?.value || '';
  doAIParse(docUploadState.ocrText, platform, 'imageParseResultArea');
}

// 通用AI解析逻辑
function doAIParse(text, forcePlatform, resultAreaId) {
  docUploadState.isParsing = true;
  showLoading('AI 解析中...');
  
  setTimeout(() => {
    hideLoading();
    docUploadState.isParsing = false;

    // 模拟AI解析
    const result = mockAIParse(text, forcePlatform);
    docUploadState.parseResult = result;

    const area = document.getElementById(resultAreaId);
    area.innerHTML = `
      <div class="parse-result-card" style="margin-top:20px;">
        <div class="parse-result-header">
          <div class="parse-result-title">🎯 AI 解析结果</div>
          <div class="parse-result-hint">请确认信息无误后入库</div>
        </div>
        <div class="parse-result-item">
          <span class="parse-result-label">标题</span>
          <span class="parse-result-value">${result.title}</span>
        </div>
        <div class="parse-result-item">
          <span class="parse-result-label">平台</span>
          <span class="parse-result-value"><span class="tag-platform tag-${platformClassMap[result.platform] || 'youtube'}">${result.platform}</span></span>
        </div>
        <div class="parse-result-item">
          <span class="parse-result-label">分类</span>
          <span class="parse-result-value"><span class="tag-category tag-${categoryClassMap[result.category] || 'promotion'}">${result.category}</span></span>
        </div>
        <div class="parse-result-item">
          <span class="parse-result-label">内容摘要</span>
          <span class="parse-result-value parse-result-content">${result.content}</span>
        </div>
        <div class="parse-result-actions">
          <button class="parse-result-btn confirm-btn" id="parseConfirmSave">✅ 确认入库</button>
          <button class="parse-result-btn retry-btn" id="parseRetry">🔄 重新解析</button>
        </div>
      </div>
    `;

    document.getElementById('parseConfirmSave').addEventListener('click', () => {
      onParseConfirmSave(result);
    });
    document.getElementById('parseRetry').addEventListener('click', () => {
      area.innerHTML = '';
      showToast('请重新输入内容后解析');
    });
  }, 1500);
}

// AI解析模拟 - 关键词匹配
function mockAIParse(text, forcePlatform) {
  const textLower = text.toLowerCase();

  let platform = forcePlatform || 'YouTube';
  if (!forcePlatform) {
    const platformKeywords = {
      'YouTube': ['youtube', 'yt', '油管', '视频', 'shorts', 'channel', 'subscriber', '频道'],
      'Twitch': ['twitch', '直播', 'stream', 'streamer', '主播', 'live', 'cpv', 'bounty', 'cspon'],
      'Discord': ['discord', '服务器', 'server', 'bot', '机器人'],
      'TikTok': ['tiktok', '抖音', '短视频', 'douyin', 'viral'],
      'Reddit': ['reddit', 'subreddit', '帖子', 'post', 'karma'],
    };
    for (const [name, keywords] of Object.entries(platformKeywords)) {
      if (keywords.some(kw => textLower.includes(kw))) { platform = name; break; }
    }
  }

  let category = '推广';
  const categoryKeywords = {
    '推广': ['推广', '广告', 'ads', 'promotion', '营销', 'marketing', '投放', '曝光', '引流', 'sponsor', 'cpv'],
    '运营': ['运营', 'operation', '管理', '社区', 'community', '活动', '增长', 'growth', '留存', '用户', '数据'],
    '技术': ['技术', 'tech', 'api', 'sdk', '开发', 'develop', '集成', 'integration', '代码', 'webhook'],
  };
  for (const [name, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(kw => textLower.includes(kw))) { category = name; break; }
  }

  // 标题提取
  let title = '';
  const firstLine = text.split('\n').filter(l => l.trim())[0] || '';
  if (firstLine.length <= 50) {
    title = firstLine.replace(/^[【\[#*]+/, '').replace(/[】\]]+$/, '').trim();
  } else {
    title = firstLine.substring(0, 30).trim() + '...';
  }
  if (!title) title = `${platform}平台${category}策略情报`;

  let content = text.trim().replace(/\n{3,}/g, '\n\n');

  return { platform, category, title, content };
}

// 确认入库
function onParseConfirmSave(result) {
  showLoading('正在入库...');
  setTimeout(() => {
    hideLoading();
    const newId = generateId();
    var vis = docUploadState.docVisibility || 'public';
    state.strategyList.unshift(processItem({
      _id: newId,
      title: result.title,
      content: result.content,
      platform: result.platform,
      category: result.category,
      source_type: vis === 'internal' ? 'internal' : 'public',
      channel: '',
      url: '',
      update_time: new Date().toISOString()
    }));

    // 同步到文档列表
    state.documentList.unshift({
      _id: 'doc_' + newId,
      title: result.title,
      content: result.content,
      platform: result.platform,
      docType: vis === 'internal' ? 'internal_report' : 'other',
      source: 'ai_parse',
      fileType: 'text',
      fileSize: (new Blob([result.content || '']).size / 1024).toFixed(1) + 'KB',
      upload_time: new Date().toISOString()
    });

    // 更新平台版本号
    const pf = PLATFORMS.find(p => p.name === result.platform);
    if (pf) {
      const num = parseFloat(pf.version.replace('v', ''));
      pf.version = 'v' + (num + 1).toFixed(1);
    }

    RECENT_LOGS.unshift({
      type: 'upload', title: '上传文档解析入库',
      desc: `[${result.platform}] ${result.title}`,
      time: formatFullTime(new Date().toISOString())
    });

    showToast('入库成功！');
    setTimeout(() => {
      renderHome();
      switchView('home');
    }, 800);
  }, 1000);
}

// ========== 报告解析确认弹窗 ==========
function showParseModal(originalContent, title, platform, channel) {
  const modal = document.getElementById('parseModal');
  modal.classList.remove('hidden');

  // 原始内容
  document.getElementById('originalContent').textContent = originalContent || '（无内容）';
  document.getElementById('originalContent').classList.add('hidden');
  document.getElementById('toggleArrow').textContent = '▾ 展开';

  // 模拟AI提炼
  const refined = mockRefineContent(originalContent, title);
  document.getElementById('refinedContent').value = refined;

  // 存储弹窗上下文
  modal.dataset.title = title;
  modal.dataset.platform = platform;
  modal.dataset.channel = channel;
  modal.dataset.originalContent = originalContent;
}

function mockRefineContent(content, title) {
  if (!content) return '';
  // 模拟AI自动提炼关键数据
  const lines = content.split('\n').filter(l => l.trim());
  const keyLines = lines.filter(l =>
    /\d/.test(l) || l.includes('：') || l.includes(':') || l.includes('增长') ||
    l.includes('下降') || l.includes('新增') || l.includes('建议') || l.includes('关键')
  ).slice(0, 8);
  if (keyLines.length > 0) return keyLines.join('\n');
  return lines.slice(0, 5).join('\n');
}

function hideParseModal() {
  document.getElementById('parseModal').classList.add('hidden');
}

function onModalConfirm() {
  const modal = document.getElementById('parseModal');
  const refined = document.getElementById('refinedContent').value.trim();
  const title = modal.dataset.title;
  const platform = modal.dataset.platform;
  const channel = modal.dataset.channel;
  const original = modal.dataset.originalContent;

  hideParseModal();

  // 组合最终内容：提炼内容 + 原始内容
  const finalContent = refined ? refined + '\n\n--- 原始报告 ---\n' + original : original;
  const finalTitle = title || (channel ? `${platform || '通用'} - ${channel} 内部项目报告` : `${platform || '通用'} 内部项目报告`);

  doSave(finalTitle, finalContent, platform, 'internal_report', channel);
}

// ========== 文档管理页 ==========
const DOC_TYPE_LABELS = {
  'competitive_intel': '竞品情报', 'data_report': '数据报告',
  'plan_doc': '计划方案', 'progress_tracking': '进度跟踪',
  'user_feedback': '用户反馈', 'weekly_report': '周报', 'other': '其他',
};
const DOC_TYPE_ICONS = {
  'competitive_intel': '🔍', 'data_report': '📊',
  'plan_doc': '📋', 'progress_tracking': '📌',
  'user_feedback': '💬', 'weekly_report': '📰', 'other': '📎',
};
const FILE_TYPE_ICONS = {
  'text': '📄', 'pdf': '📕', 'doc': '📘', 'docx': '📘',
  'csv': '📊', 'md': '📝', 'json': '📋', 'image': '🖼️',
};

async function renderDocManage() {
  state.docFilter = 'all';
  state.docSearchKeyword = '';
  switchView('doc-manage');
  // 从后端加载文档列表
  showLoading('加载文档...');
  try {
    const res = await fetch('/api/documents');
    const data = await res.json();
    state.documentList = (data.code === 0 ? data.data : []) || [];
  } catch(e) {
    state.documentList = [];
  }
  hideLoading();
  renderDocList();
}

function renderDocList() {
  let list = [...state.documentList];

  // 搜索过滤
  if (state.docSearchKeyword) {
    const kw = state.docSearchKeyword.toLowerCase();
    list = list.filter(d =>
      (d.title || d.filename || '').toLowerCase().includes(kw) ||
      (d.platform_name || d.platform || '').toLowerCase().includes(kw) ||
      (d.game_name || '').toLowerCase().includes(kw) ||
      (d.content || '').toLowerCase().includes(kw)
    );
  }

  // 类型过滤（兼容 doc_type / docType 字段）
  if (state.docFilter && state.docFilter !== 'all') {
    list = list.filter(d => (d.docType || d.doc_type) === state.docFilter);
  }

  // 按时间排序（最新优先）
  list.sort((a, b) => new Date(b.upload_time || b.created_at) - new Date(a.upload_time || a.created_at));

  // 统计栏
  const statsBar = document.getElementById('docStatsBar');
  statsBar.innerHTML = `
    <span>共 <span class="stats-count">${list.length}</span> 份内部文档</span>
    <span class="stats-sort" id="docSortBtn">
      <i class="ri-sort-desc"></i> 最新优先
    </span>
  `;

  // 文档列表
  const container = document.getElementById('docListContainer');
  if (!list.length) {
    container.innerHTML = `
      <div class="doc-empty">
        <span class="doc-empty-icon">📂</span>
        <span class="doc-empty-text">${state.docSearchKeyword ? '没有找到匹配的内部文档' : '暂无内部项目文档'}</span>
        <span class="doc-empty-hint">${state.docSearchKeyword ? '试试其他搜索条件' : '上传内部文档后将在此处展示'}</span>
        <button class="doc-empty-btn" id="docEmptyUploadBtn">
          <i class="ri-upload-cloud-line"></i> 去上传文档
        </button>
      </div>
    `;
    const emptyBtn = document.getElementById('docEmptyUploadBtn');
    if (emptyBtn) emptyBtn.addEventListener('click', () => renderDocUploadPage());
    return;
  }

  container.innerHTML = `<div class="doc-list-grid">${list.map(doc => {
    // 兼容后端字段（filename/doc_type/platform_name/created_at）
    const title = doc.title || doc.filename || '未命名文档';
    const docType = doc.docType || doc.doc_type || 'other';
    const fileType = doc.fileType || doc.file_type || '';
    const platform = doc.platform_name || doc.platform || '通用';
    const uploadTime = doc.upload_time || doc.created_at || '';
    const docId = doc._id || doc.id;
    const typeLabel = DOC_TYPE_LABELS[docType] || '其他';
    const typeIcon = DOC_TYPE_ICONS[docType] || '📎';
    const pfObj = PLATFORMS.find(p => p.name === platform);
    const pfLabel = pfObj ? `${pfObj.icon} ${pfObj.name}` : platform;
    const timeStr = formatFullTime(uploadTime);
    const sourceLabel = doc.source === 'ai_parse' ? 'AI解析' : doc.source === 'upload' ? '文件上传' : '手动录入';
    const gameName = doc.game_name ? `· ${doc.game_name}` : '';
    const summary = doc.content ? doc.content.substring(0, 100).replace(/\n/g, ' ') + '...' : (doc.filename || '');

    const gameTag = doc.game_name ? `<span class="doc-game-tag"><i class="ri-gamepad-line"></i> ${doc.game_name}</span>` : '';
    const fileTypeBadge = fileType && fileType !== 'txt'
      ? `<span class="doc-file-type-badge ${fileType}">${fileType.toUpperCase()}</span>` : '';
    const hasOriginalFile = fileType && fileType !== 'txt' && fileType !== '';
    const fileTypeIconMap = {pdf:'ri-file-pdf-2-line',docx:'ri-file-word-line',doc:'ri-file-word-line',txt:'ri-file-text-line',xlsx:'ri-file-excel-line',pptx:'ri-file-pptx-line',csv:'ri-file-list-line'};

    return `
      <div class="doc-card" data-doc-id="${docId}">
        <div class="doc-card-header">
          <div class="doc-card-icon ${docType}">
            <i class="${typeIcon}"></i>
          </div>
          <div class="doc-card-title">${docTitle}${gameTag}${fileTypeBadge}</div>
          <span class="doc-card-status ${doc.status || 'applied'}">${doc.status === 'pending' ? '待处理' : '已应用'}</span>
        </div>
        <div class="doc-card-meta">
          <span>${platform} · ${typeLabel} · ${timeStr}</span>
          <div class="doc-card-actions">
            ${hasOriginalFile ? `<button class="doc-action-btn view-original" data-action="original" data-doc-id="${docId}" data-file-type="${fileType}"><i class="${fileTypeIconMap[fileType]||'ri-file-line'}"></i> 原始文件</button>` : ''}
            <button class="doc-action-btn extract-keypoints" data-action="keypoints" data-doc-id="${docId}"><i class="ri-lightbulb-flash-line"></i> 关键点</button>
            <button class="doc-action-btn delete" data-action="delete" data-doc-id="${docId}"><i class="ri-delete-bin-line"></i> 删除</button>
          </div>
        </div>
      </div>`;
  }).join('')}</div>`;

  // 绑定文档卡片操作事件
  container.querySelectorAll('.doc-action-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const action = btn.dataset.action;
      const docId = btn.dataset.docId;
      if (action === 'keypoints') showDocKeypoints(docId);
      else if (action === 'original') showDocOriginal(docId, btn.dataset.fileType);
      else if (action === 'delete') onDocDelete(docId);
    });
  });
}

function onDocView(docId) {
  showDocKeypoints(docId);
}

// 关键点弹窗（展示AI解析的content内容）
async function showDocKeypoints(docId) {
  let overlay = document.getElementById('docKeypointsOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'docKeypointsOverlay';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);';
    document.body.appendChild(overlay);
  }
  overlay.innerHTML = `
    <div class="kp-panel">
      <div class="kp-header">
        <div class="kp-header-title"><i class="ri-lightbulb-flash-line"></i> <span id="kpTitle">加载中...</span></div>
        <button class="kp-close-btn" id="kpClose"><i class="ri-close-line"></i></button>
      </div>
      <div class="kp-meta-bar" id="kpMeta"></div>
      <div class="kp-body" id="kpBody"><div class="kp-loading"><div class="spinner-sm"></div><p>加载中...</p></div></div>
    </div>`;
  overlay.style.display = 'flex';
  document.getElementById('kpClose').onclick = () => { overlay.style.display='none'; };
  overlay.onclick = (e) => { if(e.target===overlay) overlay.style.display='none'; };

  try {
    const res = await fetch('/api/documents/' + docId);
    const data = await res.json();
    if (data.code !== 0 || !data.data) { document.getElementById('kpBody').innerHTML = '<div class="kp-empty">加载失败</div>'; return; }
    const doc = data.data;
    document.getElementById('kpTitle').textContent = doc.filename || '文档内容';
    document.getElementById('kpMeta').innerHTML =
      `<span class="kp-tag"><i class="ri-calendar-line"></i> ${doc.created_at||''}</span>` +
      `<span class="kp-tag"><i class="ri-database-2-line"></i> ${doc.platform_name||'通用'}</span>` +
      (doc.game_name?`<span class="kp-tag"><i class="ri-gamepad-line"></i> ${doc.game_name}</span>`:'') +
      `<span class="kp-tag kp-tag-status">${doc.status==='pending'?'待处理':'已应用'}</span>`;
    const content = doc.content || '';
    const lines = content.split('\n').map(l=>l.trim()).filter(l=>l);
    if (!lines.length) { document.getElementById('kpBody').innerHTML = '<div class="kp-empty">暂无解析内容</div>'; return; }
    document.getElementById('kpBody').innerHTML = '<div class="kp-lines">' +
      lines.map(l=>`<div class="kp-line">${l.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div>`).join('') +
      '</div>';
  } catch(e) {
    document.getElementById('kpBody').innerHTML = '<div class="kp-empty">加载失败</div>';
  }
}

// 原始文件弹窗（展示original_content或PDF预览）
async function showDocOriginal(docId, fileType) {
  let overlay = document.getElementById('docOriginalOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'docOriginalOverlay';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);';
    document.body.appendChild(overlay);
  }
  overlay.innerHTML = `
    <div class="of-panel">
      <div class="of-header">
        <div class="of-header-title"><i class="ri-file-line"></i> <span id="ofTitle">加载中...</span></div>
        <div class="of-header-actions">
          <a class="of-download-btn" id="ofDownload" href="/api/documents/${docId}/file" target="_blank"><i class="ri-download-line"></i> 下载</a>
          <button class="kp-close-btn" id="ofClose"><i class="ri-close-line"></i></button>
        </div>
      </div>
      <div class="of-body" id="ofBody"><div class="kp-loading"><div class="spinner-sm"></div><p>加载文档...</p></div></div>
    </div>`;
  overlay.style.display = 'flex';
  document.getElementById('ofClose').onclick = () => { overlay.style.display='none'; };
  overlay.onclick = (e) => { if(e.target===overlay) overlay.style.display='none'; };

  try {
    const res = await fetch('/api/documents/' + docId);
    const data = await res.json();
    if (data.code !== 0 || !data.data) { document.getElementById('ofBody').innerHTML = '<div class="kp-empty">加载失败</div>'; return; }
    const doc = data.data;
    document.getElementById('ofTitle').textContent = doc.filename || '原始文档';
    const ft = fileType || doc.file_type || 'txt';
    if (ft === 'pdf') {
      document.getElementById('ofBody').innerHTML = `<div class="of-pdf-wrap"><iframe src="/api/documents/${docId}/file" class="of-iframe" title="PDF预览"></iframe></div>`;
    } else {
      const content = doc.original_content || doc.content || '';
      const lines = content.split('\n').map(l=>l.trim()).filter(l=>l);
      document.getElementById('ofBody').innerHTML =
        `<div class="of-info-bar"><span class="of-badge"><i class="ri-file-line"></i> ${ft.toUpperCase()}</span><span class="of-info-tip">解析后文本，点击右上角下载原始文件</span></div>` +
        `<div class="of-text-content">${lines.map(l=>`<div class="of-text-line">${l.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div>`).join('')}</div>`;
    }
  } catch(e) {
    document.getElementById('ofBody').innerHTML = '<div class="kp-empty">加载失败</div>';
  }
}

function onDocDownload(docId) {
  const doc = state.documentList.find(d => (d._id || d.id) == docId);
  if (!doc) { showToast('文档不存在'); return; }

  // 生成文件内容并触发下载
  const content = `【内部文档】\n标题：${doc.title || doc.filename || '未命名'}\n平台：${doc.platform_name || doc.platform || '通用'}\n类型：${DOC_TYPE_LABELS[doc.doc_type || doc.docType] || '其他'}\n上传时间：${formatFullTime(doc.created_at || doc.upload_time)}\n${'='.repeat(50)}\n\n${doc.content || ''}`;

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(doc.title || doc.filename || '未命名文档').replace(/[\/\\:*?"<>|]/g, '_')}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('文档下载成功');
}

function onDocDelete(docId) {
  const doc = state.documentList.find(d => (d._id || d.id) == docId);
  if (!doc) return;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-box" style="border-radius:20px;max-width:400px;padding:28px 24px;">
      <div class="modal-header">
        <span class="modal-icon">🗑️</span>
        <span class="modal-title">确认删除文档</span>
      </div>
      <div style="font-size:14px;color:#555;line-height:1.7;margin-bottom:20px;">
        确定要删除以下文档吗？此操作不可撤销。<br>
        <span style="color:#E65100;font-weight:600;">"${doc.title || doc.filename || '未命名'}"</span>
      </div>
      <div class="modal-actions">
        <button class="modal-btn cancel" id="docDelCancel">取消</button>
        <button class="modal-btn" id="docDelConfirm" style="background:linear-gradient(135deg,#c62828,#e53935);color:#fff;box-shadow:0 4px 14px rgba(198,40,40,0.3);">
          <i class="ri-delete-bin-line"></i> 确认删除
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  document.getElementById('docDelCancel').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
  document.getElementById('docDelConfirm').addEventListener('click', async () => {
    overlay.remove();
    showLoading('删除中...');
    try {
      const res = await fetch('/api/documents/' + docId, { method: 'DELETE' });
      const data = await res.json();
      if (data.code === 0) {
        const idx = state.documentList.findIndex(d => (d._id || String(d.id)) === String(docId));
        if (idx !== -1) state.documentList.splice(idx, 1);
        showToast('文档已删除');
        renderDocList();
      } else {
        showToast(data.msg || '删除失败');
      }
    } catch(e) {
      // fallback: 仅从内存删除
      const idx = state.documentList.findIndex(d => (d._id || String(d.id)) === String(docId));
      if (idx !== -1) state.documentList.splice(idx, 1);
      showToast('文档已删除');
      renderDocList();
    }
    hideLoading();
  });
}

// ========== 事件绑定 ==========
function initEvents() {
  // 侧边栏导航按钮点击
  document.getElementById('sidebarNav').addEventListener('click', e => {
    const btn = e.target.closest('.sidebar-tab');
    if (!btn) return;
    const view = btn.dataset.view;
    document.querySelectorAll('.sidebar-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    if (view === 'home') { renderHome(); switchView('home'); }
    else if (view === 'ask') { initCommAsk(); switchView('ask'); }
    else if (view === 'doc-upload') { renderDocUploadPage(); }
    else if (view === 'doc-manage') { checkPassword(function() { renderDocManage(); }, '内部文档已加密'); }
    else if (view === 'logs') { renderLogs(); }
  });

  // 首页 - 平台卡片点击
  document.getElementById('platformGrid').addEventListener('click', e => {
    const card = e.target.closest('.platform-card');
    if (card) renderPlatformDetail(card.dataset.platform);
  });

  // 首页 - 快捷操作
  document.getElementById('quickActions').addEventListener('click', e => {
    const item = e.target.closest('.quick-action-item');
    if (!item) return;
    const action = item.dataset.action;
    if (action === 'upload') renderDocUploadPage();
    else if (action === 'ask') { initCommAsk(); switchView('ask'); }
    else if (action === 'log') renderLogs();
    else if (action === 'doc') checkPassword(function() { renderDocManage(); }, '内部文档已加密');
  });

  // 首页 - 刷新
  document.getElementById('refreshHomeBtn').addEventListener('click', () => {
    showLoading('同步数据中...');
    setTimeout(() => { hideLoading(); showToast('数据已更新'); renderHome(); }, 1500);
  });

  // 平台详情 - 返回
  document.getElementById('platformBackBtn').addEventListener('click', () => {
    state.currentPlatform = null;
    renderHome();
    switchView('home');
  });

  // 平台详情 - 分类Tab切换
  document.addEventListener('click', e => {
    const tab = e.target.closest('.tab-item');
    if (!tab || !state.currentPlatform) return;
    const cat = tab.dataset.cat;
    document.querySelectorAll('#platformCatTabs .tab-item').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    state.activeCategory = cat;
    renderPlatformStrategies(state.currentPlatform.name, cat);
  });

  // 平台详情 - 策略卡片点击
  document.addEventListener('click', e => {
    const card = e.target.closest('.strategy-card');
    if (card && state.currentView === 'platform') renderDetail(card.dataset.id);
  });

  // 平台详情 - 上传新策略
  document.addEventListener('click', e => {
    if (e.target.closest('#platformUploadBtn')) {
      renderDocUploadPage(state.currentPlatform?.name || '');
    }
    if (e.target.closest('#platformUpdateBtn')) {
      showLoading('更新策略中...');
      setTimeout(() => { hideLoading(); showToast('策略已更新'); }, 1500);
    }
  });

  // 平台详情 - 刷新
  document.getElementById('refreshPlatformBtn').addEventListener('click', () => {
    if (state.currentPlatform) {
      showLoading('刷新中...');
      setTimeout(() => { hideLoading(); renderPlatformDetail(state.currentPlatform.name); showToast('已刷新'); }, 1000);
    }
  });

  // 策略详情 - 返回
  document.getElementById('detailBackBtn').addEventListener('click', () => {
    if (state.currentPlatform) {
      renderPlatformDetail(state.currentPlatform.name);
    } else {
      renderHome();
      switchView('home');
    }
  });

  // 录入页 - 返回
  document.getElementById('uploadBackBtn')?.addEventListener('click', () => {
    if (state.currentPlatform) {
      renderPlatformDetail(state.currentPlatform.name);
    } else {
      renderHome();
      switchView('home');
    }
  });

  // 录入页 - 刷新
  document.getElementById('uploadRefreshBtn').addEventListener('click', () => {
    renderUploadPage(state.uploadEditData, state.currentPlatform?.name || '');
    showToast('已重置表单');
  });

  // 文档管理页 - 返回
  document.getElementById('docManageBackBtn')?.addEventListener('click', () => {
    renderHome();
    switchView('home');
  });

  // 文档管理页 - 上传按钮
  document.getElementById('docManageUploadBtn').addEventListener('click', () => {
    renderDocUploadPage();
  });

  // 文档管理页 - 搜索
  document.getElementById('docSearchInput').addEventListener('input', (e) => {
    state.docSearchKeyword = e.target.value.trim();
    const clearBtn = document.getElementById('docSearchClear');
    clearBtn.classList.toggle('hidden', !state.docSearchKeyword);
    renderDocList();
  });
  document.getElementById('docSearchClear').addEventListener('click', () => {
    document.getElementById('docSearchInput').value = '';
    state.docSearchKeyword = '';
    document.getElementById('docSearchClear').classList.add('hidden');
    renderDocList();
  });

  // 上传文档页 - 返回
  document.getElementById('docUploadBackBtn')?.addEventListener('click', () => {
    if (state.currentPlatform) {
      renderPlatformDetail(state.currentPlatform.name);
    } else {
      renderHome();
      switchView('home');
    }
  });

  // 上传文档页 - 刷新
  document.getElementById('docUploadRefreshBtn').addEventListener('click', () => {
    renderDocUploadPage(docUploadState.presetPlatform || '');
    showToast('已重置');
  });

  // 上传文档页 - Tab切换
  document.getElementById('docUploadTabs').addEventListener('click', (e) => {
    const tab = e.target.closest('.doc-tab');
    if (!tab) return;
    const mode = tab.dataset.mode;
    updateDocUploadTabs(mode);
    renderDocUploadContent(mode);
  });

  // 弹窗 - 关闭
  document.getElementById('modalCloseBtn').addEventListener('click', hideParseModal);
  document.getElementById('modalCancelBtn').addEventListener('click', hideParseModal);

  // 弹窗 - 确认
  document.getElementById('modalConfirmBtn').addEventListener('click', onModalConfirm);

  // 弹窗 - 展开/收起原始内容
  document.getElementById('toggleOriginal').addEventListener('click', () => {
    const content = document.getElementById('originalContent');
    const arrow = document.getElementById('toggleArrow');
    if (content.classList.contains('hidden')) {
      content.classList.remove('hidden');
      arrow.textContent = '▴ 收起';
    } else {
      content.classList.add('hidden');
      arrow.textContent = '▾ 展开';
    }
  });
}


// ==================== 智能提问（Community） ====================
const commAskState = { messages: [], sending: false, initialized: false };

function initCommAsk() {
  if (commAskState.initialized) return;
  commAskState.initialized = true;
  document.querySelectorAll('#view-ask .ask-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      document.getElementById('comm-ask-input').value = tag.dataset.q;
      commSendQuestion();
    });
  });
  document.getElementById('comm-ask-send').addEventListener('click', commSendQuestion);
  document.getElementById('comm-ask-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commSendQuestion(); }
  });
}

async function commSendQuestion() {
  const input = document.getElementById('comm-ask-input');
  const question = input.value.trim();
  if (!question || commAskState.sending) return;
  commAskState.sending = true;
  document.getElementById('comm-ask-send').disabled = true;
  const hero = document.getElementById('comm-ask-hero');
  const tags = document.getElementById('comm-ask-quick-tags');
  if (hero) hero.style.display = 'none';
  if (tags) tags.style.display = 'none';
  commAskState.messages.push({ type: 'user', content: question });
  commRenderMessages();
  input.value = '';
  commAskState.messages.push({ type: 'loading' });
  commRenderMessages();
  try {
    const res = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question })
    }).then(r => r.json());
    commAskState.messages = commAskState.messages.filter(m => m.type !== 'loading');
    if (res.code === 0 && res.data) {
      commAskState.messages.push({ type: 'bot', content: res.data.answer || '未找到相关信息', sources: res.data.sources || [] });
    } else {
      commAskState.messages.push({ type: 'bot', content: res.msg || '查询失败，请稍后重试' });
    }
  } catch (e) {
    commAskState.messages = commAskState.messages.filter(m => m.type !== 'loading');
    commAskState.messages.push({ type: 'bot', content: '网络请求失败，请检查网络后重试' });
  }
  commAskState.sending = false;
  document.getElementById('comm-ask-send').disabled = false;
  commRenderMessages();
}

function commRenderMessages() {
  const area = document.getElementById('comm-ask-chat-area');
  if (!area) return;
  area.innerHTML = commAskState.messages.map(msg => {
    if (msg.type === 'loading') {
      return '<div class="ask-loading"><div class="ask-loading-dots"><span></span><span></span><span></span></div><span class="ask-loading-text">思考中...</span></div>';
    }
    const cls = msg.type === 'user' ? 'ask-msg user' : 'ask-msg bot';
    const label = msg.type === 'user' ? '我' : '🤖 策略助手';
    let sourcesHtml = '';
    if (msg.sources && msg.sources.length > 0) {
      sourcesHtml = '<div class="ask-msg-sources">' + msg.sources.map(s => '<span class="ask-source-tag"><i class="ri-bookmark-line"></i> ' + s + '</span>').join('') + '</div>';
    }
    const escaped = msg.content.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>');
    return '<div class="' + cls + '"><div class="ask-msg-bubble">' + escaped + sourcesHtml + '</div><div class="ask-msg-label">' + label + '</div></div>';
  }).join('');
  area.scrollTop = area.scrollHeight;
}

// ========== 初始化 ==========
function init() {
  state.strategyList = INITIAL_DATA.map(item => processItem(item));
  state.documentList = [...UPLOADED_DOCS];
  renderHome();
  initEvents();
}

document.addEventListener("DOMContentLoaded", init);

// ========== 暴露全局函数（供 HTML inline onclick 使用，因 type=module 限制）==========
window.updateDocUploadTabs = updateDocUploadTabs;
window.renderDocUploadContent = renderDocUploadContent;
