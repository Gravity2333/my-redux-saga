import { CANCEL } from "./effectTypes";
import { cancel, fork, spawn, take } from "./io";
import { Task } from "./proc";
import { RUNNING } from "./taskStatus";

export function* takeEvery(pattern: string, fn: any, ...args: any[]) {
  yield spawn(function* () {
    while (true) {
      yield take(pattern);
      yield fork(fn, ...args);
    }
  });
}

export function* takeLatest(pattern: string, fn: any, ...args: any[]) {
  let lastTask: Task | null = null;
  yield spawn(function* () {
    while (true) {
      yield take(pattern);
      if (lastTask && lastTask.status === RUNNING) {
        yield cancel(lastTask);
      }
      lastTask = yield fork(fn, ...args);
    }
  });
}

export function* takeLeading(pattern: string, fn: any, ...args: any[]) {
  let firstTask: { status: number; cancel: any } | null = null;
  yield spawn(function* () {
    while (true) {
      yield take(pattern);
      if (firstTask && firstTask.status === RUNNING) {
        continue;
      }
      firstTask = yield fork(fn, ...args);
    }
  });
}

export function* throttle(
  timeout: number,
  pattern: string,
  fn: any,
  ...args: any[]
) {
  let timerObj: any = null;
  yield spawn(function* () {
    while (true) {
      yield take(pattern);
      if (!timerObj) {
        timerObj = setTimeout(() => {
          timerObj = null;
        }, timeout);
        yield fork(fn, ...args);
      }
    }
  });
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
