## How to run

To run the all services:

`docker compose --profile prod up`

To run in dev mode:

`docker compose --profile dev up -d`

Running the dev server:
`docker exec -it <container_id> npm run dev`

Running tests:
`docker exec -it <container_id> npm run test`

## Design

Application consists of these components:

- Cron task
- Queue
- Consumer
- Transformer
- Loader

The "**cron**" task is effectively short-polling the API for fresh state.
It performs basic transformation on data to decode the payload, and pushes fresh state updates on to the queue.
It's limited to run at most one at a time, to avoid race conditions with generating messages.

**Queue** offers a back pressure mechanism, since we're given the requirement of calling the API at least 1 time per second.
(For simplicity it's kept on the same process so it actually doesn't provide backpressure, but it could be split onto a separate Worker thread).

**Consumer** triggers the flow Transformer->Loader whenever a state update is available.
The messages are always processed in order to avoid old state overriding new state.

**Transformer** is responsible for applying the mappings to the state payload. Given the asynchronous nature of the task,
it might happen that mappings are no longer available for the payload currently being processed.
Since we really only care about current state of the API, unprocessable messages are simply dropped.

**Loader** updates the sport events in the storage.
It accepts list of currently active events, and marks any events not on this list as removed.
