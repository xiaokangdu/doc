# OceanBase 函数

> 兼容 MySQL 常用函数，并提供分布式场景下的并行与窗口能力。

## 常用函数

| 类型 | 示例 |
| --- | --- |
| 字符串 | CONCAT / SUBSTR / LENGTH |
| 日期 | NOW / DATE_ADD / DATEDIFF |
| 聚合 | COUNT / SUM / GROUP_CONCAT |

## 窗口函数示例

~~~sql
SELECT id, name,
  ROW_NUMBER() OVER (PARTITION BY dept ORDER BY score DESC) AS rn
FROM employee;
~~~

## 使用建议

- 过滤条件尽量走索引
- 大表聚合注意并行度与内存
- 函数包在列上容易导致索引失效
