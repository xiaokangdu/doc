# Git 基础

Git 是分布式的版本控制系统。理解「工作区 → 暂存区 → 本地仓库 → 远程仓库」这条链路，就掌握了它的大部分日常操作。

## 核心概念

| 区域 | 说明 | 常用命令 |
| --- | --- | --- |
| 工作区 | 你正在编辑的文件 | 直接修改 |
| 暂存区 | 准备提交的快照 | git add |
| 本地仓库 | 已提交的历史 | git commit |
| 远程仓库 | GitHub 等托管平台 | git push / pull |

## 最常用的几条命令

~~~bash
git status                 # 查看当前改动
git add .                  # 把所有改动加入暂存区
git commit -m "说明"       # 提交为一个快照
git log --oneline --graph  # 以图形方式查看历史
git push origin main       # 推送到远程
~~~

## 提交信息怎么写

一条好的提交信息通常包含三部分：

- **类型**：feat / fix / docs / refactor
- **范围**：改动了哪个模块
- **描述**：一句话说清做了什么

~~~text
feat(search): 支持按标题和正文搜索
fix(nav): 修复移动端菜单无法收起的问题
~~~

> 小技巧：提交前先执行 git diff，确认没有把调试代码和密钥一起提交。

## 常见问题

1. **提交错了信息**：使用 git commit --amend 修改最近一次提交
2. **想撤销暂存**：使用 git restore --staged 文件名
3. **想看某行是谁改的**：使用 git blame 文件名

下一步可以阅读 [分支管理](notes/git/branching)。
