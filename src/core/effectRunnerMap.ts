import { Channel } from "./channel";
import {
  ALL,
  CALL,
  CANCEL,
  FORK,
  PUT,
  RACE,
  SELECT,
  TAKE,
} from "./effectTypes";
import { Effect } from "./io";
import { ExecutingContext, proc, Task } from "./proc";
import { resolvePromise } from "./resolvPromise";
import { asap, immediate } from "./scheduler";
import { CANCELLED, DONE, RUNNING } from "./taskStatus";
import { isIterator, noop } from "./utils";

function runTakeEffect(
  env: {
    getState: any;
    dispatch: any;
    channel: Channel;
  },
  effect: any,
  cb: any
) {
  const pattern = effect.payload;
  env.channel.take(cb, (input) => input === pattern);
}

function runPutEffect(
  env: {
    getState: any;
    dispatch: any;
    channel: Channel;
  },
  { payload }: any,
  cb
) {
  asap(() => {
    const action = payload.action;
    cb(payload?.channel ? payload.channel.put(action) : env.dispatch(action));
  });
}

function runCallEffect(
  env: {
    getState: any;
    dispatch: any;
    channel: Channel;
  },
  effect: any,
  cb: any
) {
  const { fn, args } = effect.payload;
  const result = fn(...args);
  if (result instanceof Promise) {
    resolvePromise(result, cb);
  } else if (isIterator(result)) {
    // 传入的是迭代器
    proc(env, result, cb);
  } else {
    cb(result);
  }
}

function runForkEffect(
  env: {
    getState: any;
    dispatch: any;
    channel: Channel;
  },
  effect: any,
  cb: any,
  { task: parent }: ExecutingContext
) {
  return immediate(() => {
    const { fn, args, detached = false } = effect.payload;
    let result = fn(...args);
    let forkStatus = RUNNING
    cb.cancel = noop;
    let childTask = result;
    if (result instanceof Promise) {
      childTask = {
        cancel: cb.cancel,
        status: forkStatus,
      };
      result
        .then(() => {
          childTask.status = DONE;
        })
        .catch(() => {
          childTask.status = DONE;
        });

      const cancelPromise = result[CANCEL];
      if (typeof cancelPromise === "function") {
        // 给cb设置cancel 方便取消promise
        childTask.cancel = cb.cancel = () => {
          if (childTask.status != DONE&&childTask.status != CANCELLED) {
            childTask.status = CANCELLED;
            cancelPromise();
          }
        };
      }
    } else if (!isIterator(result)) {
      childTask = {
        cancel: cb.cancel,
        status: DONE,
      };
    } else {
      const currcb = ()=>{
        childTask.status = DONE
      }
      childTask = proc(env, result,currcb);
      childTask.status = forkStatus
      cb.cancel = childTask.cancel;
    }

    if (detached) {
      /** 调用cb */
      cb(childTask);
    } else {
      /** childTask加入到 parent forkQueue 中*/
      parent.forkQueue.addTask(childTask);
      /** 调用cb */
      cb(childTask);
    }
  });
}

function runCancelEffect(
  env: {
    getState: any;
    dispatch: any;
    channel: Channel;
  },
  effect: any,
  cb: any
) {
  const task = effect.payload.task as Task;
  if (task) {
    task.cancel();
  }
  cb();
}

function runSelectEffect(
  env: {
    getState: any;
    dispatch: any;
    channel: Channel;
  },
  effect: any,
  cb: any
) {
  const selector = effect.payload.selector;
  if (selector) {
    cb(selector(env.getState()));
  }
  cb();
}

function runAllEffect(
  env: {
    getState: any;
    dispatch: any;
    channel: Channel;
  },
  effect: any,
  cb: any,
  { digestEffect }
) {
  const effects = effect.payload.effects as Effect[];
  let doneEffectCnt = 0;
  let doneEffectResult: any[] = [];
  function handleEffectDone(index, result) {
    doneEffectResult[index] = result;
    doneEffectCnt++;
    if (doneEffectCnt === effects.length) {
      cb(doneEffectResult);
    }
  }
  effects.forEach((_effect, index) => {
    digestEffect(env, _effect, handleEffectDone.bind(null, index));
  });
}

function runRaceEffect(
  env: {
    getState: any;
    dispatch: any;
    channel: Channel;
  },
  effect: any,
  cb: any,
  { digestEffect }
) {
  const effects = effect.payload.effects as Effect[];
  let isDone = false;
  const callbacks = {};
  effects.forEach((_effect, index) => {
    function handleEffectDone(result: any) {
      if (isDone) return;
      isDone = true;
      Object.keys(callbacks).forEach((i) => {
        if (+i !== index) {
          callbacks[i]?.cancel();
        }
      });
      cb(result);
    }
    handleEffectDone.cancel = noop;
    callbacks[index] = handleEffectDone;
  });
  effects.forEach((_effect, index) => {
    if (isDone) {
      return;
    }
    digestEffect(env, _effect, callbacks[index]);
  });
}
export const effectRunnerMap = {
  [TAKE]: runTakeEffect,
  [PUT]: runPutEffect,
  [CALL]: runCallEffect,
  [FORK]: runForkEffect,
  [CANCEL]: runCancelEffect,
  [SELECT]: runSelectEffect,
  [ALL]: runAllEffect,
  [RACE]: runRaceEffect,
};
