FROM node:18-alpine AS base

WORKDIR /home/node/app
COPY package.json ./

# If you have a lock file
COPY package-lock.json ./
RUN npm install --legacy-peer-deps
COPY . ./

FROM base AS production

ENV NODE_PATH=./build
USER node
RUN npm run build --verbose