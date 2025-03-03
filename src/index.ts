import { StateDecoder } from "./infra/state-decoder";
import { InMemoryStateQueue } from "./infra/state-queue";
import { StatesUpdateCron } from "./infra/state-updates-cron";

console.log("hello world");

const stateDecoder = new StateDecoder();
const que = new InMemoryStateQueue();

const cron = new StatesUpdateCron(stateDecoder, que);
