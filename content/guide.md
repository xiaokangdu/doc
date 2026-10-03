# 站点使用指南

> 站点是纯静态的「顶部大类 + 左侧子主题 + 页面内知识点」三层结构，全部由 content/nav.json 驱动。

## 目录结构

~~~text
knowledge-site/
├── index.html
├── assets/{css,js}
├── content/
│   ├── nav.json          ★ 菜单配置（顶部大类 + 左侧子菜单）
│   ├── home.md           首页
│   ├── database/         数据库：oceanbase / oracle / mysql
│   ├── java/             JAVA：基础语法 / 集合框架
│   ├── git/              GIT：基础 / 分支 / 远程
│   ├── business/         业务规则：订单 / 风控
│   └── frontend/         前端：CSS / JS / 工具
├── scripts/new-note.mjs  新增笔记工具
└── tests/                自检脚本
~~~

## 三层菜单怎么对应

| 层级 | 位置 | nav.json 字段 |
| --- | --- | --- |
| 第一层（大类） | 顶部**分段控件** | nav 数组的顶层节点 |
| 第二层（子主题） | 左侧菜单 | 顶层节点的 children |
| 第三层（知识点） | 点击子主题后左侧菜单替换为它 | 子主题节点的 children |

## 新增一个大类

在 content/nav.json 的 nav 数组末尾追加：

~~~json
{ "title": "算法", "path": "algorithm", "children": [
  { "title": "排序", "path": "algorithm/sort" }
] }
~~~

同时新建 content/algorithm.md（大类概览页）即可。顶部会自动多出一个分段按钮。

## 新增一个知识点

1. 新建 content/database/oracle/index-hint.md
2. 在 nav.json 里 Oracle 的 children 中加一条：

~~~json
{ "title": "索引提示", "path": "database/oracle/index-hint" }
~~~

也可以使用命令行工具：

~~~bash
node scripts/new-note.mjs --title "索引提示" --path "database/oracle/index-hint" --group "Oracle"
~~~

## 本地预览与发布

~~~bash
python3 -m http.server 8080
# 打开 http://localhost:8080
~~~

推送到 GitHub 后，仓库 Settings → Pages 选择 main 分支根目录即可，地址形如 https://用户名.github.io/仓库名/。
