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
