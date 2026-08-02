FROM node:20-alpine

# КРИТИЧЕСКИ ВАЖНО: Обновляем репозитории и ставим совместимость с OpenSSL 1.1 для Prisma
RUN apk update && apk add --no-cache openssl1.1-compat libc6-compat

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Генерируем Prisma клиент (теперь он найдет нужные библиотеки)
RUN npx prisma generate

EXPOSE 3000
CMD ["npm", "start"]
