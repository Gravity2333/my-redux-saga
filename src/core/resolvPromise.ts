import { CANCEL } from "./effectTypes";

/** 处理Promise */
export function resolvePromise(promise: Promise<any>, cb: any) {
  const cancelPromise = promise[CANCEL];
  if (typeof cancelPromise === "function") {
    // 给cb设置cancel 方便取消promise
    cb.cancel = cancelPromise;
  }

  promise.then(cb, (err) => {
    cb(err, true);
  });
}
