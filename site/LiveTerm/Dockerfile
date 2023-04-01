FROM node:18-alpine as base

RUN addgroup -S userA
RUN echo 'userA:x:1000:1000:userA:/home/userA:/bin/bash' >> /etc/passwd

USER root

RUN apk add --no-cache curl

WORKDIR /home/node/app
COPY package.json ./
RUN npm install -g npm-check-updates@latest && ncu -u
RUN ncu -u && npm install
COPY . ./

FROM base as production

ENV NODE_PATH=./build
RUN npm run build --verbose

USER userA