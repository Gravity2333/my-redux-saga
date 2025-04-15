export function isIterator(it: any) {
  return typeof it.next === "function" && typeof it.throw === "function";
}
