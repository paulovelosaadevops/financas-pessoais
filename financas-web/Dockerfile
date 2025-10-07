# ===============================
# Etapa 1: Build da aplicação com Gradle
# ===============================
FROM gradle:8.7-jdk17 AS build
WORKDIR /app

# Copia apenas os arquivos de configuração primeiro (para cache de dependências)
COPY build.gradle settings.gradle ./
COPY gradle gradle

# Baixa dependências antes de copiar o código-fonte (build mais rápido em rebuilds)
RUN gradle clean --no-daemon

# Copia o restante do código
COPY . .

# Faz o build, pulando testes
RUN gradle build -x test --no-daemon


# ===============================
# Etapa 2: Imagem final (runtime)
# ===============================
FROM openjdk:17-jdk-slim
WORKDIR /app

# 🔹 Corrige o erro do Apache POI (autoSizeColumn precisa de fontes e freetype)
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    libfreetype6 \
    fonts-dejavu-core && \
    rm -rf /var/lib/apt/lists/*

# Define timezone
ENV TZ=America/Sao_Paulo

# Copia o .jar gerado
COPY --from=build /app/build/libs/*.jar app.jar

# Expõe a porta
EXPOSE 8080

# Usa shell em vez de JSON (melhor compatibilidade com Render)
CMD java -jar app.jar
