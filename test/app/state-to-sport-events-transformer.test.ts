import { beforeEach, describe, expect, it } from "vitest";
import {
  InvalidMappingsError,
  StateToSportEventsTransformer,
} from "../../src/app/state-to-sport-events-transformer";
import { type MappingsStorage } from "../../src/infra/mappings-storage";
import { type StatePayload } from "../../src/infra/state-decoder";
import { type MappingKey, type Mapping } from "../../src/app/mapping";

const statePayload: StatePayload = [
  {
    sportEventId: "4bb7b78f-6a23-43d0-a61a-1341f03f64e0",
    sportId: "c0a1f678-dbe5-4cc8-aa52-8c822dc65267",
    competitionId: "194e22c6-53f3-4f36-af06-53f168ebeee8",
    startTime: 1709900380135,
    homeCompetitorId: "d6fdf482-8151-4651-92c2-16e9e8ea4b8b",
    awayCompetitorId: "b582b685-e75c-4139-8274-d19f078eabef",
    sportEventStatusId: "7fa4e60c-71ad-4e76-836f-5c2bc6602156",
    scores: [
      {
        periodId: "e2d12fef-ae82-4a35-b389-51edb8dc664e",
        homeScore: "1",
        awayScore: "2",
      },
      {
        periodId: "6c036000-6dd9-485d-97a1-e338e6a32a51",
        homeScore: "1",
        awayScore: "2",
      },
    ],
  },
];

const statePayloadWithMissingMappings: StatePayload = [
  {
    sportEventId: "4bb7b78f-6a23-43d0-a61a-1341f03f64e0",
    sportId: "c0a1f678-dbe5-4cc8-aa52-8c822dc65267",
    competitionId: "194e22c6-53f3-4f36-af06-53f168ebeee8",
    startTime: 1709900380135,
    homeCompetitorId: "d6fdf482-8151-4651-92c2-16e9e8ea4b8b",
    awayCompetitorId: "ccc2b685-e75c-4139-8274-d19f078eabef", // competitor doesn't exist in mappings
    sportEventStatusId: "7fa4e60c-71ad-4e76-836f-5c2bc6602156",
    scores: [
      {
        periodId: "e2d12fef-ae82-4a35-b389-51edb8dc664e",
        homeScore: "1",
        awayScore: "2",
      },
      {
        periodId: "6c036000-6dd9-485d-97a1-e338e6a32a51",
        homeScore: "1",
        awayScore: "2",
      },
    ],
  },
];

const mappings = [
  ["c0a1f678-dbe5-4cc8-aa52-8c822dc65267", "FOOTBALL"],
  ["194e22c6-53f3-4f36-af06-53f168ebeee8", "Champions League"],
  ["d6fdf482-8151-4651-92c2-16e9e8ea4b8b", "Barcelona"],
  ["b582b685-e75c-4139-8274-d19f078eabef", "Real Madrid"],
  ["7fa4e60c-71ad-4e76-836f-5c2bc6602156", "LIVE"],
  ["e2d12fef-ae82-4a35-b389-51edb8dc664e", "1ST_HALF"],
  ["6c036000-6dd9-485d-97a1-e338e6a32a51", "2ND_HALF"],
] as Mapping[];

class TestMappingsStorage implements MappingsStorage {
  async getMappings(keys: MappingKey[]): Promise<Array<Mapping | null>> {
    return keys.map((key) => mappings.find((m) => m[0] === key) ?? null);
  }
}

describe("StateToSportEventsTransformer", () => {
  let mockMappingStorage: MappingsStorage;

  let transformer: StateToSportEventsTransformer;

  beforeEach(() => {
    mockMappingStorage = new TestMappingsStorage();
    transformer = new StateToSportEventsTransformer(mockMappingStorage);
  });

  describe(".transform()", () => {
    it("should correctly apply mappings", async () => {
      const [err, data] = await transformer.transform(statePayload);

      expect(err).toBeNull();
      expect(data).toEqual([
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
              home: "1",
              away: "2",
            },
          },
        },
      ]);
    });

    it("should return error when not able to find mappings", async () => {
      const [err, data] = await transformer.transform(statePayloadWithMissingMappings);

      expect(data).toBeNull();
      expect(err).toBeInstanceOf(InvalidMappingsError);
    });
  });
});
