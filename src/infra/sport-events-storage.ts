import { SportEvent, SportEventId } from "../app/sport-event";

export interface SportEventsStorage {
  getEvent: (id: SportEventId) => Promise<SportEvent | null>;
  updateEvent: (e: SportEvent) => Promise<void>;
  getAllNotRemovedEvents: () => Promise<SportEvent[]>;
}

export class InMemorySportEventsStorage implements SportEventsStorage {
  private storage = new Map<string, SportEvent>();

  constructor() {}

  getEvent(id: SportEventId): Promise<SportEvent | null> {
    return Promise.resolve(this.storage.get(id) ?? null);
  }

  getAllNotRemovedEvents(): Promise<SportEvent[]> {
    return Promise.resolve(
      Array.from(this.storage.values().filter((e) => e.status !== "REMOVED")),
    );
  }

  updateEvent(e: SportEvent): Promise<void> {
    return Promise.resolve(void this.storage.set(e.id, e));
  }
}
