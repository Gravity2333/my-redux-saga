import { CANCEL } from "./effectTypes";

/** 处理Promise */
export function resolvePromise(promise: Promise<any>, cb: any) {
  promise.then(cb, (err) => {
    const cancelPromise = promise[CANCEL];
    if (typeof cancelPromise === "function") {
      // 给cb设置cancel 方便取消promise
      cb.cancel = cancelPromise;
    }
    cb(err, true);
  });
}
