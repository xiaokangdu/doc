# MySQL

> 使用最广泛的开源关系型数据库，InnoDB 提供事务与行级锁。

## 特点

- 生态与工具链丰富
- InnoDB 支持事务与行级锁
- 主从复制与读写分离成熟

## 核心概念

| 概念 | 说明 |
| --- | --- |
| 存储引擎 | InnoDB 为默认且最常用 |
| 索引 | B+ 树为主，覆盖索引可避免回表 |
| 隔离级别 | 默认 REPEATABLE READ |

## 连接示例

~~~sql
mysql -h127.0.0.1 -P3306 -uroot -p
~~~

## 子页面

- [语法](database/mysql/syntax)
- [函数](database/mysql/functions)
- [易错点](database/mysql/pitfalls)
