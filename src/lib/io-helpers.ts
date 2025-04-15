import { fork, take } from "./io";
import { RUNNING } from "./taskStatus";

export function* takeEvery(pattern: string, fn: any, ...args: any[]) {
  while (true) {
    yield take(pattern);
    yield fork(fn,...args)
  }
}

export function* takeLatest(pattern: string, fn: any, ...args: any[]) {
  let lastTask: { status: number; cancel: any } = null;
  while (true) {
    yield take(pattern);
    if (lastTask&&lastTask.status === RUNNING) {
      lastTask.cancel();
    }
    lastTask = yield fork(fn,...args)
  }
}
