# ===============================
# Etapa 1: Build com cache inteligente
# ===============================
FROM node:20 AS build
WORKDIR /app

# Copiar apenas os arquivos de dependência
COPY package.json package-lock.json* ./

# Instalar dependências com cache aproveitável
RUN npm install --legacy-peer-deps --no-package-lock

# Copiar o código restante
COPY . .

# Build otimizado do Vite
RUN npm run build


# ===============================
# Etapa 2: Servidor Nginx otimizado
# ===============================
FROM nginx:stable-alpine
WORKDIR /usr/share/nginx/html

# Remover conteúdo padrão
RUN rm -rf ./*

# Copiar build do Vite
COPY --from=build /app/dist .

# Copiar configuração customizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Habilitar compressão gzip (melhora tempo de carregamento)
RUN apk add --no-cache gzip

# Expor porta
EXPOSE 80

# Iniciar o Nginx
CMD ["nginx", "-g", "daemon off;"]
