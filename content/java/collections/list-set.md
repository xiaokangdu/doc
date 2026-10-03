# List 与 Set

> List 有序可重复，Set 天然去重。

## 对比

| 特性 | List | Set |
| --- | --- | --- |
| 顺序 | 有序 | HashSet 无序 |
| 重复 | 允许 | 不允许 |
| 索引访问 | 支持 | 不支持 |

## 常用实现

- ArrayList：数组实现，随机访问快
- LinkedList：链表实现，增删快
- HashSet：哈希去重，最快
- LinkedHashSet：保留插入顺序
- TreeSet：按大小排序

## 示例

~~~java
List<String> list = new ArrayList<>();
list.add("a");
list.add("a");
Set<String> set = new HashSet<>(list);
System.out.println(list.size()); // 2
System.out.println(set.size());  // 1
~~~

## 注意

1. ArrayList 扩容有成本，能预估容量就预设
2. 遍历时删除元素要用 Iterator.remove()
3. 自定义对象放入 Set 需正确重写 equals 与 hashCode
