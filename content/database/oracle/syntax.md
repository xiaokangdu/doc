# Oracle 语法

> 建表、序列与分页是日常最常用的部分。

## 建表与序列

~~~sql
CREATE TABLE employee (
  id NUMBER(18) PRIMARY KEY,
  name VARCHAR2(64) NOT NULL,
  salary NUMBER(12,2),
  created_at DATE DEFAULT SYSDATE
);

CREATE SEQUENCE seq_employee START WITH 1 INCREMENT BY 1;
~~~

## 分页查询

~~~sql
SELECT * FROM employee
ORDER BY id
OFFSET 20 ROWS FETCH NEXT 10 ROWS ONLY;
~~~

## 常用语句

- MERGE INTO 做批量 upsert
- TRUNCATE 快速清空且不可回滚
- EXPLAIN PLAN FOR 查看执行计划
