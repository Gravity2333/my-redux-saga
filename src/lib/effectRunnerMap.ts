import { Channel } from "./channel";
import { CALL, PUT, TAKE } from "./effectTypes";
import { proc } from "./proc";

function runTakeEffect(
  env: {
    getState: any;
    dispatch: any;
    channel: Channel;
  },
  effect: any,
  cb: any
) {
  env.channel.take(
    cb.bind(null, effect.payload),
    (input) => input === effect.payload.type
  );
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
  const action = payload.action
  cb(payload?.channel ? payload.channel.put(action): env.dispatch(action));
}

function isIterator(it: any) {
  return typeof it.next === "function" && it.throw === "function";
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

export const effectRunnerMap = {
  [TAKE]: runTakeEffect,
  [PUT]: runPutEffect,
  [CALL]: runCallEffect,
};
