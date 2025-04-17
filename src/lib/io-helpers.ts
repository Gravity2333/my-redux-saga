import { CANCEL } from "./effectTypes";
import { cancel, fork, take } from "./io";
import { RUNNING } from "./taskStatus";

export function* takeEvery(pattern: string, fn: any, ...args: any[]) {
  while (true) {
    yield take(pattern);
    yield fork(fn, ...args);
  }
}

export function* takeLatest(pattern: string, fn: any, ...args: any[]) {
  let lastTask: { status: number; cancel: any } | null = null;
  while (true) {
    yield take(pattern);
    if (lastTask && lastTask.status === RUNNING) {
      yield cancel(lastTask);
    }
    lastTask = yield fork(fn, ...args);
  }
}

export function* takeLeading(pattern: string, fn: any, ...args: any[]) {
  let firstTask: { status: number; cancel: any } | null = null;
  while (true) {
    yield take(pattern);
    if (firstTask && firstTask.status === RUNNING) {
      continue;
    }
    firstTask = yield fork(fn, ...args);
  }
}

export function* throttle(
  timeout: number,
  pattern: string,
  fn: any,
  ...args: any[]
) {
  let timerObj: any = null;
  while (true) {
    yield take(pattern);
    if (!timerObj) {
      timerObj = setTimeout(() => {
        timerObj = null;
      }, timeout);
      yield fork(fn, ...args);
    }
  }
}

export function delay(timeout) {
  let timer;
  const promise = new Promise((resolve) => {
    timer = setTimeout(() => {
      resolve(Promise.resolve());
    }, timeout);
  });

  promise[CANCEL] = () => {
    clearTimeout(timer);
  };

  return promise;
}
