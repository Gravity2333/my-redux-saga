import { Task } from "./proc";
import { noop } from "./utils";

export type ForkQueue = {
  addTask: (task: Task) => void;
  cancelAll: () => void;
  hasRunningChild:  () => boolean;
};

export function forkQueue(mainTask: Task, cont: any): ForkQueue {
  /** 所有的子task */
  let childTasks: Task[] = [];
  /** 是否已经完成  取消的时候用*/
  let completed = false;
  /** 加入queue */
  function addTask(task: Task) {
    childTasks.push(task);
    task.cont = (res) => {
      if (completed) return; // 已经取消了
      // 去除forkQueue中当前的任务
      childTasks = childTasks.filter((childTask) => childTask !== task);
      // 确保cont不会被再次调用
      task.cont = noop;
      // 判断是否所有任务都完成了 如果是则调用parent的cont
      if (childTasks.length === 0) {
        completed = true
        // 所有任务完成 执行外层cont
        cont(res);
      }
    };
  }

  /** 取消所有子task */
  function cancelAll() {
    if (!completed) {
      completed = true;
      childTasks.forEach((childTask) => childTask.cancel());
      childTasks = [];
    }
  }

  /** main 入 queue */
  addTask(mainTask);
  return {
    addTask,
    cancelAll,
    hasRunningChild: ()=>childTasks.length >0,
    childTasks
  }as any;
}
