# Stage 1: Build stage
FROM node:18-alpine AS base

WORKDIR /home/node/app

COPY package.json ./
COPY package-lock.json ./

RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 3000

# Stage 2: Runtime stage
FROM node:18-alpine

WORKDIR /home/node/app

COPY --from=base /home/node/app /home/node/app

EXPOSE 3000

CMD ["npm", "run", "dev"]