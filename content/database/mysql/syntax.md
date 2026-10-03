# MySQL 语法

> 建表、分页与执行计划是日常最高频的操作。

## 建表

~~~sql
CREATE TABLE order_info (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
~~~

## 分页

~~~sql
SELECT * FROM order_info ORDER BY id DESC LIMIT 20 OFFSET 40;
~~~

## 常用语句

- EXPLAIN 查看执行计划
- SHOW INDEX FROM 表名 查看索引
- ALTER TABLE 增加或删除索引
