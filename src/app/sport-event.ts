import z from "zod";

export type SportEventId = z.infer<typeof SportEventId>;
export const SportEventId = z.string().nonempty().brand("SportEventId");

export type SportEvent = z.infer<typeof SportEvent>;
export const SportEvent = z.object({
  id: SportEventId,
  status: z.enum(["PRE", "LIVE", "REMOVED"]),
  scores: z.record(
    z.string(),
    z.object({
      type: z.string(),
      home: z.string(),
      away: z.string(),
    }),
  ),
  startTime: z.date(),
  sport: z.string(),
  competitors: z.object({
    HOME: z.object({
      type: z.literal("HOME"),
      name: z.string(),
    }),
    AWAY: z.object({
      type: z.literal("AWAY"),
      name: z.string(),
    }),
  }),
  competition: z.string(),
});
