FROM maven:3.9-eclipse-temurin-25 AS build
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

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

RUN groupadd --system userA && useradd --system --gid userA userA

USER userA

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:9095/api/health || exit 1

EXPOSE 9095

ENTRYPOINT ["java", "-jar", "app.jar"]
