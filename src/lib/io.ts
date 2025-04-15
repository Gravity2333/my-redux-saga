import { CALL, FORK, PUT, TAKE } from "./effectTypes";
import { IO } from "./symbols";

/** 创建effect 简易的封装  effect maker*/
export function makeEffect(type: string, payload?: any) {
  return {
    [IO]: true,
    type,
    payload,
  };
}

export function take(pattern: string) {
  return makeEffect(TAKE, pattern);
}

export function put(channel: any,action?: { type: string; payload?: any }) {
  //归一化
  if(action === void 0){
    return makeEffect(PUT, {
      action: channel
    });
  }else{
    return makeEffect(PUT, {
      action,channel
    });
  }

}

export function call(fn: any,...args: any[]) {
  return makeEffect(CALL,{
    fn,args
  });
}

export function fork(fn: any,...args: any[]){
  return makeEffect(FORK,{
    fn,args
  })
}
