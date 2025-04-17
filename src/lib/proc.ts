import { Channel } from "./channel";
import { effectRunnerMap } from "./effectRunnerMap";
import { forkQueue, ForkQueue } from "./forkQueue";
import { resolvePromise } from "./resolvPromise";
import { IO, TASK_CANCEL } from "./symbols";
import { CANCELLED, DONE, RUNNING } from "./taskStatus";
import { isIterator, noop } from "./utils";

export type Task = {
  status: number;
  cancel: () => void;
  cont: any;
  forkQueue: ForkQueue;
};

export type ExecutingContext = {
  task: Task;
  digestEffect: (env: any, maybeEffect: any, cb: any) => void;
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
  cont: any = noop
): Task {
  /** 初始化task */
  const task: Task = {
    status: RUNNING,
    cancel: () => {
      if (task.forkQueue.hasRunningChild() || task.status === RUNNING) {
        task.status = CANCELLED;
        handleNext(TASK_CANCEL);
        task.forkQueue.cancelAll();
      }
    },
    cont,
    forkQueue: null,
  };
  task.forkQueue = forkQueue(task, cont);

  /** 创建执行上下文，在effectRunner之间传递 */
  const executingContext = {
    task,
    digestEffect,
  };

  // 设置cancel
  (cont as any).cancel = task.cancel;

  handleNext(void 0);

  return task;

  function handleNext(arg: any, isErr: boolean = false) {
    /** 判断错误情况 */
    if (isErr) {
      //  像iterator内部抛出异常
      interator.throw(arg);
    }
    const result = interator.next(arg);
    /** 判断是否为取消逻辑 */

    if (arg === TASK_CANCEL) {
      task.status = CANCELLED;
      /** 传播cancel */
      (handleNext as any)?.cancel();
      /** 向迭代器内部发出return指令 */
      typeof interator.return === "function"
        ? interator.return(TASK_CANCEL)
        : { done: true, value: TASK_CANCEL };
    } else if (result.done) {
      /** 设置状态 */
      if (!task.status) {
        task.status = DONE;
      }
      /** 注意 这里请调用task.cont */
      task.cont(result.value);
    } else {
      digestEffect(env, result.value, handleNext);
    }
  }

  function digestEffect(env, maybeEffect: any, cb: any) {
    /** 给一个占位函数 */
    function currcb(res: any, isErr: boolean = false) {
      cb(res, isErr);
    }
    // 先给一个noop展位，其child根据其需求设置currcb.cancel
    currcb.cancel = noop;
    cb.cancel = () => {
      currcb.cancel();
    };

    if (isIterator(maybeEffect)) {
      /** 迭代器情况 */
      proc(env, maybeEffect, currcb);
    } else if (maybeEffect instanceof Promise) {
      resolvePromise(maybeEffect, currcb);
    } else if (maybeEffect[IO]) {
      // effect类型
      // 处理effects
      const effectRunner = effectRunnerMap[maybeEffect.type];
      effectRunner(env, maybeEffect, currcb, executingContext);
    } else {
      /** 其他普通类型 对应 yield 111 yield xxx 普通类型等 */
      currcb(maybeEffect);
    }
  }
}
