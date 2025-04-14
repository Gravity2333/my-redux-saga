import { MATCH } from "./symbols";

export type Channel = {
    take: (taker: any, matcher: any) => void;
    put: (action: {
        type: string;
        payload: any;
    }) => void;
}

export function stdChannel() {
  const takers: any[] = [];

  function take(taker, matcher) {
    taker[MATCH] = matcher;
    takers.push(taker);
  }

  function put(action: { type: string; payload: any }) {
    takers.forEach((taker) => {
      if (taker[MATCH]?.(action.type)) {
        taker(action.payload);
      }
    });
  }

  return {
    take,
    put,
  };
}
