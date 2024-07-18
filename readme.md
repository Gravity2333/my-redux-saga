### 一个简易的redux-saga
 git: https://github.com/Gravity2333/my-redux-saga

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