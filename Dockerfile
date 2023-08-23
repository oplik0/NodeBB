FROM --platform=$BUILDPLATFORM node:lts as npm

RUN mkdir -p /usr/src/build && \
    chown -R node:node /usr/src/build
WORKDIR /usr/src/build

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV

COPY --chown=node:node install/package.json /usr/src/build/package.json

USER node

RUN npm install --omit=dev --no-optional


FROM node:lts-alpine3.18

ARG BUILDPLATFORM
ARG TARGETPLATFORM

RUN apk add --no-cache git bash vips-dev make g++

ARG NODE_ENV
ENV NODE_ENV=$NODE_ENV \
    daemon=false \
    silent=false

RUN mkdir -p /usr/src/app && \
    chown -R node:node /usr/src/app

COPY --chown=node:node --from=npm /usr/src/build /usr/src/app


WORKDIR /usr/src/app

RUN /bin/bash -c "[ $BUILDPLATFORM != $TARGETPLATFORM ] && \
    npm rebuild && \
    npm cache clean --force"

USER node

COPY --chown=node:node . /usr/src/app

EXPOSE 4567
VOLUME ["/usr/src/app/node_modules", "/usr/src/app/build", "/usr/src/app/public/uploads", "/opt/config"]
ENTRYPOINT ["./docker-entrypoint.sh"]
