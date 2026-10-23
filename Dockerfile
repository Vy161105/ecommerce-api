FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY prisma ./prisma
COPY prisma.config.ts ./

RUN npx prisma generate

COPY src ./src

EXPOSE 3020

CMD ["node", "src/server.js"]
