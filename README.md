# 晓康的笔记 · 静态站点

一个用于个人知识沉淀的纯静态网站：**零构建、零依赖、浅色主题**。
顶部用**分段控件**切换大类，左侧是**可逐级下钻的子菜单**，页面内再细分到具体知识点。

## 导航结构（三层）

| 层级 | 位置 | 说明 |
| --- | --- | --- |
| 第一层：大类 | 顶部分段控件 | 数据库 / JAVA / GIT / 业务规则 / 前端，可继续新增 |
| 第二层：子主题 | 左侧菜单 | 如 数据库 → OceanBase / Oracle / MySQL |
| 第三层：知识点 | 点击子主题后，左侧菜单替换为它 | 如 Oracle → 语法 / 函数 / 易错点 |

点击子主题会进入它的概览页，同时左侧菜单变成它的知识点列表，并提供「返回上一级」。

## 特性

- 分段控件式顶部导航，数据驱动，随时新增分类
- 三级钻取菜单，层级清晰
- 全站搜索：匹配标题与正文
- 阅读体验：面包屑、本页目录、上一篇 / 下一篇、阅读进度条、代码一键复制
- 页面内「回到顶部」按钮 + 右下角浮动按钮
- 菜单不含徽标 / emoji，界面更干净
- 浅色主题，柔和的蓝青配色
- 纯静态、哈希路由，部署在 GitHub Pages 子路径下也能直接工作

## 目录结构

~~~text
knowledge-site/
├── index.html
├── assets/
│   ├── css/style.css
│   └── js/{markdown.js, core.js, app.js}
├── content/
│   ├── nav.json          菜单配置（顶部大类 + 左侧子菜单）
│   ├── home.md           首页
│   ├── database/         数据库：oceanbase / oracle / mysql
│   ├── java/             JAVA：基础语法 / 集合框架
│   ├── git/              GIT：基础 / 分支 / 远程
│   ├── business/         业务规则：订单 / 风控
│   └── frontend/         前端：CSS / JS / 工具
├── scripts/new-note.mjs  新增笔记工具
└── tests/                自检脚本
~~~

## 本地预览

~~~bash
cd knowledge-site
python3 -m http.server 8080
# 浏览器打开 http://localhost:8080
~~~

> 请勿直接双击 index.html，浏览器安全策略会阻止读取笔记文件。

## 新增一个大类

在 content/nav.json 的 nav 数组追加一个节点，并新建对应概览页：

~~~json
{ "title": "算法", "path": "algorithm", "children": [
  { "title": "排序", "path": "algorithm/sort" }
] }
~~~

顶部会自动多出一个分段按钮。

## 新增一个知识点

~~~bash
node scripts/new-note.mjs --title "索引提示" --path "database/oracle/index-hint" --group "Oracle"
~~~

或手动新建 content/database/oracle/index-hint.md，并在 nav.json 的 Oracle children 里加一条记录。

## 运行自检

~~~bash
cd knowledge-site
node tests/test.cjs           # Markdown 渲染器单元测试
node tests/core-nav.test.cjs  # 导航层级逻辑测试
node tests/check-site.cjs     # 菜单 / 内容 / 链接 / 骨架完整性检查
~~~

## 发布到 GitHub Pages

1. 把 knowledge-site 目录内的全部内容推送到仓库根目录
2. 仓库 Settings → Pages
3. Build and deployment 选择 Deploy from a branch
4. Branch 选择 main，目录选择 / (root)，保存
5. 访问 https://用户名.github.io/仓库名/

## 自定义

- 站点标题、更新时间：content/nav.json 的 site 字段
- 配色与圆角：assets/css/style.css 顶部的 CSS 变量
