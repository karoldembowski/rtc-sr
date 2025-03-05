FROM node:22-slim AS dev
WORKDIR /api
COPY . /api/
RUN npm install
ENTRYPOINT [ "/bin/bash" ]

FROM node:22-slim AS build
WORKDIR /api
COPY . /api/
RUN npm ci
RUN npm run build

FROM node:22-slim AS prod
WORKDIR /api
RUN chown -R node /api
USER node
COPY --from=build /api/package.json /api/package-lock.json /api/
COPY --from=build /api/dist /api/dist
RUN npm ci --omit=dev
CMD ["npm", "run", "start"]
