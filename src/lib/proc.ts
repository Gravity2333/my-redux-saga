import { Channel } from "./channel";
import { effectRunnerMap } from "./effectRunnerMap";
import { IO, TASK_CANCEL } from "./symbols";
import { CANCELLED, DONE, RUNNING } from "./taskStatus";
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
  /** 初始化task */
  const task = {
    status: RUNNING,
    cancel: () => {
      if (task.status === RUNNING) {
        task.status = CANCELLED;
        handleNext(TASK_CANCEL);
      }
    },
  };

  function handleNext(arg: any) {
    const result = interator.next(arg);
    /** 判断是否为取消逻辑 */
    if (arg === TASK_CANCEL) {
      return typeof interator.return === "function"
        ? interator.return(TASK_CANCEL)
        : { done: true, value: TASK_CANCEL };
    }
    if (result.done) {
      /** 设置状态 */
      task.status = DONE
      return result.value;
    }
    if (isIterator(result.value)) {
      /** 迭代器情况 */
      return proc(env, result.value, handleNext);
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
    return handleNext(result.value);
  }
  cb(handleNext(void 0));

  return task
}
