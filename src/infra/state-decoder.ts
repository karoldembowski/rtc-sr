import { Result } from "../utils/result";
import { z } from "zod";

const ScoreSchema = z.object({
  periodId: z.string().nonempty(),
  homeScore: z.coerce.number(),
  awayScore: z.coerce.number(),
});

const EventDataSchema = z.object({
  sportEventId: z.string().nonempty(),
  sportId: z.string().nonempty(),
  competitionId: z.string().nonempty(),
  startTime: z.coerce.number(),
  homeCompetitorId: z.string().nonempty(),
  awayCompetitorId: z.string().nonempty(),
  sportEventStatusId: z.string().nonempty(),
  scores: z.array(ScoreSchema),
});

export type StatePayload = z.infer<typeof StatePayload>;
export const StatePayload = z.array(EventDataSchema);

export class InvalidStateInputError {}

export class StateDecoder {
  decode(state: string): Result<StatePayload, InvalidStateInputError> {
    try {
      const eventStrings = state.split("\n").filter((s) => s.length > 0);
      
      const data = eventStrings.map((eventString) => {
        const properties = eventString.split(",");

        const scoresProp = properties[7];
        const scores =
          scoresProp == null
            ? []
            : scoresProp.split("|").map((scoreString) => {
                const [periodId, score] = scoreString.split("@");
                const [homeScore, awayScore] = score == null ? [] : score.split(":");

                return ScoreSchema.parse({
                  periodId,
                  homeScore,
                  awayScore,
                });
              });

        return EventDataSchema.parse({
          sportEventId: properties[0],
          sportId: properties[1],
          competitionId: properties[2],
          startTime: properties[3],
          homeCompetitorId: properties[4],
          awayCompetitorId: properties[5],
          sportEventStatusId: properties[6],
          scores: scores,
        });
      });

      return [null, data];
    } catch (err) {
      return [new InvalidStateInputError(), null];
    }
  }
}
