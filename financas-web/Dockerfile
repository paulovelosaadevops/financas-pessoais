# ===============================
# Etapa 1: Build da aplicação com Gradle
# ===============================
FROM gradle:8.7-jdk17 AS build
WORKDIR /app

# Copia arquivos de build primeiro (para cache)
COPY build.gradle settings.gradle ./
COPY gradle gradle
RUN gradle clean --no-daemon

# Copia o código do projeto
COPY . .

# Build sem testes
RUN gradle build -x test --no-daemon


# ===============================
# Etapa 2: Runtime com suporte gráfico ao Apache POI
# ===============================
FROM openjdk:17-jdk-slim

WORKDIR /app

# 🔹 Corrige o erro do Apache POI (precisa de fontes e suporte X11 para autoSizeColumn)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libfreetype6 \
    fontconfig \
    libx11-6 \
    libxext6 \
    libxi6 \
    fonts-dejavu-core \
    && rm -rf /var/lib/apt/lists/*

# Define timezone
ENV TZ=America/Sao_Paulo

# Copia o jar da etapa anterior
COPY --from=build /app/build/libs/*.jar app.jar

# Expor porta padrão
EXPOSE 8080

# Executa
CMD java -jar app.jar
