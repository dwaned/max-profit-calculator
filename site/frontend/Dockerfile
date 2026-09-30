# syntax=docker/dockerfile:1.4

# Built from the project root (see docker-compose files). Test reports are
# not bundled: the Reports page links to GitHub Pages.

# Stage 1: Build the React frontend.
FROM node:22-alpine AS frontend
WORKDIR /app

COPY site/frontend/package*.json ./
RUN npm ci
COPY site/frontend/ ./

# Optional API base URL baked into the bundle. docker-compose passes "/api"
# so the UI talks to the local backend through the nginx proxy below; when
# unset, App.jsx falls back to the deployed Render backend.
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

# Stage 2: Serve dist via nginx
FROM nginx:alpine
COPY --from=frontend /app/dist /usr/share/nginx/html
COPY site/frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
