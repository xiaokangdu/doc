# Map

> Map 存储键值对，HashMap 是使用最广的实现。

## 实现对比

| 实现 | 特点 |
| --- | --- |
| HashMap | 无序，查询 O(1) |
| LinkedHashMap | 保留插入顺序 |
| TreeMap | 按 key 排序 |
| ConcurrentHashMap | 线程安全 |

## 示例

~~~java
Map<String, Integer> map = new HashMap<>();
map.put("a", 1);
int v = map.getOrDefault("b", 0); // 0
map.forEach((k, val) -> System.out.println(k + "=" + val));
~~~

## 注意

1. key 必须正确重写 equals 与 hashCode
2. 不要在遍历时直接 put / remove
3. 并发场景用 ConcurrentHashMap 而非 HashMap
