# 纯净生存服务器 · 宣传网站

我的世界 Java 版纯净生存服务器的宣传单页站。**纯静态**（HTML + CSS + JS），无任何后端，无外部依赖，托管成本为 0。

- 🌐 站点上线地址：https://upkea.github.io/mc-server-site/
- 服务器地址：`play.simpfun.cn:19573`
- 游戏版本：Java 版 1.21.1
- QQ 群：1107711066

---

## 一、文件结构

```
mc-server-site/
├── index.html      # 页面内容（改文案在这里）
├── css/style.css   # 样式（改颜色/布局在这里）
├── js/main.js      # 交互脚本 + 服务器配置
├── robots.txt      # 搜索引擎爬虫许可
└── README.md       # 本说明
```

## 二、修改服务器信息

**只需要改 `js/main.js` 最顶部的 `SERVER` 对象**，页面上所有地址、版本、群号都会自动同步：

```js
var SERVER = {
  address: 'play.simpfun.cn:19573', // 服务器地址（含端口）
  version: 'Java 版 1.21.1',        // 游戏版本
  group: '1107711066'               // QQ 群号
};
```

要修改页面文案（简介、特色、规则等），直接编辑 `index.html` 对应小节。

## 三、本地预览

双击 `index.html` 即可打开（推荐用本地服务器方式，效果完全一致）：

```bash
# 方式一：Python（推荐）
cd mc-server-site
python -m http.server 8080
# 浏览器打开 http://localhost:8080

# 方式二：Node
npx serve .
```

## 四、免费部署（三种任选，全部 0 元）

### 方案 A：GitHub Pages（推荐，免费、可绑定自定义域名）
1. 新建一个 GitHub 仓库（如 `mc-server-site`），把 `mc-server-site` 文件夹里的内容全部上传到仓库根目录；
2. 仓库 → `Settings` → `Pages` → `Build and deployment` → Source 选 `Deploy from a branch`，分支选 `main`，目录选 `/ (root)`；
3. 等 1–2 分钟，访问 `https://你的用户名.github.io/mc-server-site/`。

### 方案 B：Cloudflare Pages（免费、全球 CDN、国内访问相对较好）
1. 注册 [Cloudflare](https://dash.cloudflare.com)（免费）；
2. 左侧 `Workers & Pages` → `Create` → `Pages` → `Upload assets`；
3. 把整个 `mc-server-site` 文件夹拖进去，点击部署，即可得到 `https://xxx.pages.dev` 地址；
4. 后续更新：重新上传文件夹即可。

### 方案 C：Netlify Drop（免费、最简单）
1. 打开 [app.netlify.com/drop](https://app.netlify.com/drop)；
2. 把 `mc-server-site` 文件夹直接拖进页面，自动获得 `https://xxx.netlify.app` 地址。

## 五、关于域名（可选，非必需）

- 不花钱：直接用上面得到的 `github.io` / `pages.dev` / `netlify.app` 免费域名；
- 想要好记的域名：买个便宜域名（`.com` 约 10 美元/年，国内平台常有新用户优惠），
  然后在 GitHub Pages / Cloudflare Pages 的域名设置里绑定即可。
- 如果主要面向国内玩家且希望速度快，可以考虑 Cloudflare Pages 免费版，
  或后续升级到国内对象存储静态网站托管（腾讯云 COS / 阿里云 OSS，按量付费约几元/月）。

## 六、功能说明

| 功能 | 说明 |
| --- | --- |
| 复制地址/群号 | 点击按钮一键复制，成功后按钮变绿提示「已复制 ✓」 |
| 一键加群 | 「一键加群」按钮：手机端直接跳转 QQ 群卡片申请加群；电脑端自动复制群号，到 QQ 搜索即可加群 |
| 在线状态 | 页面自动调用 [mcsrvstat.us](https://mcsrvstat.us) 免费 API 检测服务器是否在线、在线人数和玩家上限；服务器未开或 API 不可用时会显示「暂未开服/状态未知」 |
| 常见问题折叠 | 点击问题展开/收起 |
| 移动端适配 | 小屏自动折叠导航、单列布局 |

> 提示：复制功能在 `https` 或 `localhost` 下最稳定；部署到免费平台后即为 https，无需担心。

> ✅ 已配置官方加群链接（`js/main.js` 顶部 `GROUP.officialUrl`），「一键加群」按钮手机/电脑都直接跳官方加群页。
> 如果以后链接失效（`authKey` 过期），重新在 QQ 群管理 → 加群设置 → 「加群链接」生成新链接替换即可。

## 七、SEO 与分享

`index.html` 的 `<head>` 里已写好 `title` 和 `description`，用于搜索引擎收录和微信/QQ 分享卡片。
想让分享卡片更好看，可以在 `<head>` 中加入 Open Graph 标签（例如 `og:image` 指向一张服务器宣传图），需要时可再帮你加。
