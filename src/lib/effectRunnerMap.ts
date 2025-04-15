import { Channel } from "./channel";
import { CALL, FORK, PUT, TAKE } from "./effectTypes";
import { proc } from "./proc";
import { asap, immediate } from "./scheduler";

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
  env.channel.take(cb.bind(null, pattern), (input) => input === pattern);
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

function isIterator(it: any) {
  return typeof it.next === "function" && typeof it.throw === "function";
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
    return result.then(cb);
  }
  if (isIterator(result)) {
    // 传入的是迭代器
    return proc(env, result, cb);
  }
  return cb(result);
}

function runForkEffect(
  env: {
    getState: any;
    dispatch: any;
    channel: Channel;
  },
  effect: any,
  cb: any
) {
  return immediate(() => {
    const { fn, args } = effect.payload;
    const result = fn(...args);
    if (isIterator(result)) {
      // 传入的是迭代器
      return cb(proc(env, result));
    }
    return cb(result);
  });
}

export const effectRunnerMap = {
  [TAKE]: runTakeEffect,
  [PUT]: runPutEffect,
  [CALL]: runCallEffect,
  [FORK]: runForkEffect,
};
