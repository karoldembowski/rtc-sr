import z from "zod";
import { StateDecoder } from "./state-decoder";
import { StateQueue, StateUpdatedEvent } from "./state-queue";
import { withTimeout } from "../utils/with-timeout";

const GetStateResponse = z.object({
  odds: z.string(),
});

export class StatesUpdateCron {
  private timer: NodeJS.Timeout;

  constructor(
    private readonly decoder: StateDecoder,
    private readonly queue: StateQueue,
  ) {
    const interval = 500;
    const fn = () =>
      this.updateState().finally(() => {
        this.timer = setTimeout(fn, interval);
      });

    this.timer = setTimeout(fn, interval);
  }

  public cleanup() {
    clearInterval(this.timer);
  }

  private async updateState() {
    try {
      const res = await withTimeout(
        () => fetch("http://simulation:3000/api/state", { keepalive: true }),
        { timeout: 1000 },
      );

      if (!res.ok) {
        throw new Error();
      }

      const payload = await res.json().catch(() => {
        throw new Error(`Invalid api response`);
      });

      const result = GetStateResponse.safeParse(payload);
      if (!result.success) {
        throw new Error(`Invalid api response: ${payload}`);
      }

      const data = result.data;

      const [err, state] = this.decoder.decode(data.odds);
      if (err != null) {
        throw new Error(`Invalid state paylod: ${data.odds}`);
      }

      await this.queue.sendMessage(new StateUpdatedEvent(state));
    } catch (err) {
      console.error("StatesUpdateCron: failure when updating state", err); //todo: logger
    }
  }
}
