import { SportEventsLoader } from "./app/sport-events-loader";
import { StateToSportEventsTransformer } from "./app/state-to-sport-events-transformer";
import { MappingsDecoder } from "./infra/mappings-decoder";
import { InMemoryMappingsStorage } from "./infra/mappings-storage";
import { InMemorySportEventsStorage } from "./infra/sport-events-storage";
import { StateDecoder } from "./infra/state-decoder";
import { InMemoryStateQueue } from "./infra/state-queue";
import { StateUpdatesConsumer } from "./infra/state-updates-consumer";
import { StatesUpdateCron } from "./infra/state-updates-cron";

console.log("hello world");

const stateDecoder = new StateDecoder();
const mappingsDecoder = new MappingsDecoder();
const que = new InMemoryStateQueue();
const mappingsStorage = new InMemoryMappingsStorage(mappingsDecoder);
const sportEventsStorage = new InMemorySportEventsStorage();
const transformer = new StateToSportEventsTransformer(mappingsStorage);
const loader = new SportEventsLoader(sportEventsStorage);

const cron = new StatesUpdateCron(stateDecoder, que);
const consumer = new StateUpdatesConsumer(que, transformer, loader);
