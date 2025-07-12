# Stage 1: Build the application
FROM gradle:8.14-jdk21 AS build
WORKDIR /app

# Copy gradle files from parent directory
COPY ../build.gradle ../settings.gradle ./
COPY ../gradle ./gradle

# Copy this service's build file and source code
COPY ai-advisor-service/build.gradle ./ai-advisor-service/
COPY ai-advisor-service/src ./ai-advisor-service/src

# Build the application
RUN gradle :ai-advisor-service:bootJar --no-daemon

# Stage 2: Run the application
FROM gcr.io/distroless/java21-debian12

WORKDIR /app

# Copy the built JAR from build stage
COPY --from=build /app/ai-advisor-service/build/libs/*.jar app.jar

EXPOSE 8082

ENTRYPOINT ["java", "-jar", "app.jar"]