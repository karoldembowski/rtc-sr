import { MappingsStorage } from "../infra/mappings-storage";
import { StatePayload } from "../infra/state-decoder";
import { Result } from "../utils/result";
import { MappingKey } from "./mapping";
import { SportEvent } from "./sport-event";

export class InvalidMappingsError {}

export class StateToSportEventsTransformer {
  constructor(private readonly mappingsStorage: MappingsStorage) {}

  public async transform(
    state: StatePayload,
  ): Promise<Result<SportEvent[], InvalidMappingsError>> {
    try {
      const mappingKeys: string[] = [];
      for (let i = 0; i < state.length; ++i) {
        const event = state[i]!;
        mappingKeys.push(event.sportId);
        mappingKeys.push(event.competitionId);
        mappingKeys.push(event.sportEventStatusId);
        mappingKeys.push(event.homeCompetitorId);
        mappingKeys.push(event.awayCompetitorId);
        for (let j = 0; j < event.scores.length; ++j) {
          const score = event.scores[j]!;
          mappingKeys.push(score.periodId);
        }
      }

      const mappings = await this.mappingsStorage.getMappings(
        mappingKeys.map((key) => MappingKey.parse(key)),
      );

      if (mappings.some((m) => m == null)) {
        throw new Error(`missing mappings`);
      }

      const events: SportEvent[] = [];

      let startIdx = 0;
      for (let i = 0; i < state.length; ++i) {
        const eventObj = state[i]!;

        const sport = mappings[startIdx + 0]?.[1];
        const competition = mappings[startIdx + 1]?.[1];
        const status = mappings[startIdx + 2]?.[1];
        const homeCompetitor = mappings[startIdx + 3]?.[1];
        const awayCompetitor = mappings[startIdx + 4]?.[1];
        const periods = eventObj.scores.map(
          (_, idx) => mappings[startIdx + 5 + idx]?.[1],
        );

        startIdx += 5 + periods.length;

        const event = SportEvent.parse({
          id: eventObj.sportEventId,
          status,
          startTime: new Date(eventObj.startTime),
          sport,
          competition,
          competitors: {
            HOME: {
              type: "HOME",
              name: homeCompetitor,
            },
            AWAY: {
              type: "AWAY",
              name: awayCompetitor,
            },
          },
          scores: Object.fromEntries(
            eventObj.scores.map((score, idx) => {
              return [
                periods[idx],
                {
                  type: periods[idx],
                  home: score.homeScore,
                  away: score.awayScore,
                },
              ];
            }),
          ),
        });

        events.push(event);
      }

      return [null, events];
    } catch (err) {
      console.log(`StateToEventsTransformer: failed to transform payload ${err}`);
      return [new InvalidMappingsError(), null];
    }
  }
}
