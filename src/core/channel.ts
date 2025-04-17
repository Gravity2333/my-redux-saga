import { asap } from "./scheduler";
import { MATCH } from "./symbols";

export type Channel = {
  take: (taker: any, matcher: any) => void;
  put: (action: { type: string; payload: any }) => void;
};

export function stdChannel() {
  const takers: any[] = [];

  function take(taker, matcher) {
    taker[MATCH] = matcher;
    taker.cancel = () => {
      const takerIndex = takers.findIndex((t) => t === taker);
      if (takerIndex >= 0) {
        takers.splice(takerIndex, 1);
      }
    };
    takers.push(taker);
  }

  function put(action: { type: string; payload: any }) {
    takers.forEach((taker) => {
      if (taker[MATCH]?.(action.type)) {
        taker(action.payload);
        taker.cancel();
      }
    });
  }

  return {
    take,
    /** put用asap包裹 */
    put: (action: { type: string; payload: any }) => {
      asap(() => {
        put(action);
      });
    },
  };
}
