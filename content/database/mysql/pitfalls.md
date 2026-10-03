# MySQL 易错点

> 深分页、隐式转换与索引失效是最高频的三个坑。

## 常见易错点

1. 大偏移 LIMIT 深分页性能差，应改用游标或延迟关联
2. 字段类型不一致触发隐式转换，索引失效
3. 对索引列使用函数或前导通配 LIKE
4. 长事务与锁等待拖垮并发
5. 字符集不统一导致索引或排序异常

## 示例

~~~sql
-- 深分页
SELECT * FROM order_info ORDER BY id LIMIT 1000000, 20;

-- 优化：基于游标
SELECT * FROM order_info WHERE id > 1000000 ORDER BY id LIMIT 20;
~~~

## 提示

> 上线前用 EXPLAIN 检查 type 与 rows，避免全表扫描。
