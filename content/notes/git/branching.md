# 分支管理

分支让「开发新功能」和「保持主干稳定」可以同时进行。

## 常用分支策略

- **main**：随时可发布的稳定分支
- **feature/xxx**：单个功能的开发分支
- **hotfix/xxx**：紧急线上修复

## 日常工作流

~~~bash
git switch -c feature/search     # 从当前分支创建并切换
# ... 编辑、提交 ...
git switch main                  # 回到主干
git pull                         # 同步最新代码
git merge feature/search         # 合并功能分支
git branch -d feature/search     # 删除已完成的分支
~~~

## 合并与变基

| 方式 | 特点 | 适用场景 |
| --- | --- | --- |
| merge | 保留完整分支历史 | 团队协作、功能合并 |
| rebase | 历史线性整洁 | 个人分支整理后再合并 |

> 已经推送到远程的公共分支，不要随意 rebase，否则会给协作者带来麻烦。

## 冲突处理三步

1. 打开冲突文件，找到 <<<<<<< 标记
2. 保留正确内容并删除标记
3. git add 冲突文件，然后 git commit

返回 [Git 基础](notes/git/git-basics)。
