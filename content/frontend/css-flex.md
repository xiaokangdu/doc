# CSS Flex 布局

Flex 是为一维布局设计的现代方案，适合导航栏、卡片行、居中对齐等场景。

## 两个角色

- **容器**：设置 display: flex 的元素
- **项目**：容器的直接子元素

## 容器属性速查

| 属性 | 作用 | 常用值 |
| --- | --- | --- |
| flex-direction | 主轴方向 | row / column |
| justify-content | 主轴对齐 | flex-start / center / space-between |
| align-items | 交叉轴对齐 | stretch / center / flex-start |
| flex-wrap | 是否换行 | nowrap / wrap |
| gap | 项目间距 | 12px |

## 项目属性

~~~css
.card {
  flex: 1 1 220px;   /* grow shrink basis：可伸可缩，基准 220px */
  align-self: center; /* 单独覆盖交叉轴对齐 */
}
~~~

## 三个经典场景

1. **水平垂直居中**：justify-content: center + align-items: center
2. **两端对齐导航**：justify-content: space-between
3. **等宽卡片并排**：每个卡片 flex: 1，并设置 gap

> 记住：Flex 只管一个方向。需要同时控制行和列时，请使用 CSS Grid。
