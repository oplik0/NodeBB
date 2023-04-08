FROM node:lts

RUN mkdir -p /usr/src/app && \
    chown -R node:node /usr/src/app
WORKDIR /usr/src/app

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV

COPY --chown=node:node install/package.json /usr/src/app/package.json

USER node

RUN npm install --only=prod && \
    npm cache clean --force

COPY --chown=node:node . /usr/src/app

ENV NODE_ENV=production \
    daemon=false \
    silent=false

EXPOSE 4567

CMD echo "\033[1;33mWarning: \033[0mNodeBB is moving from Docker Hub to GitHub Container Registry. This means that this image will no longer be maintained. In order to continue receiving updates pleace change the image tag from \033[0;90mnodebb/docker\033[0m to \033[1;32mghcr.io/nodebb/nodebb\033[0m" \
    && test -n "${SETUP}" && ./nodebb setup || node ./nodebb build; node ./nodebb start
