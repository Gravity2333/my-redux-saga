import { take } from "./io";

export function* takeEvery(pattern: string, fn: any, ...args: any[]) {
  while (true) {
    yield take(pattern);
    yield fn.apply(null, args);
  }
}
