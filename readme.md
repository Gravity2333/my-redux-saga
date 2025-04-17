### 一个简易的redux-saga
 当前版本为简易实现，如需查看更接近官方的实现 请移步implement分支 

 ## 使用方法
 npm i my-redux-saga


 
 ```javascript
 //  store/index.js
 import createMySagaMiddleWare from "my-redux-saga";
import defSaga from "./saga";

const mySagaMiddleware = createMySagaMiddleWare ()

export default createStore(
  reducer,
  applyMiddleware(mySagaMiddleware)
);

mySagaMiddleware.run(defSaga)


// store/saga.js
export default function* defSaga() {
  ... ... 
}

 ```
