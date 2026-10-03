# OceanBase

> 蚂蚁集团开源的分布式 HTAP 数据库，兼容 MySQL 协议，支持水平扩展与多副本高可用。

## 特点

- 分布式架构，支持水平扩容
- 兼容 MySQL 协议与大部分语法
- 多副本强一致，具备高可用能力

## 核心概念

| 概念 | 说明 |
| --- | --- |
| 租户 | 资源与权限的隔离单元 |
| 分区 | 数据水平拆分的基本单位 |
| 副本 | 数据冗余与选主 |

## 连接示例

~~~sql
obclient -h127.0.0.1 -P2881 -uroot@sys -p
~~~

## 子页面

- [语法](database/oceanbase/syntax)
- [函数](database/oceanbase/functions)
- [易错点](database/oceanbase/pitfalls)
