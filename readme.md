# my-redux-saga

一个简化版的 redux-saga 实现，用于学习 redux-saga 的核心原理：
- Generator 驱动异步流程
- Effects 与任务调度模型
- fork/spawn 等任务模型
- 自定义 Channel 实现 action 调度

---

## ✨ 特性

- 支持 `take` / `put`
- 支持 `call` / `fork` / `spawn` / `cancel`
- 支持 `takeEvery`、`takeLatest`、`takeLeading` 等工具方法
- 内部使用 Generator 函数管理异步副作用
- 模拟 redux-saga 的中间件模型

---

## 🚀 安装

无需额外依赖，直接引入你的源码即可：

```js
import createSagaMiddleware from './my-redux-saga/sagaMiddleware'
import { takeEvery, delay } from './my-redux-saga/io'
```

---

## 🔧 使用方法

### 1. 创建 saga middleware

```js
import createSagaMiddleware from './my-redux-saga/sagaMiddleware'
const sagaMiddleware = createSagaMiddleware()
```

### 2. 应用到 Redux store

```js
import { legacy_createStore as createStore, applyMiddleware } from 'redux'

const store = createStore(reducer, applyMiddleware(sagaMiddleware))
```

### 3. 编写 saga

```js
import { takeEvery, call, put, delay } from './my-redux-saga/io'

function* asyncAdd() {
  yield call(delay, 1000)
  yield put({ type: 'ADD' })
}

function* rootSaga() {
  yield takeEvery('ASYNC_ADD', asyncAdd)
}
```

### 4. 启动 saga

```js
sagaMiddleware.run(rootSaga)
```

---

## 🔄 效果示例

```js
store.dispatch({ type: 'ASYNC_ADD' })
// 等待 1 秒后自动派发 ADD
```

---

## 📚 支持的 Effect

| Effect | 描述 |
|--------|------|
| `take(pattern)` | 等待某个 action 被派发 |
| `put(action)` | 派发一个 action |
| `call(fn, ...args)` | 调用一个返回 Promise 的函数 |
| `fork(fn, ...args)` | 启动一个子任务，不阻塞当前流程 |
| `spawn(fn, ...args)` | 启动一个 **不受父任务影响** 的子任务 |
| `cancel(task)` | 取消一个任务 |
| `select(selector)` | 获取 redux state |
| `all([...effects])` | 并发多个 effects（可扩展） |
| `race([...effects])` | 竞态执行（可扩展） |

---

## 🔁 常用辅助方法

| 方法 | 描述 |
|------|------|
| `takeEvery(pattern, saga)` | 每次 action 到来都执行 saga |
| `takeLatest(pattern, saga)` | 只保留最新的任务，取消上一个 |
| `takeLeading(pattern, saga)` | 只处理第一个任务，后续忽略直到完成 |
| `throttle(ms, pattern, saga)` | 节流执行 |

---

## 🧪 示例 saga：spawn 不随父任务取消

```js
function* root() {
  const task = yield spawn(function* () {
    yield delay(5000)
    console.log('detached task finished')
  })

  yield delay(1000)
  // 即使 root 返回了，spawn 的任务仍然继续运行
}
```

---

## 📦 目录结构建议

```
my-redux-saga/
├── channel.ts
├── effectTypes.ts
├── io.ts
├── proc.ts
├── runSaga.ts
├── sagaError.ts
├── symbols.ts
├── task-status.ts
├── taskQueue.ts
├── uid.ts
└── utils.ts
```

---

## 🙌 致谢

此项目为学习 `redux-saga` 的原理之作，简化了实际实现，仅用于教育用途。

欢迎提 Issue / PR 交流实现思想。