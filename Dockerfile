FROM node:lts

RUN groupadd --gid 1001 nodebb && \
    useradd --uid 1001 --gid nodebb --shell /bin/bash --create-home nodebb && \
    mkdir -p /usr/src/app && \
    chown -R nodebb:nodebb /usr/src/app
WORKDIR /usr/src/app

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV

COPY --chown=nodebb:nodebb install/package.json /usr/src/app/package.json

USER nodebb

RUN npm install --only=prod && \
    npm cache clean --force

COPY --chown=nodebb:nodebb . /usr/src/app

ENV NODE_ENV=production \
    daemon=false \
    silent=false

EXPOSE 4567

CMD node ./nodebb build ;  node ./nodebb start
