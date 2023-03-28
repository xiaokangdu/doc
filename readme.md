### 远程仓库拉去到本地

---

- 克隆远程仓库到本地

```shell
$ git clone http://160.161.16.12/core/xxxxxxxx.git
```

- 拉去最新版：

```shell
$ git pull
```

- 拉去新代码到本地仓库

```shell
$ git fetch origin master
```

### 添加、删除、重命名

---

- 添加文件，多个文件用空格分隔：

``` shell
$ git add readme.txt
```

- 提交文件到本地仓库：

```shell
$ git commit readme.txt  -m "提交更新说明"
```

- 删除某些文件：

```shell
$ git rm kludge.h obsolete.c
$ git rm -r incriminating/evidence/
```

- 重命名文件：

```shell
$ git mv bug.c feature.c
```

- 查询本地已经commit,但是还未push 的记录：

```shell
$ git log develop  ^origin/develop
```

### 撤销/重做

---

- 显示最近提交列表，以及查看他们的SHA1哈希值：

```shell
$ git log
```

- 来恢复到一个指定的提交状态，并从记录里永久抹掉所有比该记录新一些的提交：

```shell
$ git reset --hard 0a9c
```

- 撤销一个提交，将撤销给定哈希值的提交。本撤销被记录为一个新的提交，你可以通过运行 **git log** 来确认这一点：

```shell
$ git commit -a
$ git revert 1b6d
```

- 一个特定版本与倒数第二个变更之间的更改或者两个特定版本之间的更改：

```shell
$ git diff 0a9cb2b "develop~2"
$ git diff 0a9cb2b 18e77e1
```
