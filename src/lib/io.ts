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
import { Task } from "./proc";
import { IO } from "./symbols";

export type Effect = {
  type: string;
  payload: any;
} & Record<string, any>;

/** 创建effect 简易的封装  effect maker*/
export function makeEffect(type: string, payload?: any): Effect {
  return {
    [IO]: true,
    type,
    payload,
  };
}

export function take(pattern: string) {
  return makeEffect(TAKE, pattern);
}

export function put(channel: any, action?: { type: string; payload?: any }) {
  //归一化
  if (action === void 0) {
    return makeEffect(PUT, {
      action: channel,
    });
  } else {
    return makeEffect(PUT, {
      action,
      channel,
    });
  }
}

export function call(fn: any, ...args: any[]) {
  return makeEffect(CALL, {
    fn,
    args,
  });
}

export function fork(fn: any, ...args: any[]) {
  return makeEffect(FORK, {
    fn,
    args,
  });
}

/** 独立的fork 当前子任务不会被父任务取消 
 * const task = fork(function*()...)
 * yield detach(task)
 */
export function detach(forkEff: Effect, ...args: any[]) {
  return makeEffect(FORK, {
    ...forkEff.payload,
    detached: true
  });
}

/** 相当于 detach(fork()) 语法糖 */
export function spawn(fn: any, ...args: any[]) {
  return detach(fork(fn,...args))
}

export function cancel(task: Task) {
  return makeEffect(CANCEL, { task });
}

export function select(selector: (state: any) => any) {
  return makeEffect(SELECT, { selector });
}

export function all(effects: Effect[]) {
  return makeEffect(ALL, { effects });
}

export function race(effects: Effect[]) {
  return makeEffect(RACE, { effects });
}
