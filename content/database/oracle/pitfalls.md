# Oracle 易错点

> 隐式类型转换、空值语义和大事务是最常见的坑。

## 常见易错点

1. 隐式类型转换导致索引失效
2. 索引列上使用 NVL / TO_CHAR 等函数
3. 空字符串等于 NULL，需用 IS NULL 判断
4. 大事务未分批提交导致回滚段膨胀
5. ROWNUM 与 ORDER BY 的执行顺序理解错误

## 示例

~~~sql
-- 不推荐：列上包函数
SELECT * FROM employee WHERE TO_CHAR(created_at, 'YYYY') = '2024';

-- 推荐：范围查询
SELECT * FROM employee
WHERE created_at >= DATE '2024-01-01'
  AND created_at <  DATE '2025-01-01';
~~~

## 提示

> 用 EXPLAIN PLAN + DBMS_XPLAN 确认是否走索引，不要凭直觉。
