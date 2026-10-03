# OceanBase 语法

> 以 MySQL 语法为主，分区与 Hint 是分布式场景下的重点。

## 建表

~~~sql
CREATE TABLE user_info (
  id BIGINT PRIMARY KEY,
  name VARCHAR(64) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  KEY idx_created (created_at)
) PARTITION BY HASH(id) PARTITIONS 16;
~~~

## 常用语句

- SELECT / INSERT / UPDATE / DELETE 与 MySQL 基本一致
- EXPLAIN 查看执行计划
- CREATE TABLE ... PARTITION BY 定义分区

## 与 MySQL 的差异

| 项 | 说明 |
| --- | --- |
| 自增列 | 分布式下需配合分区或全局序列 |
| 大事务 | 建议拆分，避免跨分区长事务 |
| Hint | 可用 + 开头的注释指定执行策略 |
