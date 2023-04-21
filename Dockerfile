FROM maven:3.9.0-eclipse-temurin-17-alpine AS build
COPY src /usr/src/app/src
COPY pom.xml /usr/src/app

RUN addgroup -S userA
RUN echo 'userA:x:1000:1000:userA:/home/userA:/bin/bash' >> /etc/passwd

USER root

RUN apk add --no-cache curl

RUN mvn -f /usr/src/app/pom.xml clean install -DskipTests

VOLUME /tmp
ARG JAR_FILE=./target/max-profit-calculator-1.0-SNAPSHOT-jar-with-dependencies.jar
WORKDIR /app
COPY ${JAR_FILE} app.jar

USER userA

ENTRYPOINT ["java","-Djava.security.egd=file:/dev/./urandom","-jar","/app/app.jar"]

