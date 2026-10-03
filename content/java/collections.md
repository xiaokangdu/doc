# 集合框架

> 集合分为 Collection 与 Map 两大体系，选对实现类是性能关键。

## 体系

- Collection：List（有序可重复）、Set（去重）
- Map：键值对存储
- 工具类 Collections 与 Arrays

## 选型

| 需求 | 推荐 |
| --- | --- |
| 随机访问多 | ArrayList |
| 频繁头部插入删除 | LinkedList |
| 去重 | HashSet |
| 排序集合 | TreeSet / TreeMap |
| 键值映射 | HashMap |

## 子页面

- [List 与 Set](java/collections/list-set)
- [Map](java/collections/map)
