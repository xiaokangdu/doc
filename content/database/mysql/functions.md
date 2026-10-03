# MySQL 函数

> 字符串、日期与窗口函数是最常用的一类。

## 常用函数

| 类型 | 示例 |
| --- | --- |
| 字符串 | CONCAT / SUBSTRING / TRIM |
| 日期 | NOW / DATE_FORMAT / DATEDIFF |
| 条件 | IFNULL / IF / CASE WHEN |

## 窗口函数示例

~~~sql
SELECT user_id, amount,
  SUM(amount) OVER (PARTITION BY user_id) AS total
FROM order_info;
~~~

## 注意

- 版本 8.0 起支持窗口函数
- GROUP_CONCAT 注意长度限制
- 日期函数包在索引列上会失效
