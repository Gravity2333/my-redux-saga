/******/ var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   EventEmitter: () => (/* reexport safe */ _EventEmitter__WEBPACK_IMPORTED_MODULE_0__.EventEmitter),
/* harmony export */   _listenerType: () => (/* reexport safe */ _EventEmitter__WEBPACK_IMPORTED_MODULE_0__._listenerType),
/* harmony export */   isAsyncFunction: () => (/* binding */ isAsyncFunction),
/* harmony export */   isGeneratorFunction: () => (/* binding */ isGeneratorFunction),
/* harmony export */   runAsyncGrnerator: () => (/* reexport safe */ _runGenerator__WEBPACK_IMPORTED_MODULE_1__.runAsyncGrnerator),
/* harmony export */   runAsyncIterator: () => (/* reexport safe */ _runGenerator__WEBPACK_IMPORTED_MODULE_1__.runAsyncIterator),
/* harmony export */   runSyncGenerator: () => (/* reexport safe */ _runGenerator__WEBPACK_IMPORTED_MODULE_1__.runSyncGenerator)
/* harmony export */ });
/* harmony import */ var _EventEmitter__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2);
/* harmony import */ var _runGenerator__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3);
// 使用函数对象的Symbol.toStringTag是否等于 GeneratorFunction来判断函数是不是生成器
function isGeneratorFunction(func) {
  return (
    typeof func === "function" &&
    func[Symbol.toStringTag] === "GeneratorFunction"
  );
}

// 使用函数对象的Symbol.toStringTag是否等于 AsyncFunction来判断函数是不是async await 异步函数 (是否返回promise)
function isAsyncFunction(func) {
  return (
    typeof func === "function" && func[Symbol.toStringTag] === "AsyncFunction"
  );
}





/***/ }),
/* 2 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   EventEmitter: () => (/* binding */ EventEmitter),
/* harmony export */   _listenerType: () => (/* binding */ _listenerType)
/* harmony export */ });
/* harmony import */ var _runGenerator__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);


const _listenerType = {
  TAKE_EVERY: "TAKE_EVERY",
  TAKE_LATEST: "TAKE_LATEST",
  THROTTLE: "THROTTLE",
  TAKE_LEADING: "TAKE_LEADING",
  TAKE: "TAKE",
};

class EventEmitter {
  constructor() {
    this.event = {};
    this.eventKeys = new Set();
  }

  cancel(eventName) {
    delete this.event[eventName];
    this.eventKeys.delete(eventName);
  }

  has(eventName) {
    return this.eventKeys.has(eventName);
  }

  onEvery(eventName, listener) {
    if (!this.event[eventName]) {
      this.event[eventName] = [];
    }
    this.event[eventName].push({
      type: _listenerType.TAKE_EVERY,
      listener,
    });
    this.eventKeys.add(eventName);
  }

  emitEvery(eventName, ...args) {
    const listeners = this.event[eventName] || [];
    listeners
      .filter(({ type }) => type === _listenerType.TAKE_EVERY)
      .forEach(({ listener }) => {
        (0,_runGenerator__WEBPACK_IMPORTED_MODULE_0__.runAsyncGrnerator)(listener, ...args);
      });
  }

  onLatest(eventName, listener) {
    if (!this.event[eventName]) {
      this.event[eventName] = [];
    }
    this.event[eventName].push({
      type: _listenerType.TAKE_LATEST,
      listener,
    });
    this.eventKeys.add(eventName);
  }

  _cancelRunningIteratorIfExist(listenerObj) {
    if (listenerObj.runningIterator) {
      listenerObj.runningIterator.return();
      listenerObj.runningIterator = null;
    }
  }

  emitLatest(eventName, ...args) {
    const listeners = this.event[eventName] || [];
    const canelIterator = this._cancelRunningIteratorIfExist
    ;(0,_runGenerator__WEBPACK_IMPORTED_MODULE_0__.runAsyncGrnerator)(function* () {
      const leadingListeners = listeners.filter(
        ({ type }) => type === _listenerType.TAKE_LATEST
      );

      for (const listenerObj of leadingListeners) {
        canelIterator(listenerObj);
        const iterator = listenerObj.listener(...args);
        listenerObj.runningIterator = iterator;
        yield (0,_runGenerator__WEBPACK_IMPORTED_MODULE_0__.runAsyncIterator)(iterator);
        listenerObj.runningIterator = null;
      }
    });
  }

  onThrottle(time, eventName, listener) {
    if (!this.event[eventName]) {
      this.event[eventName] = [];
    }
    this.event[eventName].push({
      type: _listenerType.THROTTLE,
      listener,
      time,
    });
    this.eventKeys.add(eventName);
  }

  emitThrottle(eventName, ...args) {
    const listeners = this.event[eventName] || [];
    (0,_runGenerator__WEBPACK_IMPORTED_MODULE_0__.runAsyncGrnerator)(function* () {
      const leadingListeners = listeners.filter(
        ({ type }) => type === _listenerType.THROTTLE
      );

      for (const listenerObj of leadingListeners) {
        if (listenerObj.timeoutObj) continue;
        listenerObj.timeoutObj = setTimeout(() => {
          listenerObj.timeoutObj = "";
        }, listenerObj.time);
        yield (0,_runGenerator__WEBPACK_IMPORTED_MODULE_0__.runAsyncGrnerator)(listenerObj.listener, ...args);
      }
    });
  }

  onTake(eventName, listener) {
    if (!this.event[eventName]) {
      this.event[eventName] = [];
    }
    this.event[eventName].push({
      type: _listenerType.TAKE,
      listener,
    });
    this.eventKeys.add(eventName);
  }

  emitTake(action) {
    const listeners = this.event[action.type] || [];
    listeners
      .filter(({ type }) => type === _listenerType.TAKE)
      .forEach(({ listener }) => {
        listener(action);
      });
  }

  onLeading(eventName, listener) {
    if (!this.event[eventName]) {
      this.event[eventName] = [];
    }
    this.event[eventName].push({
      type: _listenerType.TAKE_LEADING,
      listener,
    });
    this.eventKeys.add(eventName);
  }

  emitLeading(eventName, ...args) {
    const listeners = this.event[eventName] || [];
    (0,_runGenerator__WEBPACK_IMPORTED_MODULE_0__.runAsyncGrnerator)(function* () {
      const leadingListeners = listeners.filter(
        ({ type }) => type === _listenerType.TAKE_LEADING
      );
      for (const listenerObj of leadingListeners) {
        if (listenerObj.leading) continue;
        listenerObj.leading = true;
        yield (0,_runGenerator__WEBPACK_IMPORTED_MODULE_0__.runAsyncGrnerator)(listenerObj.listener, ...args);
        listenerObj.leading = false;
      }
    });
  }
}


/***/ }),
/* 3 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   runAsyncGrnerator: () => (/* binding */ runAsyncGrnerator),
/* harmony export */   runAsyncIterator: () => (/* binding */ runAsyncIterator),
/* harmony export */   runSyncGenerator: () => (/* binding */ runSyncGenerator)
/* harmony export */ });
/**
 * 展示如何自动运行 同步/异步生成器代码
 */

/** 运行同步的生成器函数 */
function runSyncGenerator(generatorFunc, ...args) {
  const iterator = generatorFunc.apply(this, args);
  let iteratorResult = iterator.next();
  while (!iteratorResult.done) {
    iteratorResult = iterator.next(iteratorResult.value);
  }
  return iteratorResult.value;
}

/** 运行异步生成器函数 */
function runAsyncGrnerator(generatorFunc, ...args) {
  const iterator = generatorFunc.apply(this, args);
  function handleRun(value) {
    const iteratorResult = iterator.next(value);
    if (iteratorResult.done) {
      // 执行完成，直接返回value
      return iteratorResult.value;
    } else {
      // 执行未完成，继续运行，
      if (iteratorResult.value instanceof Promise) {
        // 如果是promise类型，则监听结果，并且加入微任务队列
        return iteratorResult.value.then(handleRun, (e) => iterator.throw(e));
      } else {
        // 如果yield后面是同步代码，则直接调用handleRun
        return handleRun(iteratorResult.value);
      }
    }
  }
  // 异步函数，整体要返回一个Promise
  return Promise.resolve().then(handleRun);
}

function runAsyncIterator(iterator) {
  function handleRun(value) {
    const iteratorResult = iterator.next(value);
    if (iteratorResult.done) {
      // 执行完成，直接返回value
      return iteratorResult.value;
    } else {
      // 执行未完成，继续运行，
      if (iteratorResult.value instanceof Promise) {
        // 如果是promise类型，则监听结果，并且加入微任务队列
        return iteratorResult.value.then(handleRun, (e) => iterator.throw(e));
      } else {
        // 如果yield后面是同步代码，则直接调用handleRun
        return handleRun(iteratorResult.value);
      }
    }
  }
  // 异步函数，整体要返回一个Promise
  return Promise.resolve().then(handleRun);
}


/***/ })
/******/ ]);
/************************************************************************/
/******/ // The module cache
/******/ var __webpack_module_cache__ = {};
/******/ 
/******/ // The require function
/******/ function __webpack_require__(moduleId) {
/******/ 	// Check if module is in cache
/******/ 	var cachedModule = __webpack_module_cache__[moduleId];
/******/ 	if (cachedModule !== undefined) {
/******/ 		return cachedModule.exports;
/******/ 	}
/******/ 	// Create a new module (and put it into the cache)
/******/ 	var module = __webpack_module_cache__[moduleId] = {
/******/ 		// no module.id needed
/******/ 		// no module.loaded needed
/******/ 		exports: {}
/******/ 	};
/******/ 
/******/ 	// Execute the module function
/******/ 	__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 
/******/ 	// Return the exports of the module
/******/ 	return module.exports;
/******/ }
/******/ 
/************************************************************************/
/******/ /* webpack/runtime/define property getters */
/******/ (() => {
/******/ 	// define getter functions for harmony exports
/******/ 	__webpack_require__.d = (exports, definition) => {
/******/ 		for(var key in definition) {
/******/ 			if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 				Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 			}
/******/ 		}
/******/ 	};
/******/ })();
/******/ 
/******/ /* webpack/runtime/hasOwnProperty shorthand */
/******/ (() => {
/******/ 	__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ })();
/******/ 
/******/ /* webpack/runtime/make namespace object */
/******/ (() => {
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = (exports) => {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/ })();
/******/ 
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   all: () => (/* binding */ all),
/* harmony export */   call: () => (/* binding */ call),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   put: () => (/* binding */ put),
/* harmony export */   select: () => (/* binding */ select),
/* harmony export */   take: () => (/* binding */ take),
/* harmony export */   takeEvery: () => (/* binding */ takeEvery),
/* harmony export */   takeLatest: () => (/* binding */ takeLatest),
/* harmony export */   takeLeading: () => (/* binding */ takeLeading),
/* harmony export */   throttle: () => (/* binding */ throttle)
/* harmony export */ });
/* harmony import */ var _tools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);


class MySagaMiddleWare {
  constructor() {
    this.store = null;
    this.eventEmitter = new _tools__WEBPACK_IMPORTED_MODULE_0__.EventEmitter();
  }
  static instance = null;

  static checkStaticInstance() {
    if (!MySagaMiddleWare.instance) {
      MySagaMiddleWare.instance = new MySagaMiddleWare();
    }
  }

  static createMySagaMiddleWare() {
    MySagaMiddleWare.checkStaticInstance();
    const patchFunc = (store) => {
      const currentInstance = MySagaMiddleWare.instance;
      const eventEmitter = currentInstance.eventEmitter;
      currentInstance.store = store;
      return (next) => (action) => {
        if (eventEmitter.has(action.type)) {
          // 在发送action之前执行的代码
          console.log("Before dispatch:", action);
          eventEmitter.emitEvery(action.type);
          eventEmitter.emitLatest(action.type);
          eventEmitter.emitLeading(action.type);
          eventEmitter.emitThrottle(action.type);
          eventEmitter.emitTake(action);
        } else {
          // 调用next方法，传入action，继续执行下一个中间件或dispatch方法
          const state = next(action);
          return state;
        }
      };
    };

    patchFunc.run = function (sagaFunc) {
      (0,_tools__WEBPACK_IMPORTED_MODULE_0__.runSyncGenerator)(sagaFunc);
    };

    return patchFunc;
  }

  static takeEvery(type, listener) {
    MySagaMiddleWare.checkStaticInstance();
    MySagaMiddleWare.instance.eventEmitter.onEvery(type, listener);
  }

  static takeLatest(type, listener) {
    MySagaMiddleWare.checkStaticInstance();
    MySagaMiddleWare.instance.eventEmitter.onLatest(type, listener);
  }

  static takeLeading(type, listener) {
    MySagaMiddleWare.checkStaticInstance();
    MySagaMiddleWare.instance.eventEmitter.onLeading(type, listener);
  }

  static throttle(time, type, listener) {
    MySagaMiddleWare.checkStaticInstance();
    MySagaMiddleWare.instance.eventEmitter.onThrottle(time, type, listener);
  }

  static take = async function (type) {
    MySagaMiddleWare.checkStaticInstance();
    return await new Promise((resolve) => {
      MySagaMiddleWare.instance.eventEmitter.onTake(type, (action) => {
        resolve(action);
      });
    });
  };

  static put(action) {
    MySagaMiddleWare.checkStaticInstance();
    MySagaMiddleWare.instance.store?.dispatch(action);
  }

  static select(callbackFunc) {
    MySagaMiddleWare.checkStaticInstance();
    return callbackFunc(MySagaMiddleWare.instance.store?.getState());
  }
}

const createMySagaMiddleWare = MySagaMiddleWare.createMySagaMiddleWare;
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (createMySagaMiddleWare);
const takeEvery = MySagaMiddleWare.takeEvery;
const takeLatest = MySagaMiddleWare.takeLatest;
const takeLeading = MySagaMiddleWare.takeLeading;
const throttle = MySagaMiddleWare.throttle;
const put = MySagaMiddleWare.put;
const take = MySagaMiddleWare.take;
const select = MySagaMiddleWare.select;
/** 注意 redux-saga中的call函数，也支持promise的调用 */
function call(func, ...args) {
  if ((0,_tools__WEBPACK_IMPORTED_MODULE_0__.isAsyncFunction)(func)) {
    // async函数，包一个runAsyncFunc返回
    return (0,_tools__WEBPACK_IMPORTED_MODULE_0__.runAsyncGrnerator)(function* () {
      return yield func(...args);
    });
  } else if ((0,_tools__WEBPACK_IMPORTED_MODULE_0__.isGeneratorFunction)(func)) {
    return (0,_tools__WEBPACK_IMPORTED_MODULE_0__.runAsyncGrnerator)(func, ...args);
  } else {
    return func(...args);
  }
}
function all(generators = []) {
  generators.forEach((generator) => {
    (0,_tools__WEBPACK_IMPORTED_MODULE_0__.runAsyncIterator)(generator);
  });
}

})();

var __webpack_exports__all = __webpack_exports__.all;
var __webpack_exports__call = __webpack_exports__.call;
var __webpack_exports__default = __webpack_exports__["default"];
var __webpack_exports__put = __webpack_exports__.put;
var __webpack_exports__select = __webpack_exports__.select;
var __webpack_exports__take = __webpack_exports__.take;
var __webpack_exports__takeEvery = __webpack_exports__.takeEvery;
var __webpack_exports__takeLatest = __webpack_exports__.takeLatest;
var __webpack_exports__takeLeading = __webpack_exports__.takeLeading;
var __webpack_exports__throttle = __webpack_exports__.throttle;
export { __webpack_exports__all as all, __webpack_exports__call as call, __webpack_exports__default as default, __webpack_exports__put as put, __webpack_exports__select as select, __webpack_exports__take as take, __webpack_exports__takeEvery as takeEvery, __webpack_exports__takeLatest as takeLatest, __webpack_exports__takeLeading as takeLeading, __webpack_exports__throttle as throttle };
