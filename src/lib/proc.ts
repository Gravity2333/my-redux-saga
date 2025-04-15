import { Channel } from "./channel";
import { effectRunnerMap } from "./effectRunnerMap";
import { IO } from "./symbols";
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

    if (result.value[IO]) {
      // effect类型
      // 处理effects
      const effectRunner = effectRunnerMap[result.value.type];
      return effectRunner(env, result.value, handleNext);
    }

    /** 其他普通类型 对应 yield 111 yield xxx 普通类型等 */
    handleNext(result.value);
  }

  cb(handleNext(void 0));
}
