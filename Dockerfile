FROM openjdk:17-jdk-alpine

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

VOLUME /tmp
ARG JAR_FILE=target/max-profit-calculator-1.0-SNAPSHOT-jar-with-dependencies.jar
WORKDIR /app
COPY ${JAR_FILE} app.jar
ENTRYPOINT ["java","-Djava.security.egd=file:/dev/./urandom","-jar","/app.jar"]
