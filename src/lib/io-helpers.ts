import { fork, take } from "./io";
import { RUNNING } from "./taskStatus";

export function* takeEvery(pattern: string, fn: any, ...args: any[]) {
  while (true) {
    yield take(pattern);
    yield fork(fn, ...args);
  }
}

export function* takeLatest(pattern: string, fn: any, ...args: any[]) {
  let lastTask: { status: number; cancel: any }|null = null;
  while (true) {
    yield take(pattern);
    if (lastTask && lastTask.status === RUNNING) {
      lastTask.cancel();
    }
    lastTask = yield fork(fn, ...args);
  }
}

export function* takeLeading(pattern: string, fn: any, ...args: any[]) {
  let firstTask: { status: number; cancel: any }|null = null;
  while (true) {
    yield take(pattern);
    if (firstTask && firstTask.status === RUNNING) {
      continue;
    }
    firstTask = yield fork(fn, ...args);
  }
}
