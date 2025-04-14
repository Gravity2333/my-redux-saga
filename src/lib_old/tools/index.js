// 使用函数对象的Symbol.toStringTag是否等于 GeneratorFunction来判断函数是不是生成器
export function isGeneratorFunction(func) {
  return (
    typeof func === "function" &&
    func[Symbol.toStringTag] === "GeneratorFunction"
  );
}

// 使用函数对象的Symbol.toStringTag是否等于 AsyncFunction来判断函数是不是async await 异步函数 (是否返回promise)
export function isAsyncFunction(func) {
  return (
    typeof func === "function" && func[Symbol.toStringTag] === "AsyncFunction"
  );
}

export * from './EventEmitter'
export * from './runGenerator'
