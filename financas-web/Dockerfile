# Etapa 1: build da aplicação com Gradle
FROM gradle:8.7-jdk17 AS build
WORKDIR /app
COPY . .
RUN gradle clean build -x test

# Etapa 2: rodar o JAR gerado
FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
EXPOSE 8080
ENV TZ=America/Sao_Paulo
ENTRYPOINT ["java", "-jar", "app.jar"]
