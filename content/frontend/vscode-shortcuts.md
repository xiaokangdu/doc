# VS Code 快捷键

熟练使用快捷键能显著减少鼠标切换，让编辑保持连贯。

## 编辑

| 快捷键 | 功能 |
| --- | --- |
| Cmd/Ctrl + D | 选中下一个相同单词 |
| Cmd/Ctrl + Shift + K | 删除整行 |
| Option/Alt + ↑ / ↓ | 移动整行 |
| Shift + Option/Alt + ↓ | 向下复制整行 |
| Cmd/Ctrl + / | 注释 / 取消注释 |

## 导航

| 快捷键 | 功能 |
| --- | --- |
| Cmd/Ctrl + P | 按文件名快速打开 |
| Cmd/Ctrl + Shift + F | 全项目搜索 |
| Cmd/Ctrl + Shift + [ / ] | 折叠 / 展开代码块 |
| F12 | 跳转到定义 |
| Shift + F12 | 查看引用 |

## 多光标

~~~text
1. 按住 Option/Alt 点击，添加多个光标
2. Cmd/Ctrl + D 逐个选择相同单词
3. Cmd/Ctrl + Shift + L 选中所有相同单词
~~~

## 推荐设置

- 开启自动保存：files.autoSave 设为 onFocusChange
- 保存时格式化：editor.formatOnSave 设为 true
- 显示空白字符：editor.renderWhitespace 设为 boundary

> 把这些形成肌肉记忆，长期收益很大。
