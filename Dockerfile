FROM openjdk:17-jdk-slim AS build
WORKDIR /docker
COPY pom.xml .
COPY src src
RUN apt-get update && apt-get install -y maven
RUN mvn clean install -DskipTests

FROM openjdk:17-jdk-slim
WORKDIR /app
COPY --from=build /docker/target/max-profit-calculator-1.0-SNAPSHOT.jar app.jar

RUN groupadd -r userA
RUN echo 'userA:x:1000:1000:userA:/home/userA:/bin/bash' >> /etc/passwd

USER userA

ENTRYPOINT ["java", "-jar", "app.jar"]
