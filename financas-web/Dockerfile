# ===============================
# 🔹 Etapa 1: Build com cache Gradle
# ===============================
FROM gradle:8.7-jdk17 AS build
WORKDIR /app

# Copia apenas os arquivos de dependências para usar cache de camadas
COPY build.gradle settings.gradle ./
COPY gradle gradle
RUN gradle dependencies --no-daemon || return 0

# Agora copia o resto do código
COPY . .

# Faz o build (sem testes)
RUN gradle clean build -x test --no-daemon


# ===============================
# 🔹 Etapa 2: Runtime leve com suporte gráfico (para Apache POI)
# ===============================
FROM openjdk:17-jdk-slim AS runtime
WORKDIR /app

# Instala apenas o mínimo necessário para autoSizeColumn do Apache POI
RUN apt-get update && apt-get install -y --no-install-recommends \
    fontconfig \
    fonts-dejavu-core \
    libfreetype6 \
    libxrender1 \
    libxext6 \
    && rm -rf /var/lib/apt/lists/*

# Define timezone e encoding padrão
ENV TZ=America/Sao_Paulo
ENV LANG=pt_BR.UTF-8
ENV LC_ALL=pt_BR.UTF-8

# Copia o JAR gerado
COPY --from=build /app/build/libs/*.jar app.jar

# Exposição da porta padrão
EXPOSE 8080

# Executa o app
ENTRYPOINT ["java","-jar","app.jar"]
