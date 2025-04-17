import { Channel } from "./channel";
import { effectRunnerMap } from "./effectRunnerMap";
import { resolvePromise } from "./resolvPromise";
import { IO, TASK_CANCEL } from "./symbols";
import { CANCELLED, DONE, RUNNING } from "./taskStatus";
import { isIterator } from "./utils";

export type Task = {
  status: number;
  cancel: () => void;
};

/** 自动运行 */
export function proc(
  env: {
    getState: any;
    dispatch: any;
    channel: Channel;
  },
  interator: Iterator<any, any, any>,
  // continuation
  cont: any = () => {}
): Task {
  /** 初始化task */
  const task: Task = {
    status: RUNNING,
    cancel: () => {
      if (task.status === RUNNING) {
        task.status = CANCELLED;
        handleNext(TASK_CANCEL);
      }
    },
  };

  // 设置cancel
  (cont as any).cancel = task.cancel;

  handleNext(void 0);

  return task;

  function handleNext(arg: any, isErr: boolean = false) {
    /** 判断错误情况 */
    if (isErr) {
      debugger
      //  像iterator内部抛出异常
      interator.throw(arg);
    }
    const result = interator.next(arg);
    /** 判断是否为取消逻辑 */

    if (arg === TASK_CANCEL) {
      typeof interator.return === "function"
        ? interator.return(TASK_CANCEL)
        : { done: true, value: TASK_CANCEL };
    } else if (result.done) {
      /** 设置状态 */
      task.status = DONE;
      cont(result.value);
    } else {
      digestEffect(result.value, handleNext);
    }
  }

  function digestEffect(maybeEffect: any, cb: any) {
    if (isIterator(maybeEffect)) {
      /** 迭代器情况 */
      proc(env, maybeEffect, cb);
    } else if (maybeEffect instanceof Promise) {
      resolvePromise(maybeEffect, handleNext);
    } else if (maybeEffect[IO]) {
      // effect类型
      // 处理effects
      const effectRunner = effectRunnerMap[maybeEffect.type];
      effectRunner(env, maybeEffect, cb);
    } else {
      /** 其他普通类型 对应 yield 111 yield xxx 普通类型等 */
      cb(maybeEffect);
    }
  }
}
