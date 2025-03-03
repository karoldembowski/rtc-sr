import { beforeEach, describe, expect, it } from "vitest";
import {
  InvalidMappingsInputError,
  MappingsDecoder,
} from "../../src/infra/mappings-decoder";

const validInput =
  "98841461-0442-4dbb-ae53-2e039bbecad2:Houston Rockets;194e22c6-53f3-4f36-af06-53f168ebeee8:NBA - pre-season;c0a1f678-dbe5-4cc8-aa52-8c822dc65267:FOOTBALL;5a79d3e7-85b3-4d6b-b4bf-ddd743e7162f:PERIOD_4";

describe("MappingsDecoder", () => {
  let decoder: MappingsDecoder;

  beforeEach(() => {
    decoder = new MappingsDecoder();
  });

  describe(".decode()", () => {
    describe("should correctly decode mappings payload", () => {
      it("when provided valid payload", () => {
        const [err, data] = decoder.decode(validInput);

        expect(err).toBeNull();
        expect(data).toEqual({
          "98841461-0442-4dbb-ae53-2e039bbecad2": "Houston Rockets",
          "194e22c6-53f3-4f36-af06-53f168ebeee8": "NBA - pre-season",
          "c0a1f678-dbe5-4cc8-aa52-8c822dc65267": "FOOTBALL",
          "5a79d3e7-85b3-4d6b-b4bf-ddd743e7162f": "PERIOD_4",
        });
      });

      it("when provided empty payload", () => {
        const [err, data] = decoder.decode("");

        expect(err).toBeNull();
        expect(data).toEqual({});
      });
    });

    describe("should return error on invalid payload", () => {
      it("when provided invalid string", () => {
        const [err, data] = decoder.decode("abc123,./[]{}");

        expect(data).toBeNull();
        expect(err).toBeInstanceOf(InvalidMappingsInputError);
      });

      it("when provided incomplete data", () => {
        // missing value for id
        const incompletePayload = "98841461-0442-4dbb-ae53-2e039bbecad2:";

        const [err, data] = decoder.decode(incompletePayload);

        expect(data).toBeNull();
        expect(err).toBeInstanceOf(InvalidMappingsInputError);
      });
    });
  });
});
