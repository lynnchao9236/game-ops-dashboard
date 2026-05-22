import json
import os
from datetime import datetime

# 导入数据库操作封装模块
import wxcloud_db

strategies = {}

# ========================================================================
# Steam (platform_id=1) — 推广资源 promotion
# ========================================================================
strategies[1] = {"sections":[
    {"title":"2026年四大季节性特卖：时间、折扣与操作指引","items":[
        {"name":"🌸 春季特卖 Spring Sale（3月19日-3月26日）","desc":"持续8天。建议折扣力度：新品(上线<6月)设25-35%，已过首发期设40-55%，老游戏(2年+)设60-75%。操作：提前至3月5日前在Steamworks→促销管理→注册季节特卖。首日设最高折扣可获算法加权。全站流量提升约300%，独立游戏平均销量增长3-5倍"},
        {"name":"☀️ 夏季特卖 Summer Sale（6月25日-7月9日）","desc":"持续15天，年度最大促销。建议折扣力度：独立游戏首折40-50%，成熟作品50-70%，老作品可达80-90%。操作要点：头3天贡献全活动60%以上销量，务必首日参与。夏促期间Steam发放集换式卡牌/贴纸，完成互动任务的游戏可获额外曝光。搭配Discovery Queue推荐，日均曝光可达10万-50万次"},
        {"name":"🍂 秋季特卖 Autumn Sale（10月1日-10月8日）","desc":"持续8天。建议折扣力度：比春促深5-10%。10月新品节（10月19-26日）紧随其后，形成Demo->愿望单->秋促购买的转化链。适合在新品节放Demo、秋促出首折的组合策略"},
        {"name":"❄️ 冬季特卖 Winter Sale（12月17日-2027年1月4日）","desc":"持续19天，节日送礼高峰。建议折扣力度：与夏促持平或略高5%。Steam Awards同期举办，获提名可获数百万次额外页面展示。冬促期间礼物购买量是平时的8-12倍。建议设置好友可见的折扣标签吸引送礼"},
        {"name":"📋 操作步骤（适用于所有季促）","desc":"Step1:Steamworks→App→Marketing→特卖注册（截止日期通常为活动前2-3周）→ Step2:设置折扣百分比(10%-95%) → Step3:准备商店素材更新(横幅/截图/描述) → Step4:社交媒体预告（建议活动前3天） → Step5:首日监控销量数据，必要时在前3天通过社区公告二次推广"}
    ]},
    {"title":"2026年Steam新品节 Next Fest（三期）+ 参与全流程","items":[
        {"name":"📅 2月新品节（2月23日-3月2日）","desc":"冬季档竞争较小。平均每款游戏获5000-15000次Demo下载。适合首次亮相的独立游戏。Demo建议时长：15-30分钟核心玩法体验"},
        {"name":"📅 6月新品节（6月15日-6月22日）","desc":"全年关注度最高的一期。紧接夏促（6月25日），形成完整转化漏斗：新品节试玩Demo → 加入愿望单 → 夏促折扣购买。建议在Demo结尾设置愿望单引导弹窗"},
        {"name":"📅 10月新品节（10月19日-10月26日）","desc":"年末档前最后展示窗口。与Steam Scream V恐怖节（10月26日-11月2日）无缝衔接，恐怖品类可获双重曝光。建议Demo中包含恐怖元素演示"},
        {"name":"🔧 完整参与流程","desc":"Step1:创建Coming Soon页面（建议提前6个月以上）→ Step2:开发15-30分钟可玩Demo → Step3:在Steamworks活动注册页面申请参与（截止日期约为活动前4-6周）→ Step4:上传Demo构建并提交审核（预留2周审核时间）→ Step5:活动期间每天开启至少1小时Steam直播，获额外推荐权重 → Step6:活动结束后分析Demo下载/愿望单数据优化正式版"},
        {"name":"📊 转化率参考数据","desc":"优质Demo转化率：Demo下载→愿望单10-20%，愿望单→首发购买10-15%（独立游戏平均约10.5%）。即1万次Demo下载可期望带来1000-2000个愿望单，最终转化100-300套首发销量"}
    ]},
    {"title":"2026年全年主题品类节完整日历（20+场）","items":[
        {"name":"1月 推理游戏节","desc":"1月12日-19日。推理/侦探类。品类标签匹配：Mystery, Detective"},
        {"name":"1月 棋盘游戏节","desc":"1月26日-2月2日。桌游/策略类。匹配：Board Games, Turn-Based Strategy"},
        {"name":"2月 打字游戏节","desc":"2月5日-9日。打字/文字类小众品类节"},
        {"name":"2月 PvP对战节","desc":"2月9日-16日。竞技/MOBA/格斗类。匹配：PvP, Competitive, Fighting"},
        {"name":"2月 马术游戏节","desc":"2月19日-23日。骑乘/马术模拟类"},
        {"name":"3月 塔防游戏节","desc":"3月9日-16日。塔防/策略防御类。匹配：Tower Defense"},
        {"name":"3月 住宅模拟节","desc":"3月30日-4月6日。家装/生活模拟类。匹配：Building, Life Sim"},
        {"name":"4月 隐藏物品节","desc":"4月9日-13日。隐藏物品/解谜类"},
        {"name":"4月 中世纪游戏节","desc":"4月20日-27日。中世纪题材。匹配：Medieval"},
        {"name":"5月 卡牌构筑节","desc":"5月4日-11日。Roguelike卡牌/Deckbuilder。匹配：Card Game, Deckbuilding"},
        {"name":"5月 海洋探索节","desc":"5月18日-25日。海洋/潜水/航海类"},
        {"name":"6月 弹幕射击节","desc":"6月8日-15日。弹幕射击/Bullet Hell。匹配：Bullet Hell, Shoot 'Em Up"},
        {"name":"7月 社交推理节","desc":"7月13日-16日。社交推理/Mafia类。匹配：Social Deduction"},
        {"name":"7月 火车模拟节","desc":"7月20日-27日。火车/铁路模拟类"},
        {"name":"8月 赛博朋克节","desc":"8月3日-10日。赛博朋克/科幻类。匹配：Cyberpunk, Sci-fi"},
        {"name":"8月 弹球游戏节","desc":"8月17日-20日。弹球/弹珠机类"},
        {"name":"8-9月 PvE生存制作节","desc":"8月31日-9月7日。生存制作/开放世界探索。匹配：Survival, Crafting, Open World"},
        {"name":"9月 编程解谜节","desc":"9月10日-14日。编程/逻辑解谜类"},
        {"name":"9月 团队RPG节","desc":"9月14日-21日。Party-Based RPG类"},
        {"name":"10月 烹饪模拟节","desc":"10月12日-19日。烹饪/餐厅模拟类"},
        {"name":"10月 恐怖节 Steam Scream V","desc":"10月26日-11月2日。恐怖/惊悚类。年度最大恐怖品类活动"},
        {"name":"11月 自走棋RPG节","desc":"11月16日-23日。Auto-battler/策略RPG类"},
        {"name":"📋 品类节参与方式","desc":"Steamworks→活动注册页面提交申请。需确认游戏至少有1个标签匹配品类节主题。品类节折扣建议与季促一致(25-60%)。部分品类节支持Demo展示"}
    ]},
    {"title":"折扣阶梯策略与定价实操建议","items":[
        {"name":"🔢 折扣冷却规则","desc":"两次折扣间隔最少28天（2025年由42天缩短）。季节性特卖不受冷却限制。涨价后30天内不可打折。首发折扣结束后进入28天冷却期"},
        {"name":"📊 折扣阶梯建议（按游戏生命周期）","desc":"首发期(第1-2周)：10-25%首发折扣（最高40%）| 0-6个月：首次季促25-35% | 6-12个月：35-50% | 1-2年：50-65% | 2-3年：65-80% | 3年以上：75-90%。每次比上一次深5-10%"},
        {"name":"💡 自定义折扣最佳实践","desc":"时长建议1-7天（最长14天）。每季度1次配合内容更新最佳。周四至周一（Thu-Mon）的周末折扣转化率比工作日高30-40%。折扣≥20%会触发愿望单邮件通知"},
        {"name":"🌍 区域定价参考","desc":"中国区：USD×40-50%。巴西：USD×45-55%。阿根廷/土耳其：最低价区有Key区域锁限制。东欧：USD×60-70%。日本/韩国：USD×90-100%。使用Steamworks定价工具批量设置"},
        {"name":"📦 捆绑包策略","desc":"完整版捆绑(基础+DLC)额外折扣10-20%。开发者捆绑(多款游戏)适合有多款作品的团队。'完成合集'功能让已购用户补差价购买新DLC"}
    ]},
    {"title":"每日特惠与算法推荐机制（深度解析）","items":[
        {"name":"🔥 每日特惠(Daily Deals)","desc":"首页6个推荐位，日曝光500万+。由V社编辑+算法联合筛选，无法主动申请。入选关键指标：好评率>80%、近期销量增速>平均值、愿望单日增>100。被选中后预计日销量提升10-50倍"},
        {"name":"🔍 Discovery Queue推荐","desc":"基于标签偏好(40%权重)/游戏库匹配(30%)/浏览历史(30%)个性化推荐。优化方法：精准设置标签(最多20个，前5个最重要)、保持更新频率(每月至少1次社区公告)、积累正面评价"},
        {"name":"⭐ 愿望单核心策略","desc":"7000个愿望单:进入Popular Upcoming。25000个:独立游戏竞争力基准线。50000+:首页热门即将推出。日均增速(而非总量)是算法更看重的指标。建议目标：发布前达到1-5万愿望单"},
        {"name":"🎬 商店页转化优化清单","desc":"预告片：前5秒必须抓眼球(禁止Logo/片头动画开头) | 截图：至少5张覆盖核心玩法+UI界面 | 短描述：2句话传达核心卖点+差异化 | 标签：20个标签精准匹配品类 | 评测数量：前50条决定总体评价基调"},
        {"name":"📡 社区运营节奏","desc":"每2周发布1篇开发日志 | 讨论区48小时内回复 | 新品节/品类节期间每天直播1-2小时 | 发布前3个月进入密集运营期(每周1次更新) | 利用Steam社区活动(点赞/投票)增加互动数据"}
    ]}
]}

# ========================================================================
# Steam (platform_id=1) — 运营功能 operation (id=2)
# ========================================================================
strategies[2] = {"sections":[
    {"title":"上架全流程与费用明细","items":[
        {"name":"💰 注册费用","desc":"$100/款游戏(App Credit)，当该游戏在Steam销售收入超$1000后可退还至Steam钱包。每个Steamworks账号可管理无限款游戏"},
        {"name":"📋 商店页开设时间线","desc":"建议发布前6-12个月创建Coming Soon页面。完整流程：注册Steamworks(需SSN/税务信息) → 创建新App($100) → 填写商店信息(描述/截图5张+/预告片/标签20个) → 提交Store页审核(2-5工作日) → 审核通过后Coming Soon上线，开始积累愿望单"},
        {"name":"🔧 构建审核","desc":"游戏版本提交后约1-3工作日完成审核。首次提交建议预留额外7天缓冲。重大内容更新(含新成就/DLC)也需通过审核。每周二/三提交审核处理速度最快（避开周五和假期前）"},
        {"name":"📅 发布日选择建议","desc":"最佳：周二/周三(工作日峰值) | 避开：季节性特卖前后2周(注意力被分散)、AAA大作发布周、Steam新品节期间(仅Demo可参加) | 黄金窗口：新品节结束后1-2周、品类节期间(品类匹配时)"}
    ]},
    {"title":"Playtest封闭测试完整操作手册","items":[
        {"name":"📋 开放流程（5步）","desc":"Step1:Steamworks→App管理→创建Playtest专用AppID(免费，与正式版分离) → Step2:上传测试构建至Playtest AppID → Step3:配置参数：玩家上限(建议首批500)/时间窗口/区域限制(可选)/问卷(可选) → Step4:正式版商店页自动显示'请求访问'按钮 → Step5:在Steamworks后台审批玩家请求并分批开放"},
        {"name":"👤 玩家参与旅程(User Journey)","desc":"①商店页看到Playtest标识和'请求访问'按钮 → ②点击请求，填写问卷(如果开发者配置了问卷：硬件配置/游戏偏好/测试经验) → ③等待审批(开发者设定，3-14天不等) → ④收到Steam通知邮件'您已获得Playtest访问权限' → ⑤Playtest出现在Steam游戏库[标注'非最终版本'] → ⑥下载游玩并在讨论区/内置表单提交反馈 → ⑦测试结束后Playtest自动从游戏库移除，进度不保留"},
        {"name":"🎟️ 三种资格开通方式","desc":"方式一【自动审批】：所有请求自动通过，适合大规模开放测试/Demo性质测试 | 方式二【手动审批】：开发者逐一或批量审核请求，可筛选特定区域/硬件配置的玩家 | 方式三【问卷筛选】：配置自动规则(如仅通过RTX显卡用户/仅有1000小时+游戏时长用户)自动分组审批。三种方式可随时切换，玩家上限也可动态调整"},
        {"name":"📊 容量与限制","desc":"单次Playtest无硬性人数上限(理论无上限)。推荐分批策略：首批200-500人(观察崩溃率/反馈质量) → 扩展至2000-5000人(压力测试) → 大规模10000+人(上线前最终验证)。支持设置区域限制(如仅北美/欧洲)。测试数据独立于正式版，进度不保留。完全免费功能"},
        {"name":"💡 最佳实践节奏","desc":"小规模测试：每1-2周组织5-20人深度反馈(关注核心机制体验) | 中规模测试：每月1次500-2000人(验证性能/匹配/服务器) | 大规模测试：发布前1-2月组织5000+人(模拟上线场景) | 黄金组合：新品节放Demo吸引关注→品类节筛选核心粉丝→Playtest深度测试→正式上线 | 必须设置反馈渠道：Steam讨论区+游戏内反馈表单+Discord服务器"}
    ]},
    {"title":"Steam Key发放规则与分配方案（2026年政策）","items":[
        {"name":"📦 默认配额","desc":"每款游戏首次可申请最多5,000个默认Steam Key。用于：零售分发/第三方平台(Humble/Fanatical)/媒体评测/KOL推广/社区活动。Key免费生成但有严格使用追踪"},
        {"name":"📈 追加申请规则","desc":"超过5,000个Key需在Steamworks→Key管理中逐案申请。审批考量因素：①Steam实际销量(销量越高配额越多) ②历史Key激活率(低于50%会被警告) ③第三方售价不得低于Steam ④新游无销量记录时通过率较低(建议先积累首月销量再申请追加)"},
        {"name":"🔑 Beta测试Key","desc":"Release State Override类型的Beta Key上限2,500个/款游戏。仅用于封闭测试定向分发。激活后玩家可下载测试版本。正式版发布后Beta Key自动失效"},
        {"name":"⚠️ 使用红线","desc":"①价格平价：第三方售价禁止低于Steam当前价格 ②禁止批量廉价转售(如灰色市场Key贩子) ③2024年起加强区域匹配检查防跨区套利 ④同一IP/硬件批量激活会触发风控 ⑤违规后果：削减配额、暂停Key申请权限、严重者封禁Steamworks账号"},
        {"name":"📊 推荐分配方案（基于5000个Key配额）","desc":"媒体评测：50-100个(提前2-4周发送) → KOL/主播：100-200个(按粉丝量/内容匹配度筛选) → 社区活动/赠品：200-500个(Discord/Reddit/社交媒体活动) → 第三方零售(Humble/Fanatical/GMG)：1000-3000个 → 预留应急/补发：500-1000个。优先级：媒体>KOL>零售>社区"}
    ]},
    {"title":"打折促销规则（2026年详细规则）","items":[
        {"name":"📐 折扣范围与规则","desc":"支持10%-95%折扣设置(5%为步进单位)。首发可设10%-40%首发折扣(上架首2周内)。超过90%的折扣需Valve人工审核通过。已进入季促的游戏折扣在活动期间锁定，不可中途修改"},
        {"name":"⏰ 冷却期详细规则","desc":"两次折扣间隔28天（2025年由42天缩短至28天）。例外情况：①季节性特卖(春/夏/秋/冬)不受冷却限制 ②品类节算自定义折扣，受28天冷却限制 ③涨价后30天内不可打折 ④首发折扣结束后28天冷却"},
        {"name":"🚀 首发折扣操作","desc":"在Steamworks→定价→首发折扣中设置。折扣在上架日自动生效，持续到手动结束(最长14天)。结束后进入28天冷却期再接季促或自定义折扣。建议首发折扣10-25%，刺激首批转化和好评积累"},
        {"name":"🎯 自定义折扣操作","desc":"Steamworks→App→Marketing→创建自定义折扣。时长1-14天可选。建议频率：每季度1次配合内容更新(新DLC/大版本/周年庆)。最佳时机：周四开始到周一结束(5天周末折扣)，转化率高30-40%"},
        {"name":"📧 愿望单通知机制","desc":"折扣≥20%时Steam自动向所有愿望单用户发送邮件通知。这是最重要的免费推广渠道之一。建议首次折扣即设20%以上，触发通知覆盖全部愿望单用户"}
    ]},
    {"title":"Steam用户语言分布与本地化优先级（2025年GDC官方数据）","items":[
        {"name":"🌍 数据来源与概览","desc":"数据来自Valve在GDC 2025上发布的官方统计（2024年度全量用户数据），以及Steam每月硬件和软件调查报告（2025年各月抽样数据）。超过66%的Steam用户将非英语语言设为首选语言，全球用户语言分布极为多元"},
        {"name":"🥇 简体中文 — 33.7%（第1名）","desc":"2024年正式超越英语成为Steam平台使用人数最多的语言。受《黑神话：悟空》《原神》等国产大作带动，中国玩家群体持续增长。月度调查中波动较大（春节期间可达50%+，非节假日约24-30%），但年度总量已稳居第一。中国市场是Steam最大的单一语言用户群"},
        {"name":"🥈 英语 — 33.5%（第2名）","desc":"长期霸榜语言首次被简体中文超越。覆盖北美、英国、澳洲等核心市场。月度调查中通常在35-42%之间浮动。英语用户付费能力最强，是大多数游戏的首要目标语言。所有游戏的基础必备语言"},
        {"name":"🥉 俄语 — 8.2%（第3名）","desc":"稳定的第三大语言群体。俄语区（俄罗斯、乌克兰、白俄罗斯、哈萨克斯坦等）PC游戏文化深厚，月度占比约8-11%。俄语区玩家偏好硬核/策略/射击/RPG品类，好评率中等。区域定价较低（约USD×40-50%），但用户体量大"},
        {"name":"4️⃣ 西班牙语 — 4.6%（第4名）","desc":"包括西班牙语-西班牙和西班牙语-拉丁美洲两个变体。覆盖西班牙及拉美市场（墨西哥、阿根廷、哥伦比亚等）。拉美市场增长迅速，Steam在拉美的渗透率持续提升。建议至少支持西班牙语-拉美变体"},
        {"name":"5️⃣ 巴西葡萄牙语 — 约3.5-4%（第5名）","desc":"巴西是南美最大的游戏市场。巴西葡萄牙语与欧洲葡萄牙语差异较大，建议单独本地化。Steam在巴西的用户增速高于全球平均水平。巴西玩家好评率在所有语言中名列前茅"},
        {"name":"6️⃣ 法语 — 约2.5-3%（第6名）","desc":"覆盖法国、比利时、加拿大魁北克等市场。法语用户对本地化质量要求较高，机翻接受度低。法国游戏市场成熟，付费意愿良好"},
        {"name":"7️⃣ 德语 — 约2.5-3%（第7名）","desc":"覆盖德国、奥地利、瑞士德语区。德国是欧洲最大的游戏市场之一。对暴力/纳粹相关内容有特殊审查法规（USK评级），需特别注意内容合规"},
        {"name":"8️⃣ 波兰语 — 约2%（第8名）","desc":"波兰游戏文化浓厚（CD Projekt/Techland等本土大厂），Steam渗透率极高。波兰语用户在欧洲用户群中占比持续增长"},
        {"name":"9️⃣ 韩语 — 约1.5-2%（第9名）","desc":"韩国市场以F2P网游为主，但Steam单机/买断制市场近年快速增长。韩语好评率偏低（与中日同属东亚'严格评价'用户群）。韩国区域定价与USD接近（约90-100%）"},
        {"name":"🔟 日语 — 约1.5-2%（第10名）","desc":"日本市场近年Steam使用率激增（2022年起快速增长至2%+）。日本区域定价较高（USD×90-100%）。日本玩家对翻译质量极为敏感，需专业日语本地化。日本是高ARPU市场，虽占比不高但营收潜力大"},
        {"name":"🔢 其他重要语言（第11-20名）","desc":"土耳其语约1.5% | 繁体中文约1-1.3% | 越南语/印尼语增长最快（东南亚新兴市场）| 意大利语约1% | 瑞典语/丹麦语/芬兰语/挪威语合计约2%（北欧市场） | 乌克兰语约1% | 匈牙利语/罗马尼亚语等东欧语言合计约2%"},
        {"name":"📊 本地化优先级建议（ROI排序）","desc":"🔴 P0必做（覆盖约85%用户）：简体中文 + 英语 + 俄语 + 西班牙语 + 巴西葡萄牙语。🟡 P1推荐（覆盖约95%用户）：法语 + 德语 + 波兰语 + 韩语 + 日语 + 土耳其语 + 繁体中文。🟢 P2增值：意大利语 + 越南语 + 印尼语 + 乌克兰语 + 泰语 + 北欧语言。注意：EFIGS(英法意德西)是传统本地化基础包，但当前数据显示俄语和巴西葡语的ROI已超过法意德"},
        {"name":"💡 本地化投入建议","desc":"最低标准：UI/菜单+商店页面翻译（所有P0语言）。推荐标准：全文本翻译+字幕（P0+P1语言）。最佳标准：全文本+配音（英语/简中/日语）+ 区域化内容适配。成本参考：专业翻译约$0.10-0.20/词，全文本10万词的游戏P0语言翻译成本约$5K-10K。Steam商店页本地化是ROI最高的投入，直接影响转化率"}
    ]}
]}

# ========================================================================
# Steam (platform_id=1) — 技术合作 technology (id=3)
# ========================================================================
strategies[3] = {"sections":[
    {"title":"Steam Deck与掌机生态适配指南","items":[
        {"name":"🎮 Steam Deck OLED","desc":"7.4寸OLED屏幕/90Hz刷新率/改进电池续航(3-12小时)。25000+已验证游戏。获Deck Verified认证可进入Deck商店专属推荐区(月活2000万+Deck用户)"},
        {"name":"✅ Deck Verified四级评级","desc":"Verified(完全兼容，绿色对勾)=Deck商店最高推荐权重 | Playable(基本可玩，黄色)=需小幅调整 | Unsupported(不支持，红色)=需大幅修改 | Unknown(未测试)=无推荐权重。目标必须达到Verified"},
        {"name":"🔧 Deck适配核心清单","desc":"①分辨率：支持1280×800(Deck原生)或720p+16:10适配 ②操作：完整手柄映射(摇杆+按键+触控板) ③系统：Linux/Proton兼容(基于SteamOS) ④文字：最小字号不低于12pt(7.4寸屏幕) ⑤暂停：支持suspend/resume(Deck休眠唤醒) ⑥功耗：控制在15W TDP内，目标帧率30fps稳定(推荐40fps)"},
        {"name":"📋 认证申请流程","desc":"Steamworks→App→Steam Deck兼容性→提交适配测试请求。Valve自动检测+人工测试，周期约2-4周。开发者可在Steamworks查看详细的不兼容项清单并逐项修复后重新提交"},
        {"name":"🆕 Steam Machine(2026计划)","desc":"Valve预告的新一代主机设备，基于SteamOS 3.x。预计兼容所有Deck Verified游戏。提前获得Deck Verified认证=自动适配Steam Machine"}
    ]},
    {"title":"Steamworks SDK核心功能集成指南","items":[
        {"name":"🏆 成就系统","desc":"建议设计30-50个成就。分布：主线进度成就(40%，如通关每章)、支线探索(30%，如隐藏收集)、挑战成就(30%，如无伤通关)。支持隐藏成就(防剧透)。成就完成率数据可分析玩家流失节点(如第3章完成率骤降说明难度曲线问题)"},
        {"name":"☁️ 云存档","desc":"通过Steam Cloud API实现跨设备自动同步。配置：Steamworks→App→Cloud→指定存档路径和文件模式。建议存档大小<100MB。支持自动存档+手动存档并行策略。Deck/PC/Steam Machine三端同步是基本要求"},
        {"name":"🔨 创意工坊(Workshop)","desc":"支持UGC内容(Mod/地图/皮肤/角色/关卡)。集成Workshop API后玩家可一键订阅Mod并自动加载。成功案例：《城市天际线》《Rimworld》因Workshop社区延长游戏寿命5-10年。适合类型：沙盒/策略/模拟/RPG"},
        {"name":"🎮 Remote Play Together","desc":"本地多人游戏扩展为在线多人(仅主机玩家需拥有游戏)。支持4K HDR远程同玩。降低多人游戏购买门槛：4人本地合作仅需1份购买。通过Steam社交菜单一键邀请好友"},
        {"name":"🕹️ Steam Input API","desc":"统一管理手柄/键鼠/触控板输入。自动支持Xbox/PS/Switch Pro/Steam Controller。玩家可自定义按键映射并分享配置方案。集成后自动获得Deck Verified加分"}
    ]},
    {"title":"Proton兼容与Linux支持","items":[
        {"name":"🐧 Proton兼容层","desc":"将Windows游戏自动转译为Linux可运行版本。Proton 9.x(2026年)性能已接近原生Windows(约95%性能)。是Steam Deck核心底层技术。大多数DirectX 9-12游戏可自动兼容"},
        {"name":"⭐ ProtonDB社区评级","desc":"社区驱动兼容性评级：Platinum(完美)>Gold(微小问题)>Silver(可玩但有瑕疵)>Bronze(勉强运行)>Borked(无法运行)。Platinum评级游戏在Deck商店获最高推荐权重。可在protondb.com查看玩家报告"},
        {"name":"💡 Linux适配建议","desc":"①优先使用Vulkan渲染(兼容性远优于DirectX转译) ②避免内核级反作弊(需原生Linux支持，如EAC已支持) ③在Proton环境测试并修复已知问题 ④Linux用户群体虽占3-5%但付费意愿和好评率显著高于平均"}
    ]},
    {"title":"技术适配优先级建议","items":[
        {"name":"🔴 P0必做（上架前完成）","desc":"云存档(Steam Cloud) + 完整手柄操作映射 + Deck Verified适配(1280×800+手柄+Linux) + 成就系统(30-50个) + 基础辅助功能(字幕/按键重映射)"},
        {"name":"🟡 P1推荐（发布后1-3月内）","desc":"Steam Input API集成 + Remote Play Together(多人游戏) + 创意工坊(沙盒/策略类) + Steam Trading Cards(增加社区互动) + Steam Overlay自定义"},
        {"name":"🟢 P2增值（长期维护）","desc":"Steam直播集成(品类节/新品节获额外推荐) + VR支持(如适用) + Rich Presence状态显示(好友列表显示游戏内状态) + 周边功能(点数商店/个人资料定制)"}
    ]}
]}

# ========================================================================
# Epic Games (platform_id=2) — 推广资源 promotion (id=4)
# ========================================================================
strategies[4] = {"sections":[
    {"title":"2026年Epic Games Store促销日历与折扣指引","items":[
        {"name":"❄️ 冬季特卖（12月中旬-次年2月下旬）","desc":"2025-2026冬促：2025年12月12日-2026年2月24日，持续超2个月。折扣力度：通常40-80%off。特卖期间Epic发放$10无门槛优惠券(≥$14.99游戏可用)，与折扣叠加。优惠券由Epic承担成本，开发者收入不受影响"},
        {"name":"🌸 春季特卖（3月中旬）","desc":"2026年春促已于3月初结束。持续约2周。建议折扣：新品20-35%，成熟作品40-60%。配合Epic Rewards 20%返利活动"},
        {"name":"🔥 Mega Sale大促（预计5月中旬-6月中旬）","desc":"参考2025年5月15日-6月12日。Epic年度最大促销。$10无门槛优惠券无限发放(买一次自动补充一张)。配合20% Epic Rewards返利。建议：设折扣≥25%使游戏进入优惠券适用门槛($14.99折后)"},
        {"name":"☀️ 夏末特卖（预计8月）","desc":"参考2025年8月。持续约2-3周。折扣力度与春促类似"},
        {"name":"🎄 年终假日特卖（12月中旬起）","desc":"与圣诞/新年假期重合。17款免费游戏每日轮换(参考2025年圣诞送出《霍格沃茨之遗》等)。免费游戏引流效应显著，同期上架游戏可获连带曝光"},
        {"name":"📋 开发者促销操作","desc":"Epic允许开发者自主设定折扣时间和力度，无需预审。通过Epic Developer Portal→促销管理设置。建议配合Epic大促档期同步打折最大化曝光"}
    ]},
    {"title":"独占合作与收入保障方案详解","items":[
        {"name":"💎 限时独占(Timed Exclusive)","desc":"6-12个月Epic限时独占。获得：保底收入(MG，Minimum Guarantee)+首页核心推荐位+社交媒体推广。MG金额：中小独立游戏$50K-$500K，中型$500K-$5M。根据预期销量×单价×预计转化率谈判确定"},
        {"name":"🆓 Epic First Run计划","desc":"2026年延续：新游首发6个月内100%收入归开发者(Epic免分成)。条件：新游戏必须在Epic首发或同步首发(可同时上Steam)。无需独占。操作：Developer Portal提交申请，审核约1-2周"},
        {"name":"🔄 Now on Epic计划","desc":"已在其他平台发售的老游戏首次上架Epic，可获6个月100%收入。适合将Steam/主机游戏拓展至Epic渠道。无需独占，但需是首次在Epic上架"},
        {"name":"📊 12%分成优势深度对比","desc":"Epic固定12%分成(开发者得88%) vs Steam阶梯：前$1000万30%(得70%)/$1000万-$5000万25%(得75%)/超$5000万20%(得80%)。对于年收入$500万的游戏：Epic多获$900K。决策建议：预期Steam首月<5万套时优先考虑Epic独占"},
        {"name":"🌐 Web Shops（2026年新功能）","desc":"开发者可通过Epic Web Shops在自己官网直接销售游戏/内购。分成：首$100万/年/游戏0%分成，之后12%。适合有官网流量的团队。用户购买后直接绑定Epic账号"}
    ]},
    {"title":"获取推广资源实操建议","items":[
        {"name":"🎮 UE5引擎加成","desc":"使用UE5开发可获Epic更多关注和资源倾斜。关键：Epic 12%分成中已包含UE5的5%引擎版税，实际额外成本仅7%。首$100万UE版税完全减免"},
        {"name":"💰 MegaGrants资金","desc":"Epic MegaGrants提供$5K-$500K无偿资助。无需放弃股权或独占权。申请通过率约10-15%。申请渠道：unrealengine.com/megagrants。需提交项目Demo/设计文档/团队介绍"},
        {"name":"🎪 Epic Games Show","desc":"年度发布会展示机会。被选中可获数周首页Banner位推广+社交媒体推广。需通过Epic商务团队主动联系申请(developer-relations@epicgames.com)"},
        {"name":"🎁 每周免费游戏联动","desc":"Epic每周四赠送1-2款免费游戏，吸引数百万用户访问商城。策略：在免费游戏更换日前后上架/打折新游戏，可获最大连带流量效应。免费游戏更换时间：每周四下午(北京时间周四晚11点)"},
        {"name":"📊 独占决策评估框架","desc":"考量维度：①MG保底金是否覆盖≥70%开发成本 ②多平台同步首发的总收入潜力对比 ③目标受众社区对独占的接受度(PC核心玩家普遍抵触) ④Epic承诺的推广资源具体清单 ⑤合同期限和后续平台发布限制"}
    ]}
]}

strategies[5] = {"sections":[
    {"title":"上架流程与开发者工具","items":[
        {"name":"📝 开发者账号注册","desc":"通过dev.epicgames.com免费注册，无上架费用。审核周期约1-2周，需公司/个人开发者信息。通过后获得Developer Portal完整访问权限"},
        {"name":"🔍 审核流程","desc":"提交：游戏信息/5+张截图/预告片/商店描述 → Epic团队人工审核(1-2周) → 可能要求修改后重新提交 → 通过后获上架资格。注意：Epic对游戏质量有门槛(非开放平台)，资产翻皮/极低质量游戏可能被拒"},
        {"name":"💰 分成规则详解","desc":"固定12%平台分成，开发者获88%（对比Steam 30%/25%/20%阶梯）。使用UE5引擎：12%中已包含5%引擎版税(即额外成本仅7%)。首$100万UE版税完全减免。支持自行定价，支持80+支付方式覆盖187个国家"},
        {"name":"🆕 选择性发布(2026新功能)","desc":"允许仅发布特定更新(如游戏二进制文件)而不推送未完成的更改(如商店页面)。操作：Developer Portal→Build Management→选择发布组件。提升迭代灵活性"},
        {"name":"🔄 发行商自主限免(2026新政)","desc":"发行商可自行设置100%折扣实现限时免费(最长45天)。限免结束后30天冷却期内不可再次限免。操作：Developer Portal→促销→设置100%折扣。适合老游戏续命引流"}
    ]},
    {"title":"促销定价与优惠券机制详解","items":[
        {"name":"🏷️ 开发者主导折扣","desc":"开发者可自主设定折扣时间(1-45天)和力度(5%-100%)，无需Epic预审。通过Developer Portal→Offers & Discounts设置。建议配合Epic大促档期同步打折"},
        {"name":"🎫 平台优惠券叠加机制","desc":"大促期间(Mega Sale/冬促)Epic发放$10无门槛优惠券，适用于折后价≥$14.99的游戏。优惠券可无限使用(每次购买后自动补充)。优惠券成本100%由Epic承担，开发者收入不受任何影响。策略：定价$19.99的游戏打75折=$14.99，玩家再用$10券仅需$4.99"},
        {"name":"💎 Epic Rewards返利","desc":"大促期间Epic Rewards返利提升至20%(常规5%)。返利以Epic钱包余额形式发放。吸引用户在Epic而非其他平台购买。开发者无需操作，系统自动生效"},
        {"name":"🌍 区域定价","desc":"Epic提供推荐区域定价参考。支持全球主要货币本地化定价。低价区定价建议：参考Steam推荐定价对标。注意Epic无区域锁Key系统，定价需平衡各区域"},
        {"name":"📊 定价策略建议","desc":"核心原则：折后价控制在$14.99以上以匹配$10优惠券门槛。定价参考：独立游戏$14.99-$29.99 / 中型$29.99-$49.99 / 3A $49.99-$69.99。首发折扣建议15-25%"}
    ]},
    {"title":"用户获取与转化优化","items":[
        {"name":"📈 免费游戏流量效应","desc":"每周免费游戏为Epic带来数百万MAU。策略：在免费游戏更换日(周四)前后24小时内上架新游戏/开启折扣可获最大连带流量。分析历史数据：大作限免时连带流量提升200-400%"},
        {"name":"🏅 成就系统","desc":"Epic成就系统支持XP积分和稀有度显示。成就积分(XP)可兑换Epic Rewards。建议设计与Steam一致的成就体系并适配Epic格式。操作：Developer Portal→Achievements配置"},
        {"name":"👥 社交功能","desc":"Epic Social API集成：好友列表/派对系统/游戏内邀请/跨平台好友(PC+主机)。跨平台好友是Epic差异化优势。建议集成Epic在线服务(EOS)实现跨平台社交"},
        {"name":"🔄 退款政策与应对","desc":"14天内/游玩不超过2小时可退款(与Steam一致)。应对策略：确保前2小时游戏体验足够吸引(完整教程+核心玩法展示+首个高潮点)。监控退款率(正常<5%，>10%需关注)"}
    ]}
]}

strategies[6] = {"sections":[
    {"title":"Unreal Engine 5生态深度利用","items":[
        {"name":"🎮 UE5引擎核心优势","desc":"Nanite虚拟微多边形几何体(无需手动LOD) + Lumen全局光照(实时GI无需烘焙) + MetaHuman高质量数字人 + World Partition(超大世界流式加载)。在Epic商店上架：12%分成已包含5%引擎版税"},
        {"name":"👤 MetaHuman工具","desc":"数小时内完成以往需数周的高质量角色建模。支持实时面部动捕(iPhone ARKit)。输出标准UE5骨骼可直接用于项目。适合剧情驱动型/开放世界RPG"},
        {"name":"🛒 Fab资源商店","desc":"Epic整合的数字资产市场(原Marketplace+Quixel+Sketchfab)。海量3D模型/材质/蓝图/音效可加速开发。部分Quixel扫描资源对UE开发者免费。操作：fab.com搜索+一键导入UE项目"}
    ]},
    {"title":"Epic Online Services (EOS) 集成指南","items":[
        {"name":"🌐 核心服务（全部免费）","desc":"跨平台多人基础设施：匹配系统/语音聊天/反作弊(EAC)/大厅系统/P2P连接。重点：不限于Epic平台，Steam/Xbox/PlayStation/Switch游戏都可使用EOS。零成本获得企业级后端服务"},
        {"name":"🔄 2026年EOS更新要点","desc":"SDK 1.19.0.3：停止支持32位Windows和Android 6-7 → 新增Xbox GDK 251000兼容 → 社交覆盖层优化跨设备导航性能 → 改进的P2P连接稳定性"},
        {"name":"☁️ 跨平台云存档","desc":"EOS Player Data Storage API实现跨平台存档同步。支持PC/PS5/Xbox/Switch多端同步。免费使用，无存储限制。操作：EOS SDK→Player Data Storage→指定存档键值对"},
        {"name":"🔗 Connect统一登录","desc":"统一身份验证支持：Steam/Xbox/PlayStation/Nintendo/Apple/Google/Discord账号关联。玩家一次关联，多平台进度互通。减少注册流程摩擦，提升跨平台留存率"},
        {"name":"🛡️ Anti-Cheat (EAC)","desc":"Easy Anti-Cheat免费提供。支持Windows/Linux/Mac全平台。2026年新增Linux原生支持(不再依赖Wine层)。多人竞技游戏必备，集成周期约1-2周"}
    ]},
    {"title":"技术适配建议","items":[
        {"name":"🔴 P0必做","desc":"EOS跨平台服务集成(免费且不绑定Epic独占) + Epic成就系统适配 + 基础手柄支持"},
        {"name":"🟡 P1推荐","desc":"EOS Connect统一登录(跨平台账号关联) + EAC反作弊(多人游戏) + 跨平台云存档"},
        {"name":"🟢 P2增值","desc":"UE5 Nanite/Lumen深度利用(如适用) + MetaHuman集成 + Fab资源加速开发 + EOS语音聊天"}
    ]}
]}

# ========================================================================
# Xbox (platform_id=3) — 推广资源 promotion (id=7)
# ========================================================================
strategies[7] = {"sections":[
    {"title":"Xbox Game Pass 2026三档体系与入库策略","items":[
        {"name":"🟢 Essential档（$9.99/月）","desc":"50+精选游戏 + Xbox在线多人资格 + Xbox奖励积分 + Deals with Gold折扣权限。入门级订阅，用户基数最大。适合引流型游戏(F2P DLC转化)"},
        {"name":"🔵 Premium档（$14.99/月）","desc":"200+游戏(PC+主机合并库) + 云游戏 + Xbox第一方大作(上市后6-12个月入库)。2026变化：PC Game Pass并入Premium档，PC玩家需升级才能获Day One游戏"},
        {"name":"🟣 Ultimate档（$29.99/月）","desc":"400+游戏 + 75+首日入库/年 + EA Play + Ubisoft+ Classics + Fortnite Crew会员 + 云游戏。核心玩家首选。全球约3400万GP订阅用户中约40%是Ultimate"},
        {"name":"💰 GP入库谈判要点","desc":"补偿模式：前期保底金(MG)+后续按下载量/游玩时长分成。合同期通常12-24个月。MG金额：独立游戏$50K-$300K，中型$300K-$2M。首日入库(Day One)可获全平台推广：Xbox商店首页/Xbox Wire新闻/社交媒体/Xbox直播活动展示"},
        {"name":"📊 GP对开发者价值数据","desc":"GP用户尝试新游戏意愿高出普通用户3倍。GP游戏DLC购买率高于非GP用户20-40%。退出GP目录后30天内设折扣可有效转化(历史转化率约5-8%)。GP入库游戏平均多获得200%的玩家评论数"}
    ]},
    {"title":"2026年Xbox促销日历与折扣指引","items":[
        {"name":"🧧 农历新年特卖（2月3日-2月25日）","desc":"600+游戏参与，最高折扣80%off。面向亚太市场重点推广。建议折扣：30-60%。中文本地化游戏获额外推荐"},
        {"name":"🎮 Developer Direct特卖（1月下旬）","desc":"2026年1月21日-2月2日。配合Xbox Developer Direct发布会。第一方大作折扣：50-75%off。第三方参与需联系Xbox商务团队"},
        {"name":"🏷️ Deals with Gold（每周滚动）","desc":"Xbox Live Gold/GP会员专属周折扣。每周二更新，持续至下周一。由Xbox编辑团队筛选。需提前4-6周向Xbox商务提交参与申请。建议折扣：33-67%"},
        {"name":"🔦 Spotlight Sale（主题特卖）","desc":"按主题组织的聚光灯特卖(如动作游戏周/独立游戏节/恐怖游戏月等)。通常持续1-2周。需与Xbox区域商务经理沟通参与"},
        {"name":"🛒 Black Friday（11月下旬）","desc":"参考2025年11月21日-12月2日。主机$100 off + 游戏最高75%off。年度最大折扣力度。建议设年度最深折扣"},
        {"name":"🌸 春季特卖（3-4月）","desc":"150+游戏参与，折扣40-60%off。配合春季新品上架周期"},
        {"name":"📋 开发者自主折扣操作","desc":"通过Microsoft Partner Center→定价与可用性→自行设置折扣。支持按区域差异化折扣。无冷却期限制。建议：每季度至少参与1次促销活动"}
    ]},
    {"title":"ID@Xbox独立开发者计划完整指南","items":[
        {"name":"📋 申请流程（4步）","desc":"Step1:通过xbox.com/developers提交游戏Pitch(30秒预告片+1页游戏概要+团队介绍) → Step2:签署NDA保密协议 → Step3:Xbox团队评估(2-4周，关注创新性/完成度/市场潜力) → Step4:通过后获得开发者账号+GDK开发工具包+GP入库推荐资格"},
        {"name":"🎁 提供的资源","desc":"免费Xbox GDK开发工具 + 最多2台Xbox开发机借用(价值约$500/台) + 专属技术支持渠道 + Xbox商店上架资格(免上架费) + GP入库优先推荐 + ID@Xbox Showcase展示机会"},
        {"name":"💰 资金加速计划","desc":"通过ID@Xbox Pitch可申请开发资金。通常以预付版税形式发放(从未来销售额中扣除)。需提交：完整游戏设计文档+商业计划+可玩Demo。金额范围：$25K-$500K不等"},
        {"name":"🎪 ID@Xbox Showcase","desc":"年度2-3场独立游戏展示直播。2025年2月Showcase展示了Blue Prince/Buckshot Roulette/Descenders Next等首日GP游戏。参与可获全球数百万观众曝光+Xbox商店Featured推荐"},
        {"name":"🎮 Xbox Play Anywhere","desc":"买一次双端(PC+主机)玩。支持跨设备存档同步。用户只需购买一次即可在Xbox主机和Windows PC间无缝切换。扩大用户覆盖面约30-50%"}
    ]},
    {"title":"Xbox展示活动矩阵（Showcase/Developer Direct/Partner Preview）","items":[
        {"name":"🎬 Xbox Games Showcase（6月，年度最大）","desc":"微软年度旗舰发布会，通常在6月E3/SGF期间举办。全球数千万在线观看。被选中展示的游戏获：直播画面曝光+Xbox Wire专稿报道+Xbox商店首页数周Banner推荐+全球社交媒体推广。申请渠道：通过Xbox商务团队主动推荐"},
        {"name":"🔧 Xbox Developer Direct（1月/不定期）","desc":"聚焦深度玩法展示的发布会，每款游戏15-20分钟深度演示。格式：约45-60分钟直播，深度展示3-5款游戏。适合有高完成度可玩内容的游戏"},
        {"name":"🤝 Xbox Partner Preview（季度性）","desc":"聚焦第三方合作伙伴游戏的展示活动，每年3-4场。展示内容以第三方独立/中型游戏为主。适合即将登陆Xbox/GP的第三方游戏"},
        {"name":"🏟️ Gamescom Xbox展台（8月）","desc":"科隆游戏展Xbox展台。提供：现场可玩Demo体验+剧场式专题演示+独立游戏专区。参与方式：通过Xbox商务团队申请展台位"},
        {"name":"📊 展示活动选择策略","desc":"游戏阶段→推荐活动：①概念/早期开发→ID@Xbox Showcase ②中期可玩Demo→Partner Preview/Gamescom展台 ③高完成度深度展示→Developer Direct ④重磅大作首发→Games Showcase"}
    ]},
    {"title":"Xbox商店资源位与推广渠道全解析","items":[
        {"name":"🏠 Xbox商店首页Banner","desc":"Xbox商店首页轮播大图推荐位，覆盖全球5000万+Xbox月活用户。获取方式：由Xbox编辑团队筛选，需通过Xbox商务经理提交游戏素材。首日入库GP游戏自动获得首页推荐"},
        {"name":"🆓 Free Play Days（周末免费试玩）","desc":"Xbox定期举办的免费试玩活动。所有Xbox用户均可免费下载体验完整版游戏。试玩→购买转化率约5-15%。参与方式：需通过Xbox商务团队提前4-6周申请"},
        {"name":"📱 Xbox移动端商店（2025年新增）","desc":"Xbox手机App新增完整商店页面。新增分类：游戏促销专区、热门排行榜、Xbox Play Anywhere专区。移动端用户日活持续增长"},
        {"name":"📰 Xbox Wire官方新闻","desc":"Xbox官方新闻平台，覆盖全球游戏媒体和玩家社区。游戏被Xbox Wire报道后通常获大量媒体转载。申请方式：通过Xbox PR团队或商务经理提交新闻稿素材"},
        {"name":"🏆 Game Pass Quests任务系统","desc":"GP订阅用户可通过完成游戏内任务赚取Microsoft Rewards积分。被选为Quest游戏可获GP用户额外关注和启动量"},
        {"name":"🤝 品牌联动与跨界合作","desc":"Xbox积极推动游戏与消费品牌联动推广。适合有一定知名度的游戏IP，需通过Xbox商务团队协调"}
    ]}
]}

strategies[8] = {"sections":[
    {"title":"上架全流程与认证要求","items":[
        {"name":"📝 开发者注册","desc":"注册Microsoft Partner Center账号。个人开发者约$19一次性费用，企业约$99。通过后获Xbox商店发布权限。审核周期约1-2周"},
        {"name":"🔧 GDK开发工具","desc":"Game Development Kit(GDK)是统一的Xbox+PC开发工具包。支持C++/C#/Unity/UE集成。2026年版GDK支持Xbox Series/PC/Cloud三端统一开发"},
        {"name":"✅ 认证测试(Cert)详解","desc":"必须通过Xbox认证才能上架。周期约2-4周。检测项：帧率稳定性/内存管理/存档系统/成就触发/在线功能/辅助功能。首次认证建议预留6周"},
        {"name":"📊 年龄分级","desc":"IARC国际年龄评级(免费在线申请)。全程免费，约1-2工作日完成"}
    ]},
    {"title":"用户测试与发布渠道","items":[
        {"name":"🧪 Xbox Insider计划","desc":"通过Insider Hub发布预览版给核心玩家。分Ring控制：Alpha Ring → Beta Ring → Delta Ring。可收集结构化反馈和自动崩溃报告"},
        {"name":"🎮 Game Preview(抢先体验)","desc":"Xbox版EA模式，销售开发中版本。玩家以折扣价购买并跟随更新。适合生存/建造/Roguelike等持续迭代型游戏"},
        {"name":"🕹️ Demo发布","desc":"Xbox商店支持独立Demo版本。Demo可在大型展示活动期间获额外曝光。建议Demo时长15-30分钟"}
    ]},
    {"title":"分成与促销机制详解","items":[
        {"name":"💰 分成规则（2025年调整后）","desc":"PC端(Microsoft Store)：88%/12%。主机端(Xbox Series)：70%/30%标准分成。GP入库游戏：单独分成协议"},
        {"name":"🏷️ Deals with Gold参与流程","desc":"联系Xbox区域商务经理→提前4-6周提交折扣方案→Xbox编辑团队审核并排期→活动上线"},
        {"name":"🔦 Spotlight Sale参与","desc":"Xbox每月1-2次主题聚光灯特卖。需与商务团队提前沟通确认主题匹配"},
        {"name":"📋 Partner Center自主折扣","desc":"Partner Center→产品→定价与可用性→创建自定义折扣。支持按区域设置不同折扣力度。无最短冷却限制"}
    ]}
]}

strategies[9] = {"sections":[
    {"title":"Xbox硬件生态适配指南","items":[
        {"name":"🎮 Xbox Series X","desc":"12 TFLOPS GPU，支持4K/120fps，硬件光追(DXR)。旗舰机型"},
        {"name":"🎮 Xbox Series S","desc":"4 TFLOPS GPU，1440p目标。用户基数大(约占Series总量40%)。必须确保流畅运行"},
        {"name":"☁️ Xbox Cloud Gaming","desc":"游戏在Azure服务器运行，串流到手机/平板/浏览器/智能电视。GP游戏自动支持云游戏"},
        {"name":"🕹️ Xbox手柄生态","desc":"Xbox Wireless手柄是PC端市场占有率最高的手柄(约65%份额)。完善的手柄适配=覆盖PC+主机+移动端全用户群"}
    ]},
    {"title":"技术服务与API集成","items":[
        {"name":"🔷 DirectX 12 Ultimate","desc":"光线追踪(DXR) + 可变速率着色(VRS) + 网格着色器(Mesh Shaders) + 采样器反馈"},
        {"name":"🏆 Xbox Live服务","desc":"成就系统(最多200个成就，总计10000G) + 多人匹配 + 排行榜 + 社交功能 + 活动系统"},
        {"name":"🔧 PlayFab后端服务","desc":"微软收购的游戏BaaS。提供：玩家数据管理/排行榜/实时分析/A/B测试/LiveOps运营工具/服务器托管。基础功能免费(MAU<10万)"},
        {"name":"☁️ Azure云服务","desc":"Xbox生态深度绑定Azure。GP开发者可获Azure使用积分优惠(最高$500/月)"}
    ]},
    {"title":"适配优先级建议","items":[
        {"name":"🔴 P0必做","desc":"Series S优化 + Quick Resume支持 + 成就系统(10000G) + Smart Delivery"},
        {"name":"🟡 P1推荐","desc":"HDR支持 + 手柄震动/脉冲扳机适配 + 云游戏触控映射"},
        {"name":"🟢 P2增值","desc":"Xbox Play Anywhere + 辅助功能 + Xbox Social集成 + Copilot辅助操控"}
    ]}
]}

# ========================================================================
# PlayStation (platform_id=4) — 推广资源 promotion (id=10)
# ========================================================================
strategies[10] = {"sections":[
    {"title":"PS Plus 2026年三档订阅体系与入选策略","items":[
        {"name":"🟢 Essential档（$79.99/年 | $9.99/月）","desc":"月度免费游戏(2-3款/月) + 在线多人 + 云存档 + PS Store会员折扣。全球5160万+订阅用户"},
        {"name":"🔵 Extra档（$134.99/年 | $14.99/月）","desc":"Essential全部权益 + 400+PS4/PS5可下载游戏目录。约38%订阅用户选择Extra或更高"},
        {"name":"🟣 Premium档（$159.99/年 | $17.99/月）","desc":"Extra全部权益 + 340+经典游戏 + 游戏试玩(完整版最长5小时) + 云串流"},
        {"name":"📋 入选PS Plus流程","desc":"由SIE商务团队主动邀请。入选考量：游戏口碑/用户基数/品类多样性/地区偏好"},
        {"name":"💡 PS Plus入选后效应","desc":"月度免费游戏可获数百万新增下载。DLC/MTX收入机会激增。退出后30天内设折扣可转化约3-5%试玩用户"}
    ]},
    {"title":"2026年PS Store完整促销日历与折扣指引","items":[
        {"name":"🎄 新年特卖","desc":"1月5日-1月21日。最高75%off"},
        {"name":"🎭 Critic's Choice促销","desc":"2月6日-2月14日。高评分游戏精选。入选条件：Metacritic 75+"},
        {"name":"🔥 Dealmania促销","desc":"至3月11日。40+推荐游戏折扣"},
        {"name":"🌸 春季超值特卖","desc":"3月17日-3月31日。建议折扣：30-60%"},
        {"name":"🎮 Days of Play","desc":"5月26日-6月9日。年度最重要促销之一。PS Plus年费75折"},
        {"name":"☀️ 夏季促销","desc":"7月7日-8月18日。暑期长周期促销(6周)"},
        {"name":"🎌 TGS促销","desc":"9月16日-10月4日。配合东京电玩展"},
        {"name":"🎃 万圣节促销","desc":"10月15日-10月31日。恐怖类重点"},
        {"name":"🛒 Black Friday","desc":"11月20日-11月30日。年度最大折扣"},
        {"name":"📋 PS促销参与方式","desc":"编辑精选：需SIE邀请 | PS Plus额外折扣：SIE承担成本 | 开发者自主：通过PS Partners后台设置"}
    ]},
    {"title":"展示与推广机会详解","items":[
        {"name":"🎬 State of Play","desc":"索尼官方直播发布会。年度通常3-4场。展示机会需通过SIE商务团队申请"},
        {"name":"🏠 PS Store首页推荐","desc":"编辑精选推荐位，覆盖全球1亿+PS月活用户。日本/北美/欧洲各区域独立运营"},
        {"name":"🏆 PlayStation Partner Awards","desc":"年度合作伙伴奖项(通常11月)。获奖可获长期PS官方推广"},
        {"name":"🎯 PS独占内容策略","desc":"提供PS独占DLC/皮肤/模式可获平台额外推广支持。投入产出比极高"}
    ]},
    {"title":"资源位介绍","items":[
        {"name":"💰 付费位（可购买的曝光）","desc":"这些是可通过金钱购买的曝光渠道，开发者可根据预算自主选择投放。包括：①🛒 PS Store推荐位：$25K～$200K/周，按周期购买PS Store首页或品类页的推荐展示位，价格根据位置和区域不同而异，覆盖全球1亿+PS月活用户，是最直接的付费曝光方式；②加入PS Plus月度游戏授权：通过与SIE商务团队谈判，将游戏加入PS Plus月度免费游戏阵容，获得保底授权金+数百万级新增下载量，DLC/内购收入机会大幅增长"},
        {"name":"🌟 编辑推荐（花钱买不到的曝光）","desc":"完全邀请制 — 仅通过与SIE的关系获取，无法通过付费购买。这些是PlayStation平台最顶级的推广资源"},
        {"name":"🎥 State of Play出演 / PS Plus Day One发行","desc":"由SIE主动邀请，游戏在State of Play直播发布会上展示，或作为PS Plus Day One首日入库游戏发行。全球数千万观众曝光，媒体大规模报道转载"},
        {"name":"📺 SIE承担费用的广告与捆绑销售","desc":"索尼承担全部费用的电视广告、户外广告、以及PS5主机捆绑销售。仅面向SIE认为具有战略价值的重点合作游戏，开发者无需支付任何推广费用"},
        {"name":"🎬 专属State of Play播出","desc":"为单款游戏量身定制的专属State of Play直播节目。这是PlayStation平台最高级别的推广待遇，仅授予极少数顶级合作伙伴的重磅大作"}
    ]}
]}

strategies[11] = {"sections":[
    {"title":"上架全流程与资质要求","items":[
        {"name":"📝 PS Partners注册","desc":"通过partners.playstation.com申请。需公司资质。审核周期：2-4周"},
        {"name":"🔧 DevKit获取","desc":"审核通过后可申请PS5开发机(约$2500-$5000/台)"},
        {"name":"✅ QA认证(TRC检查)详解","desc":"Technical Requirements Checklist - PS平台最严格的认证流程。周期约3-6周"},
        {"name":"📊 年龄分级","desc":"各区域需单独评级。日本CERO需单独申请"}
    ]},
    {"title":"用户测试与发布策略","items":[
        {"name":"🧪 PSN Beta分发","desc":"通过PS Partners平台向特定用户推送测试版"},
        {"name":"🎮 PS Store试玩版","desc":"发布独立Trial或限时Demo。Premium会员可免费试玩完整版最长5小时"},
        {"name":"🚀 抢先体验(Early Access)","desc":"PS Store支持EA模式但需SIE确认资格"}
    ]},
    {"title":"促销运营与区域化策略","items":[
        {"name":"🏷️ PS Store折扣类型","desc":"①编辑精选促销 ②PS Plus会员额外折扣 ③开发者自主折扣。三种可叠加"},
        {"name":"🌍 区域化运营要点","desc":"日本：重视实体渠道/CERO评级必须 | 北美：数字销售占比85%+ | 欧洲：多语言(至少5种)"},
        {"name":"📦 DLC与季票策略","desc":"PS Store对DLC有专门推荐位。PS独占DLC可获额外推广位"},
        {"name":"🔄 PS Plus退出后转化","desc":"退出后30天内设折扣可有效转化。建议退出后首周设40-50%折扣"}
    ]}
]}

strategies[12] = {"sections":[
    {"title":"PS5/PS5 Pro硬件特性与适配指南","items":[
        {"name":"🎮 PS5 Pro","desc":"增强GPU。支持8K输出和高级光追。2026年获FSR 4超分辨率升级。PS5 Pro Enhanced标识游戏在PS Store获专属推荐权重"},
        {"name":"💾 PS5定制SSD","desc":"5.5GB/s超高速IO。实现：近乎零加载 + 无缝大世界 + 即时场景切换"},
        {"name":"🎮 DualSense手柄","desc":"触觉反馈(Haptic Feedback) + 自适应扳机(Adaptive Trigger)。深度适配可获媒体好评和平台推荐加权"},
        {"name":"🔊 Tempest 3D音频","desc":"3D空间音频引擎。无需特殊硬件(普通耳机即可)"}
    ]},
    {"title":"PSVR2与VR生态","items":[
        {"name":"🥽 PSVR2硬件","desc":"4K HDR OLED屏幕 + 眼球追踪 + 触觉反馈头戴 + Sense控制器"},
        {"name":"💡 VR市场机会","desc":"VR游戏竞争远小于平面游戏。优质VR内容更容易获PS推荐"},
        {"name":"🖥️ PC兼容","desc":"PSVR2已支持PC连接。开发跨PC+PS5的VR游戏可覆盖更广用户群"}
    ]},
    {"title":"TRC认证核心技术要点","items":[
        {"name":"🎮 DualSense深度适配","desc":"触觉反馈和自适应扳机是TRC认证的重要加分项"},
        {"name":"📋 Activity Cards","desc":"PS5主界面活动卡片(TRC必查项)。需要实现任务进度显示+快速进入+完成时间预估"},
        {"name":"🚀 PS5 Pro适配","desc":"提供PS5 Pro Enhanced模式。利用FSR 4可实现4K 60fps+RT"},
        {"name":"♿ 辅助功能要求","desc":"索尼近年大幅加强辅助功能检查"}
    ]},
    {"title":"技术优先级建议","items":[
        {"name":"🔴 P0必做","desc":"DualSense适配 + Activity Cards + 奖杯系统 + SSD快速加载优化 + 辅助功能基础实现"},
        {"name":"🟡 P1推荐","desc":"PS5 Pro Enhanced模式 + Tempest 3D音频 + 跨世代存档兼容"},
        {"name":"🟢 P2增值","desc":"PSVR2支持 + PS Remote Play优化 + Share功能定制 + PS独占内容"}
    ]}
]}

# ========================================================================
# 执行数据库更新（使用微信云开发数据库封装模块）
# 核心原则：只在策略内容为空时才写入初始数据
# 一旦策略有任何内容，永远不覆盖，以保护已整合的报告数据
# ========================================================================

# 初始化数据库集合和基础数据
wxcloud_db.init_all()

# 获取所有现有策略
all_existing = wxcloud_db.db_query("strategies", limit=100)
existing_strategies = all_existing.get("data", [])

# 构建 id -> strategy 映射
strategy_map = {}
for s in existing_strategies:
    strategy_map[s["id"]] = s

updated_count = 0
skipped_count = 0

for sid, content in strategies.items():
    existing = strategy_map.get(sid)

    if not existing:
        print(f"Strategy id={sid} not found in DB, skipping")
        continue

    existing_content = existing.get("content", "") or ""
    # 如果 content 是字典，转为字符串来检查长度
    if isinstance(existing_content, dict):
        existing_content = json.dumps(existing_content, ensure_ascii=False)

    # 只要 content 字段有任何非空内容，就跳过，绝不覆盖
    if existing_content and len(str(existing_content).strip()) > 10:
        skipped_count += 1
        print(f"Skipped strategy id={sid} (content exists, preserving all data)")
        continue

    # content 为空或极短，才写入初始数据
    content_str = json.dumps(content, ensure_ascii=False)
    wxcloud_db.db_update_by_id("strategies", sid, {
        "content": content_str,
        "version": 1,
        "updated_at": wxcloud_db._now_str()
    })
    updated_count += 1
    print(f"Initialized strategy id={sid} (was empty)")

if updated_count > 0:
    wxcloud_db.add_update_log(
        None, "策略初始化",
        f"首次初始化{updated_count}条空策略，跳过{skipped_count}条已有内容的策略")

print(f"Strategy init complete: {updated_count} initialized, {skipped_count} skipped (preserved)")

# ================================================================
# 增量合并：将模板中的新增 sections 追加到已有策略中
# 安全原则：只追加全新的section，绝不修改或覆盖已有section的内容
# ================================================================
merge_targets = {
    2: strategies.get(2),   # Steam operation
    7: strategies.get(7),   # Xbox promotion
    10: strategies.get(10),  # PlayStation promotion
}

merge_count = 0
for sid, template_content in merge_targets.items():
    if not template_content:
        continue

    existing = strategy_map.get(sid)
    if not existing:
        continue

    existing_content_str = existing.get("content", "") or ""
    if not existing_content_str:
        continue

    if isinstance(existing_content_str, str):
        try:
            existing_content = json.loads(existing_content_str)
        except (json.JSONDecodeError, TypeError):
            continue
    else:
        existing_content = existing_content_str

    existing_sections = existing_content.get("sections", [])
    existing_titles = set()
    for s in existing_sections:
        t = s.get("title") or s.get("标题", "")
        if t:
            existing_titles.add(t)

    template_sections = template_content.get("sections", [])
    new_sections = [s for s in template_sections if s.get("title", "") not in existing_titles]

    if new_sections:
        existing_sections.extend(new_sections)
        existing_content["sections"] = existing_sections
        new_version = existing.get("version", 1) + 1
        wxcloud_db.update_strategy_content(sid, existing_content, new_version)
        merge_count += len(new_sections)
        added_titles = [s.get("title", "")[:30] for s in new_sections]
        print(f"Merged {len(new_sections)} new sections into strategy id={sid}: {added_titles}")

if merge_count > 0:
    merged_platforms = set()
    for sid_key in merge_targets:
        if sid_key == 2:
            merged_platforms.add("Steam")
        elif sid_key == 7:
            merged_platforms.add("Xbox")
        elif sid_key == 10:
            merged_platforms.add("PlayStation")
    platform_names = "、".join(merged_platforms)
    wxcloud_db.add_update_log(
        None, f"{platform_names}推广资源更新",
        f"新增{merge_count}个策略模块")
    print(f"Merge complete: {merge_count} new sections added")
else:
    print("No new sections to merge (all already exist)")

# ================================================================
# 安全检查：仅报告（不修改）策略中可能存在的遗留section
# 注意：不再自动删除任何section，防止误删用户通过报告整合添加的数据
# ================================================================
all_strats_result = wxcloud_db.db_query("strategies", limit=100)
all_strats = all_strats_result.get("data", [])

for row in all_strats:
    content_raw = row.get("content", "") or ""
    if isinstance(content_raw, str):
        if not content_raw:
            continue
        try:
            content = json.loads(content_raw)
        except (json.JSONDecodeError, TypeError):
            continue
    else:
        content = content_raw

    sections = content.get("sections", [])
    section_count = len(sections)
    report_data_count = 0
    for s in sections:
        for item in s.get("items", []):
            report_data_count += len(item.get("report_data", []))

    if section_count > 0 or report_data_count > 0:
        print(f"Strategy id={row['id']}: {section_count} sections, {report_data_count} report_data entries (preserved)")

print("Safety check complete: no data was modified or deleted")