# Stage 1: Build the application
FROM gradle:8.14-jdk21 AS build
WORKDIR /app

# Copy gradle files from parent directory
COPY build.gradle settings.gradle ./
COPY gradle ./gradle

# Copy this service's build file and source code
COPY study-plan-service/build.gradle ./study-plan-service/
COPY study-plan-service/src ./study-plan-service/src

# Build the application
RUN gradle :study-plan-service:bootJar --no-daemon

# Stage 2: Run the application
FROM gcr.io/distroless/java21-debian12

WORKDIR /app

# Copy the built JAR from build stage
COPY --from=build /app/study-plan-service/build/libs/*.jar app.jar

EXPOSE 8081

ENTRYPOINT ["java", "-jar", "app.jar"]