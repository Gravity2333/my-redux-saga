/** semaphore 信号量调度器
 *  js语言特性导致 saga fork函数不是真的多线程运行
 *  scheduler要保证 在所有的fork函数都执行完，才会调用put 也就是把put的调用 “推迟" 到fork函数都执行完
 *
 * function* genA(){
 *    put({ type: "A" })
 *    take("B")
 * }
 *
 * function* genB(){
 *    take('A')
 *    put({type: 'B'})
 * }
 *
 * function* defSaga(){
 *   yield fork(genA)
 *   yield fork(genB)
 * }
 *
 * 在没有scheduler的情况下，调用顺序为
 * genA 调用
 * putA 调用 派发 action: {type: "A"} 此时genB中的take("A") 还没有注册，此时这个action会丢失
 * takeB 调用 暂停 等待时间 B
 * genB 调用
 * take('A') 此时A已经丢失，卡在这里， B也不会接收到
 *
 * 使用scheduler之后，put会被包裹在 asap函数内 也就是 (as soon as possible) 尽快执行，会在immediate之后执行put 即推迟put到immediate之后执行
 * 顺序为
 * defSaga函数由Immediate函数包裹 此时semaphore = 1
 * fork GenA 由immediate包裹 semaphore = 2
 * putA 包裹到asap 此时semaphore !== 0  不执行PutA
 * takeB 暂停，genA退出Immediate函数执行完成 semaphore-- = 1
 * fork GenB 由Immediate包裹 semaphore = 2
 * take('A') 暂停 GenB退出 此时semaphore = 1
 * defSaga退出 此时 semaphore = 0
 * Immediate退出的时候会flush flush查看semaphore 如果为0 则flush队列的任务并且执行 此时队列中包含一个 PUT A 执行，此时takeA正好能收到
 * takeA接收到 Action { type: "A" } 继续执行 PUT({type: "B"}) 此时take B 正好也能接收到
 */

type scheduledCallback = () => void;

/** 队列 */
const queue: scheduledCallback[] = [];

/** 信号量 */
let semaphore = 0;

/** suspend */
function suspend() {
  semaphore++;
}

/** 释放 */
function release() {
  semaphore--;
}

/** 立刻执行方法 */
export function immediate(fn: scheduledCallback) {
    try{
        // 刮起队列
        suspend()
        return fn()
    }finally{
        // 一定执行 release
        flush() // flush队列 immediate任务执行完成了
    }
}


function flush(){
    release()
    while(semaphore <=0 && queue.length > 0){
        const cb = queue.shift()
        if(cb === void 0) break
        try{
            suspend()
            cb()
        }finally{
            release()
        }
    }
}


export  function asap(cb: scheduledCallback){
    queue.push(cb)

    // 检查 如果此时没有信号量 也可以直flush immediate是不用看信号量 直接运行的 ｜ asap是要检查信号量 才能运行的
    if(semaphore === 0){
        suspend()
        flush()
    }
}


