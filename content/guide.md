# 站点使用指南

这份指南说明如何维护站点、新增页面，以及如何发布到 GitHub Pages。

## 目录结构

~~~text
knowledge-site/
├── index.html              页面骨架（基本不用改）
├── assets/
│   ├── css/style.css       浅色主题与动画
│   └── js/
│       ├── markdown.js     零依赖 Markdown 渲染器
│       ├── core.js         菜单/搜索等纯逻辑
│       └── app.js          路由与交互
├── content/
│   ├── nav.json            菜单配置（唯一需要手工维护的清单）
│   ├── home.md             首页
│   └── notes/              所有笔记，按主题分文件夹
├── scripts/new-note.mjs    新增笔记的小工具
└── tests/test.cjs          核心逻辑单元测试
~~~

## 新增一篇笔记

### 方式一：手动（推荐，最直观）

1. 在 content 下新建文件，例如 content/notes/frontend/regex.md
2. 用一级标题开头：

~~~markdown
# 正则表达式速查

## 常用元字符

| 符号 | 含义 |
| --- | --- |
| . | 任意字符 |
| * | 零次或多次 |
~~~

3. 在 content/nav.json 的对应分组中加入一行：

~~~json
{ "title": "正则表达式速查", "path": "notes/frontend/regex" }
~~~

4. 保存后刷新页面即可，无需重新构建。

### 方式二：命令行工具

~~~bash
node scripts/new-note.mjs --title "正则表达式速查" --path "notes/frontend/regex" --group "前端"
~~~

该命令会自动创建 Markdown 文件，并把菜单项插入到名为「前端」的分组中。

## 菜单可以有多少层

不限层级。nav.json 里带 children 的节点就是分组，带 path 的节点就是页面：

~~~json
{
  "title": "编程基础",
  "children": [
    { "title": "Git", "children": [
      { "title": "Git 基础", "path": "notes/git/git-basics" }
    ] }
  ]
}
~~~

## 支持的 Markdown 语法

- 标题、粗体、斜体、删除线
- 行内代码与围栏代码块（带复制按钮）
- 有序 / 无序列表，支持嵌套
- 引用、分割线、表格（支持左中右对齐）
- 链接与图片，跳转站内笔记可直接写相对路径

## 发布到 GitHub Pages

1. 新建一个 GitHub 仓库，例如 my-notes
2. 把 knowledge-site 目录里的**全部内容**推送到仓库根目录
3. 打开仓库 Settings → Pages
4. 在 Build and deployment 处选择 Deploy from a branch
5. Branch 选 main，目录选 / (root)，保存
6. 等待约一分钟，访问 https://你的用户名.github.io/my-notes/

> 页面使用哈希路由（网址里的 #/），因此不需要任何服务器跳转配置，子路径部署也能正常工作。

## 本地预览

~~~bash
cd knowledge-site
python3 -m http.server 8080
# 然后浏览器打开 http://localhost:8080
~~~

直接双击 index.html 会因浏览器安全策略无法读取笔记，请务必使用本地服务器。
