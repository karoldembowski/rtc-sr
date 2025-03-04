import { StatePayload } from "./state-decoder";

export class StateUpdatedEvent {
  constructor(public readonly payload: StatePayload) {}
}

export type StateMessage = StateUpdatedEvent;

export interface StateQueue {
  sendMessage: (message: StateMessage) => Promise<void>;
  readMessage: () => Promise<StateMessage | null>;
}

export class InMemoryStateQueue implements StateQueue {
  private queue: StateMessage[] = [];

  async sendMessage(message: StateMessage): Promise<void> {
    this.queue.push(message);
  }

  async readMessage(): Promise<StateMessage | null> {
    return this.queue.shift() ?? null;
  }
}
