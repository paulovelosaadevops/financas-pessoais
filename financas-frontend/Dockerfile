# Etapa 1: build do front
FROM node:20 AS build
WORKDIR /app

# Copiar apenas os manifests primeiro
COPY package*.json ./

# Instalação limpa: ignora lockfile local e reconstrói dependências
RUN npm install --legacy-peer-deps --no-package-lock

# Copiar o resto do código
COPY . .

# Build do projeto
RUN npm run build


# Etapa 2: Nginx para servir os arquivos
FROM nginx:alpine

# Copiar o build do front
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar a configuração customizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
