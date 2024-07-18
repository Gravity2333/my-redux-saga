/**
 * 展示如何自动运行 同步/异步生成器代码
 */

/** 运行同步的生成器函数 */
export function runSyncGenerator(generatorFunc, ...args) {
  const iterator = generatorFunc.apply(this, args);
  let iteratorResult = iterator.next();
  while (!iteratorResult.done) {
    iteratorResult = iterator.next(iteratorResult.value);
  }
  return iteratorResult.value;
}

/** 运行异步生成器函数 */
export function runAsyncGrnerator(generatorFunc, ...args) {
  const iterator = generatorFunc.apply(this, args);
  function handleRun(value) {
    const iteratorResult = iterator.next(value);
    if (iteratorResult.done) {
      // 执行完成，直接返回value
      return iteratorResult.value;
    } else {
      // 执行未完成，继续运行，
      if (iteratorResult.value instanceof Promise) {
        // 如果是promise类型，则监听结果，并且加入微任务队列
        return iteratorResult.value.then(handleRun, (e) => iterator.throw(e));
      } else {
        // 如果yield后面是同步代码，则直接调用handleRun
        return handleRun(iteratorResult.value);
      }
    }
  }
  // 异步函数，整体要返回一个Promise
  return Promise.resolve().then(handleRun);
}

export function runAsyncIterator(iterator) {
  function handleRun(value) {
    const iteratorResult = iterator.next(value);
    if (iteratorResult.done) {
      // 执行完成，直接返回value
      return iteratorResult.value;
    } else {
      // 执行未完成，继续运行，
      if (iteratorResult.value instanceof Promise) {
        // 如果是promise类型，则监听结果，并且加入微任务队列
        return iteratorResult.value.then(handleRun, (e) => iterator.throw(e));
      } else {
        // 如果yield后面是同步代码，则直接调用handleRun
        return handleRun(iteratorResult.value);
      }
    }
  }
  // 异步函数，整体要返回一个Promise
  return Promise.resolve().then(handleRun);
}
