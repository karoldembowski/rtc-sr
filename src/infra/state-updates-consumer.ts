import { SportEventsLoader } from "../app/sport-events-loader";
import { StateToSportEventsTransformer } from "../app/state-to-sport-events-transformer";
import { StateMessage, StateQueue } from "./state-queue";

export class StateUpdatesConsumer {
  constructor(
    private readonly queue: StateQueue,
    private readonly transformer: StateToSportEventsTransformer,
    private readonly loader: SportEventsLoader,
  ) {
    const fn = async () => {
      try {
        const msg = await this.queue.readMessage();
        if (msg != null) {
          await this.processMessage(msg);
        }
      } finally {
        setImmediate(() => fn());
      }
    };
    fn();
  }

  private async processMessage(message: StateMessage): Promise<void> {
    const [err, events] = await this.transformer.transform(message.payload);
    if (err != null) {
      console.log("Skipping state update");
      return;
    }

    await this.loader.load(events);
  }
}
