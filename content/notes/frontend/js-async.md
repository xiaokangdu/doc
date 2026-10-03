# JavaScript 异步编程

异步是 JavaScript 的核心特征。从回调到 Promise，再到 async / await，写法越来越接近同步代码。

## 演进过程

1. **回调函数**：容易层层嵌套，形成回调地狱
2. **Promise**：用 then / catch 串联异步流程
3. **async / await**：让异步代码读起来像同步代码

## Promise 基础

~~~javascript
fetch('/api/list')
  .then(function (res) { return res.json(); })
  .then(function (data) { console.log(data); })
  .catch(function (err) { console.error(err); });
~~~

## async / await

~~~javascript
async function loadList() {
  try {
    const res = await fetch('/api/list');
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('加载失败', err);
  }
}
~~~

## 并发控制

| 方法 | 行为 |
| --- | --- |
| Promise.all | 全部成功才成功，任一失败即失败 |
| Promise.allSettled | 等待全部结束，返回每个结果状态 |
| Promise.race | 谁先结束就返回谁 |

> 需要多个互不依赖的请求时，用 Promise.all 并发执行，比逐个 await 快得多。

## 常见坑

- 忘记 await，拿到的是 Promise 而不是结果
- 在循环里串行 await，性能较差，应改为并发
- 未处理 reject，导致 unhandledrejection
