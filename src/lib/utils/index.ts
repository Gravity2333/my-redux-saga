export function isIterator(it: any) {
  return it && typeof it.next === "function" && typeof it.throw === "function";
}

/** No Operate 什么都不做 占位函数 */
export function noop(){}