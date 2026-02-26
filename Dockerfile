FROM eclipse-temurin:25-jdk-alpine AS build
WORKDIR /docker
COPY pom.xml .
COPY src src
COPY checkstyle.xml .
COPY checkstyle_suppressions.xml .
RUN apk add --no-cache maven
RUN mvn clean package -DskipTests

FROM eclipse-temurin:25-jre-alpine
WORKDIR /app
COPY --from=build /docker/target/max-profit-calculator-1.0-SNAPSHOT.jar app.jar

RUN addgroup -S userA && adduser -S userA -G userA

USER userA

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD wget -qO- http://localhost:9095/api/health || exit 1

EXPOSE 9095

ENTRYPOINT ["java", "-jar", "app.jar"]