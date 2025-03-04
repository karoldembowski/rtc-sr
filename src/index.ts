import { SportEventsLoader } from "./app/sport-events-loader";
import { StateToSportEventsTransformer } from "./app/state-to-sport-events-transformer";
import { MappingsDecoder } from "./infra/mappings-decoder";
import { InMemoryMappingsStorage } from "./infra/mappings-storage";
import { InMemorySportEventsStorage } from "./infra/sport-events-storage";
import { StateDecoder } from "./infra/state-decoder";
import { InMemoryStateQueue } from "./infra/state-queue";
import { StateUpdatesConsumer } from "./infra/state-updates-consumer";
import { StatesUpdateCron } from "./infra/state-updates-cron";
import { serve } from "@hono/node-server";
import { Hono } from "hono";

const stateDecoder = new StateDecoder();
const mappingsDecoder = new MappingsDecoder();
const queue = new InMemoryStateQueue();
const mappingsStorage = new InMemoryMappingsStorage(mappingsDecoder);
const sportEventsStorage = new InMemorySportEventsStorage();
const transformer = new StateToSportEventsTransformer(mappingsStorage);
const loader = new SportEventsLoader(sportEventsStorage);

const cron = new StatesUpdateCron(stateDecoder, queue);
const consumer = new StateUpdatesConsumer(queue, transformer, loader);

const app = new Hono();

app.get("/client/state", async (ctx) => {
  const events = await sportEventsStorage.getAllNotRemovedEvents();
  const response = Object.fromEntries(events.map((e) => [e.id, e]));
  return ctx.json(response, 200);
});

serve({
  port: Number(process.env.PORT),
  fetch: app.fetch,
});
console.log(`Server running on http://localhost:${process.env.PORT}/`);
