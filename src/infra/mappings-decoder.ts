import { Result } from "../utils/result";
import { z } from "zod";

export type MappingsPayload = z.infer<typeof MappingsPayload>;
export const MappingsPayload = z.record(z.string().nonempty(), z.string().nonempty());

export class InvalidMappingsInputError {}

export class MappingsDecoder {
  decode(mappings: string): Result<MappingsPayload, InvalidMappingsInputError> {
    try {
      const keyValueStrings = mappings.split(";").filter((s) => s.length > 0);

      const keyValues = keyValueStrings.map((kvString) => {
        const [key, val] = kvString.split(":");
        return [key, val];
      });

      const data = MappingsPayload.parse(Object.fromEntries(keyValues));

      return [null, data];
    } catch (err) {
      return [new InvalidMappingsInputError(), null];
    }
  }
}
