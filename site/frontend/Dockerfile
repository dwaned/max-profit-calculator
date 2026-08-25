# syntax=docker/dockerfile:1.4

# Stage 1: Generate Maven reports (checkstyle, surefire, jacoco, xref, etc.)
# Runs from the project root so it can read pom.xml + src.
FROM maven:3.9-eclipse-temurin-17 AS reports
WORKDIR /build

COPY pom.xml checkstyle.xml checkstyle_suppressions.xml ./
COPY src ./src

# The maven-site-plugin fails when pitest-maven's reporting goal can't find
# target/pit-reports/. Pitest is slow + flaky in containerized builds and
# we don't need its output on the frontend, so skip it but pre-create the
# directory with a placeholder index so the site plugin still aggregates it.
RUN mkdir -p target/pit-reports && \
    printf '<!DOCTYPE html><html><body><p>Mutation testing skipped in frontend build. Run <code>mvn verify org.pitest:pitest-maven:mutationCoverage site</code> locally to generate it.</p></body></html>' \
        > target/pit-reports/index.html

# -DskipITs skips the Failsafe-bound integration tests (need Docker-in-Docker).
# -Dpitest.skip=true skips the pitest mutation run.
RUN mvn -B -q -DskipITs -Dpitest.skip=true verify site

# Stage 2: Build the React frontend, with the generated reports copied into
# Vite's public/ so they end up at /reports/* in the served bundle.
FROM node:20-alpine AS frontend
WORKDIR /app

COPY site/frontend/package*.json ./
RUN npm ci
COPY site/frontend/ ./
COPY --from=reports /build/target/site ./public/reports

RUN npm run build

# Stage 3: Serve dist via nginx
FROM nginx:alpine
COPY --from=frontend /app/dist /usr/share/nginx/html
COPY site/frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
