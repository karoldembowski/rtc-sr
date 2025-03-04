import z from "zod";

export type MappingKey = z.infer<typeof MappingKey>;
export const MappingKey = z.string().nonempty().brand("MappingKey");

export type MappingValue = z.infer<typeof MappingValue>;
export const MappingValue = z.string().nonempty().brand("MappingValue");

export type Mapping = [key: MappingKey, value: MappingValue];
