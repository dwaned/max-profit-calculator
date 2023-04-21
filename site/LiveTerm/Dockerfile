FROM node:18-alpine as base

RUN addgroup -g 1001 nodejs && \
    adduser -D -u 1001 -G nodejs nodejs


WORKDIR /home/node/app
COPY package.json ./
RUN npm install -g npm-check-updates@latest && ncu -u
RUN ncu -u && npm install
COPY . ./

FROM base as production

ENV NODE_PATH=./build
USER nodejs
RUN npm run build --verbose
