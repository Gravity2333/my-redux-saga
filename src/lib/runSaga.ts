import { Channel } from "./channel";
import { proc } from "./proc";

export function runSaga(
  env: {
    getState: any;
    dispatch: any;
    channel: Channel;
  },
  saga: (...args: any[]) => Generator<any, any, any>,
  ...args: any[]
) {
  // 调用proc函数 自动处理saga
  const sagaIterator = saga(...args);
  return proc(env,sagaIterator);
}
