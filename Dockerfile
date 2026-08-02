FROM node:20-slim

WORKDIR /app

# Обновляем систему и убеждаемся, что OpenSSL 3 установлен (он там по умолчанию, но для страховки)
RUN apt-get update && apt-get install -y libssl3 ca-certificates && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY . .

# Явно указываем Prisma использовать library engine и генерируем клиент
ENV PRISMA_CLIENT_ENGINE_TYPE=library
RUN npx prisma generate

EXPOSE 3000
CMD ["npm", "start"]
