FROM maven:3-eclipse-temurin-24 AS build
WORKDIR /docker
# Resolve dependencies in their own layer so source-only changes reuse it.
COPY pom.xml .
RUN mvn -B -q dependency:go-offline -DskipTests
COPY src src
COPY checkstyle.xml .
COPY checkstyle_suppressions.xml .
RUN mvn -B clean package -DskipTests

FROM eclipse-temurin:25-jre
WORKDIR /app
COPY --from=build /docker/target/max-profit-calculator-1.0-SNAPSHOT.jar app.jar

# curl is only for the HEALTHCHECK. Not pinning its exact Ubuntu package version
# (it changes with every base-image update); the base image itself is kept current
# by Dependabot.
# hadolint ignore=DL3008
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# Numeric IDs so the user resolves the same way on any host or orchestrator.
RUN groupadd --system --gid 10001 app && useradd --system --uid 10001 --gid 10001 app

USER 10001:10001

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD ["curl", "-fsS", "http://localhost:9095/api/health"]

EXPOSE 9095

ENTRYPOINT ["java", "-jar", "app.jar"]
