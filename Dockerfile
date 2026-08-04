FROM node:22.21-alpine3.22 AS build

RUN apk add --no-cache python3 make g++

WORKDIR /opt/node_app/app

COPY --chown=node:node package.json package-lock.json* ./
RUN npm ci

COPY --chown=node:node . .
RUN npm run build \
    && npm prune --omit=dev \
    && npm cache clean --force

FROM node:22.21-alpine3.22

ENV NODE_ENV=production

USER node

WORKDIR /opt/node_app/app

COPY --from=build --chown=node:node /opt/node_app/app/node_modules ./node_modules
COPY --from=build --chown=node:node /opt/node_app/app/dist ./dist
COPY --from=build --chown=node:node /opt/node_app/app/src/templates ./src/templates

CMD ["node", "dist/app.js"]
