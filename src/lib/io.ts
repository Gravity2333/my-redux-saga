import { PUT, TAKE } from "./effectTyptes";
import { IO } from "./symbols";

/** 创建effect 简易的封装  effect maker*/
export function makeEffect(type: string, payload: any) {
  return {
    [IO]: true,
    type,
    payload,
  };
}

export function take(action: { type: string; payload: any }) {
  return makeEffect(TAKE, action);
}

export function put(action: { type: string; payload: any }) {
  return makeEffect(PUT, action);
}
