FROM node:20-alpine
WORKDIR /app

# Устанавливаем совместимую версию OpenSSL 1.1 для Prisma
RUN apk add --no-cache openssl1.1-compat

COPY package*.json ./
RUN npm install

COPY . .

# Генерируем Prisma клиент
RUN npx prisma generate || true

EXPOSE 3000
CMD ["npm", "start"]
