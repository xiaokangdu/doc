# 知识笔记 · 静态站点

一个用于个人知识笔记沉淀的纯静态网站：**零构建、零依赖、浅色主题、支持多级菜单、全文搜索与交互式阅读体验**。
直接推送到 GitHub Pages 即可访问。

## 特性

- 分级菜单：菜单由 content/nav.json 驱动，层级不限，随时新增页面
- 全文搜索：顶栏输入关键词，同时匹配标题与正文
- 阅读体验：面包屑、本页目录、上一篇/下一篇、阅读进度条、代码一键复制
- 交互动画：页面淡入、菜单展开、卡片悬浮、返回顶部（克制、不浮夸）
- 浅色主题：柔和的蓝青配色，适合长时间阅读
- 纯静态：无框架、无构建、无网络依赖，可直接托管在 GitHub Pages 子路径下

## 目录结构

~~~text
knowledge-site/
├── index.html
├── assets/
│   ├── css/style.css
│   └── js/{markdown.js, core.js, app.js}
├── content/
│   ├── nav.json          菜单配置
│   ├── home.md           首页
│   └── notes/            笔记内容
├── scripts/new-note.mjs  新增笔记工具
└── tests/                自检脚本
~~~

## 本地预览

~~~bash
cd knowledge-site
python3 -m http.server 8080
# 浏览器打开 http://localhost:8080
~~~

> 请勿直接双击 index.html：浏览器出于安全策略会阻止读取笔记文件。

## 新增一篇笔记

1. 在 content 下新建 Markdown 文件，例如 content/notes/frontend/regex.md
2. 在 content/nav.json 对应位置加入一条记录：

~~~json
{ "title": "正则表达式速查", "path": "notes/frontend/regex" }
~~~

3. 刷新页面即可，无需构建。

也可以使用命令行工具自动完成：

~~~bash
node scripts/new-note.mjs --title "正则表达式速查" --path "notes/frontend/regex" --group "前端"
~~~

## 运行自检

~~~bash
cd knowledge-site
node tests/test.cjs        # 渲染器与工具函数单元测试
node tests/check-site.cjs  # 菜单、内容、链接、页面骨架完整性检查
~~~

## 发布到 GitHub Pages

1. 新建仓库（例如 my-notes），把 knowledge-site 目录内的全部内容推送到仓库根目录
2. 仓库 Settings → Pages
3. Build and deployment 选择 Deploy from a branch
4. Branch 选择 main，目录选择 / (root)，保存
5. 稍等片刻，访问 https://你的用户名.github.io/my-notes/

站点使用哈希路由（地址中的 #/），因此部署在任意子路径下都不需要额外配置。

## 自定义

- 站点标题、页脚、更新时间：修改 content/nav.json 的 site 字段
- 配色与圆角：修改 assets/css/style.css 顶部的 CSS 变量
