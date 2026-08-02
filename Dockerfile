FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Генерируем Prisma клиент (защита от ошибок при первом запуске)
RUN npx prisma generate || true

EXPOSE 3000
CMD ["npm", "start"]
