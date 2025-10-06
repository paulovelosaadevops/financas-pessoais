# Imagem base com Java 17
FROM openjdk:17-jdk-slim

# Define o diretório de trabalho
WORKDIR /app

# Copia o jar gerado pelo Gradle/Maven
COPY build/libs/financas-web-0.0.1-SNAPSHOT.jar app.jar

# Porta padrão da sua aplicação (Spring Boot usa 8080)
EXPOSE 8080

# Comando para rodar o app
ENTRYPOINT ["java", "-jar", "app.jar"]
