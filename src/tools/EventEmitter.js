import { runAsyncGrnerator, runAsyncIterator } from "./runGenerator";

export const _listenerType = {
  TAKE_EVERY: "TAKE_EVERY",
  TAKE_LATEST: "TAKE_LATEST",
  THROTTLE: "THROTTLE",
  TAKE_LEADING: "TAKE_LEADING",
  TAKE: "TAKE",
};

export class EventEmitter {
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
        runAsyncGrnerator(listener, ...args);
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
    runAsyncGrnerator(function* () {
      const leadingListeners = listeners.filter(
        ({ type }) => type === _listenerType.TAKE_LATEST
      );

      for (const listenerObj of leadingListeners) {
        canelIterator(listenerObj);
        const iterator = listenerObj.listener(...args);
        listenerObj.runningIterator = iterator;
        yield runAsyncIterator(iterator);
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
    runAsyncGrnerator(function* () {
      const leadingListeners = listeners.filter(
        ({ type }) => type === _listenerType.THROTTLE
      );

      for (const listenerObj of leadingListeners) {
        if (listenerObj.timeoutObj) continue;
        listenerObj.timeoutObj = setTimeout(() => {
          listenerObj.timeoutObj = "";
        }, listenerObj.time);
        yield runAsyncGrnerator(listenerObj.listener, ...args);
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
    runAsyncGrnerator(function* () {
      const leadingListeners = listeners.filter(
        ({ type }) => type === _listenerType.TAKE_LEADING
      );
      for (const listenerObj of leadingListeners) {
        if (listenerObj.leading) continue;
        listenerObj.leading = true;
        yield runAsyncGrnerator(listenerObj.listener, ...args);
        listenerObj.leading = false;
      }
    });
  }
}
