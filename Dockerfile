FROM openjdk:17-jdk-slim AS build
WORKDIR /docker
COPY pom.xml .
COPY src src
RUN apt-get update && apt-get install -y maven && rm -rf /var/lib/apt/lists/*
RUN mvn clean install -DskipTests

FROM openjdk:17-jdk-slim
WORKDIR /app
COPY --from=build /docker/target/max-profit-calculator-1.0-SNAPSHOT.jar app.jar

# Install curl and create user with proper permissions
RUN apt-get update && \
    apt-get install -y curl && \
    rm -rf /var/lib/apt/lists/* && \
    groupadd -r userA && \
    useradd -r -g userA -d /home/userA -m userA && \
    chown -R userA:userA /app

USER userA

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:9095/api/health || exit 1

EXPOSE 9095

ENTRYPOINT ["java", "-jar", "app.jar"]