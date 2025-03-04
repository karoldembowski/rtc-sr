import { LRUCache } from "lru-cache";
import { MappingsDecoder } from "./mappings-decoder";
import z from "zod";
import { Mapping, MappingKey, MappingValue } from "../app/mapping";

const GetMappingsResponse = z.object({
  mappings: z.string(),
});

export interface MappingsStorage {
  getMappings: (keys: MappingKey[]) => Promise<Array<Mapping | null>>;
}

export class InMemoryMappingsStorage implements MappingsStorage {
  private cache = new LRUCache<MappingKey, MappingValue>({ max: 100 });

  constructor(private readonly decoder: MappingsDecoder) {}

  async getMappings(keys: MappingKey[]): Promise<Array<Mapping | null>> {
    const response = new Array<Mapping | null>(keys.length).fill(null);

    const missingKeys = new Set(...keys);

    for (let i = 0; i < keys.length; ++i) {
      const key = keys[i]!;
      const value = this.cache.get(key);
      if (value != null) {
        response[i] = [key, value];
        missingKeys.delete(key);
      }
    }

    if (missingKeys.size <= 0) return response;

    try {
      const res = await fetch("http://simulation:3000/api/mappings", { keepalive: true });

      if (!res.ok) {
        throw new Error("Invalid api response");
      }

      const payload = await res.json().catch(() => {
        throw new Error("Invalid api response");
      });

      const result = GetMappingsResponse.safeParse(payload);
      if (!result.success) {
        throw new Error(`Invalid api response: ${payload}`);
      }
      const data = result.data;

      const [err, mappings] = this.decoder.decode(data.mappings);
      if (err != null) {
        throw new Error(`Invalid mappings paylod: ${data.mappings}`);
      }

      for (const [k, v] of Object.entries(mappings)) {
        this.cache.set(MappingKey.parse(k), MappingValue.parse(v));
      }

      for (let i = 0; i < keys.length; ++i) {
        if (response[i] != null) continue;
        const key = keys[i]!;
        const value = this.cache.get(key);
        if (value != null) {
          response[i] = [key, value];
        }
      }

      return response;
    } catch (err) {
      console.log(`InMemoryMappingsStorage: failed fetching mappings: ${err}`);
      return response;
    }
  }
}
