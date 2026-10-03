# 变量与类型

> Java 有 8 种基本类型，以及对应的包装类型。

## 基本类型

| 类型 | 占用 | 说明 |
| --- | --- | --- |
| byte | 1 字节 | -128 ~ 127 |
| short | 2 字节 | -32768 ~ 32767 |
| int | 4 字节 | 最常用的整数类型 |
| long | 8 字节 | 字面量需加 L |
| float | 4 字节 | 字面量需加 f |
| double | 8 字节 | 默认浮点类型 |
| char | 2 字节 | 单个字符 |
| boolean | 1 位 | true / false |

## 包装类型

- 支持自动装箱与拆箱
- Integer 缓存 -128 ~ 127
- 比较值相等要使用 equals

## 示例

~~~java
int a = 10;
Integer b = 10;        // 自动装箱
long c = 100L;
double d = 3.14;
boolean ok = a == b;   // 拆箱后比较
~~~

## 易错点

1. 浮点数用 == 比较不精确，应使用误差范围或 BigDecimal
2. Integer 超出缓存范围后用 == 比较会失败
3. long 字面量忘记加 L 可能溢出
