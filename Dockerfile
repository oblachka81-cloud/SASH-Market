FROM node:20-alpine3.19

# Alpine 3.19 еще имеет openssl1.1-compat
RUN apk update && apk add --no-cache openssl1.1-compat libc6-compat

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate

EXPOSE 3000
CMD ["npm", "start"]
