import { Channel } from "./channel";
import { effectRunnerMap } from "./effectRunnerMap";
import { isIterator } from "./utils";

/** 自动运行 */
export function proc(
  env: {
    getState: any;
    dispatch: any;
    channel: Channel;
  },
  interator: Iterator<any, any, any>,
  cb: any = () => {}
) {
  function handleNext(arg: any) {
    const result = interator.next(arg);

    if (result.done) return result.value;
    if (isIterator(result.value)) {
      /** 迭代器情况 */
      return proc(env, result.value, cb);
    }
    if (result.value instanceof Promise) {
      return Promise.resolve(result.value).then(handleNext, (err) => {
        interator.throw!(err);
      });
    }
    // 处理effects
    const effectRunner = effectRunnerMap[result.value.type];
    effectRunner(env, result.value, handleNext);
  }

  cb(handleNext(void 0));
}
