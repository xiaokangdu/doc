# Oracle 函数

> NVL、DECODE 与分析函数是 Oracle 日常使用的高频函数。

## 常用函数

| 函数 | 用途 |
| --- | --- |
| NVL | 空值替换 |
| DECODE | 条件分支 |
| TO_CHAR | 日期与数字格式化 |
| ROW_NUMBER | 窗口排名 |
| LISTAGG | 分组字符串聚合 |

## 分析函数示例

~~~sql
SELECT dept_id, name, salary,
  RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS rk
FROM employee;
~~~

## 注意

- NVL 两个参数的类型需兼容
- 显式使用 TO_CHAR / TO_DATE，避免隐式转换
- 分析函数不能直接写在 WHERE 中
