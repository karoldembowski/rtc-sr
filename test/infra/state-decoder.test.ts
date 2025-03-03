import { beforeEach, describe, expect, it } from "vitest";
import { StateDecoder, InvalidStateInputError } from "../../src/infra/state-decoder";

const validInput =
  "995e0722-4118-4f8e-a517-82f6ea240673,c0a1f678-dbe5-4cc8-aa52-8c822dc65267,7ee17545-acd2-4332-869b-1bef06cfaec8,1709900432183,29190088-763e-4d1c-861a-d16dbfcf858c,3cd8eeee-a57c-48a3-845f-93b561a95782,ac68a563-e511-4776-b2ee-cd395c7d\n4bb7b78f-6a23-43d0-a61a-1341f03f64e0,c0a1f678-dbe5-4cc8-aa52-8c822dc65267,194e22c6-53f3-4f36-af06-53f168ebeee8,1709900380135,d6fdf482-8151-4651-92c2-16e9e8ea4b8b,b582b685-e75c-4139-8274-d19f078eabef,7fa4e60c-71ad-4e76-836f-5c2bc6602156,e2d12fef-ae82-4a35-b389-51edb8dc664e@1:2|6c036000-6dd9-485d-97a1-e338e6a32a51@1:2,";

describe("StateDecoder", () => {
  let decoder: StateDecoder;

  beforeEach(() => {
    decoder = new StateDecoder();
  });

  describe(".decode()", () => {
    describe("should correctly decode state payload", () => {
      it("when provided valid payload", () => {
        const [err, data] = decoder.decode(validInput);

        expect(err).toBeNull();
        expect(data).toEqual([
          {
            sportEventId: "995e0722-4118-4f8e-a517-82f6ea240673",
            sportId: "c0a1f678-dbe5-4cc8-aa52-8c822dc65267",
            competitionId: "7ee17545-acd2-4332-869b-1bef06cfaec8",
            startTime: 1709900432183,
            homeCompetitorId: "29190088-763e-4d1c-861a-d16dbfcf858c",
            awayCompetitorId: "3cd8eeee-a57c-48a3-845f-93b561a95782",
            sportEventStatusId: "ac68a563-e511-4776-b2ee-cd395c7d",
            scores: [],
          },
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
                homeScore: 1,
                awayScore: 2,
              },
              {
                periodId: "6c036000-6dd9-485d-97a1-e338e6a32a51",
                homeScore: 1,
                awayScore: 2,
              },
            ],
          },
        ]);
      });

      it("when provided empty payload", () => {
        const [err, data] = decoder.decode("");

        expect(err).toBeNull();
        expect(data).toEqual([]);
      });
    });

    describe("should return error on invalid payload", () => {
      it("when provided invalid string", () => {
        const [err, data] = decoder.decode("abc123,./[]{}");

        expect(data).toBeNull();
        expect(err).toBeInstanceOf(InvalidStateInputError);
      });

      it("when provided incomplete data", () => {
        // missing indexes 1 and 4
        const incompletePayload =
          "995e0722-4118-4f8e-a517-82f6ea240673,,7ee17545-acd2-4332-869b-1bef06cfaec8,1709900432183,,3cd8eeee-a57c-48a3-845f-93b561a95782,ac68a563-e511-4776-b2ee-cd395c7";

        const [err, data] = decoder.decode(incompletePayload);

        expect(data).toBeNull();
        expect(err).toBeInstanceOf(InvalidStateInputError);
      });
    });
  });
});
