import { SportEventsStorage } from "../infra/sport-events-storage";
import { SportEvent } from "./sport-event";

export class SportEventsLoader {
  constructor(private readonly sportEventsStorage: SportEventsStorage) {}

  public async load(currentEvents: SportEvent[]): Promise<void> {
    const activeEvents = await this.sportEventsStorage.getAllNotRemovedEvents();

    const currentEventsIds = currentEvents.map((e) => e.id);

    const removedEvents = activeEvents.filter((e) => !currentEventsIds.includes(e.id));

    await Promise.all([
      ...removedEvents.map(async (event) => {
        await this.sportEventsStorage.updateEvent({
          ...event,
          status: "REMOVED",
        });
      }),
      ...currentEvents.map(async (event) => {
        await this.sportEventsStorage.updateEvent(event);
      }),
    ]);
  }
}
