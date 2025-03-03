import { StatePayload } from "./state-decoder";

export class StateUpdatedEvent {
  constructor(public readonly payload: StatePayload) {}
}

export type StateMessages = StateUpdatedEvent;

export interface StateQueue {
  sendMessage: (message: StateMessages) => Promise<void>;
}

export class InMemoryStateQueue implements StateQueue {
  private queue: StateMessages[] = [];

  async sendMessage(message: StateMessages): Promise<void> {
    this.queue.push(message);
  }
}
