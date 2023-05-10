FROM maven:3.8.3-openjdk-17-slim AS build
WORKDIR /docker
COPY pom.xml .
COPY src src
RUN mvn clean install -DskipTests

FROM openjdk:17-jdk-slim
WORKDIR /app
COPY --from=build /docker/target/max-profit-calculator-1.0-SNAPSHOT-jar-with-dependencies.jar app.jar

ENTRYPOINT ["java", "-jar", "app.jar"]
