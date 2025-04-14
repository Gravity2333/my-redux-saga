import { Channel } from "./channel";
import { PUT, TAKE } from "./effectTyptes";

function runTakeEffect(
  env: {
    getState: any;
    dispatch: any;
    channel: Channel;
  },
  effect: any,
  cb: any
) {
  env.channel.take(
    cb.bind(null, effect.payload),
    (input) => input === effect.payload.type
  );
}

function runPutEffect(
  env: {
    getState: any;
    dispatch: any;
    channel: Channel;
  },
  effect: any,
  cb
) {
  cb(env.channel.put(effect.payload));
}

export const effectRunnerMap = {
  [TAKE]: runTakeEffect,
  [PUT]: runPutEffect,
};
