export function isIterator(it: any) {
  return it && typeof it.next === "function" && typeof it.throw === "function";
}
