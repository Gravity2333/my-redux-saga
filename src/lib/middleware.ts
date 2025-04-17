import { stdChannel } from "./channel";
import { runSaga } from "./runSaga";

/** 创建saga中间件 */
export default function sagaMiddlewareFactory() {
  // 创建channel
  const channel = stdChannel();
  // 绑定runSage方法
  let boundRunSaga: any;
  function sagaMiddleware(middlewareApi: { getState: any; dispatch: any }) {
    boundRunSaga = runSaga.bind(null, {
      // env
      getState: middlewareApi.getState,
      dispatch: middlewareApi.dispatch,
      channel,
    });
    return (next) => {
      const foo = (action) => {
   
        // 每次调用dispatch 拦截
        // 先调用originDiapcth (next)
        const result = next(action);
        // put
        channel.put(action);
        return result;
      }
      return foo
    };
  }

  sagaMiddleware.run = (saga: any, ...args: any[]) => {
    return boundRunSaga(saga,...args)
  };

  return sagaMiddleware;
}
