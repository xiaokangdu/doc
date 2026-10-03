# 流程控制

> 分支与循环是所有逻辑的骨架。

## 分支

- if / else if / else
- switch（支持字符串与枚举）
- 三元运算符 ?:

## 循环

- for、while、do-while
- 增强 for 遍历集合或数组
- break / continue 控制流程

## 示例

~~~java
int score = 86;
if (score >= 60) {
    System.out.println("及格");
} else {
    System.out.println("不及格");
}

for (int i = 0; i < 3; i++) {
    System.out.println(i);
}
~~~

## 易错点

1. switch 忘记 break 会穿透
2. 浮点数不要直接用 == 做循环终止条件
3. 增强 for 中删除元素会抛异常，应使用 Iterator
