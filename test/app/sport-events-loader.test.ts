import { beforeEach, describe, expect, it } from "vitest";
import { SportEventId, type SportEvent } from "../../src/app/sport-event";
import { SportEventsStorage } from "../../src/infra/sport-events-storage";
import { SportEventsLoader } from "../../src/app/sport-events-loader";

const dummyEvent = {
  id: "4bb7b78f-6a23-43d0-a61a-1341f03f64e0" as SportEventId,
  sport: "FOOTBALL",
  competition: "Champions League",
  startTime: new Date(1709900380135),
  competitors: {
    HOME: {
      type: "HOME",
      name: "Barcelona",
    },
    AWAY: {
      type: "AWAY",
      name: "Real Madrid",
    },
  },
  status: "LIVE",
  scores: {
    "1ST_HALF": {
      type: "1ST_HALF",
      home: "1",
      away: "2",
    },
  },
} as SportEvent;

class TestSportEventsStorage implements SportEventsStorage {
  private storage = new Map([[dummyEvent.id, dummyEvent]]);

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

describe("SportEventsLoader", () => {
  let mockSportEventsStorage: SportEventsStorage;

  let loader: SportEventsLoader;

  beforeEach(() => {
    mockSportEventsStorage = new TestSportEventsStorage();
    loader = new SportEventsLoader(mockSportEventsStorage);
  });

  describe(".load()", () => {
    it("should update events with new data", async () => {
      const eventWithNewScores = {
        ...dummyEvent,
        scores: {
          ...dummyEvent.scores,
          "2ND_HALF": {
            type: "2ND_HALF",
            home: "3",
            away: "2",
          },
        },
      };

      expect(await mockSportEventsStorage.getAllNotRemovedEvents()).toEqual([dummyEvent]);

      await loader.load([eventWithNewScores]);

      expect(await mockSportEventsStorage.getAllNotRemovedEvents()).toEqual([
        {
          id: "4bb7b78f-6a23-43d0-a61a-1341f03f64e0",
          sport: "FOOTBALL",
          competition: "Champions League",
          startTime: new Date(1709900380135),
          competitors: {
            HOME: {
              type: "HOME",
              name: "Barcelona",
            },
            AWAY: {
              type: "AWAY",
              name: "Real Madrid",
            },
          },
          status: "LIVE",
          scores: {
            "1ST_HALF": {
              type: "1ST_HALF",
              home: "1",
              away: "2",
            },
            "2ND_HALF": {
              type: "2ND_HALF",
              home: "3",
              away: "2",
            },
          },
        },
      ]);
    });

    it("should set events status to REMOVED when not included in an update", async () => {
      expect(await mockSportEventsStorage.getAllNotRemovedEvents()).toEqual([dummyEvent]);

      await loader.load([]);

      expect(await mockSportEventsStorage.getAllNotRemovedEvents()).toEqual([]);
    });
  });
});
