# Используем Debian Slim. Это игнорирует настройки Bothost и дает нам правильный OpenSSL
FROM node:20-slim

WORKDIR /app

# Копируем и ставим зависимости
COPY package*.json ./
RUN npm install

# Копируем весь код
COPY . .

# Генерируем Prisma (теперь он найдет все библиотеки без ошибок)
RUN npx prisma generate

EXPOSE 3000
CMD ["npm", "start"]
