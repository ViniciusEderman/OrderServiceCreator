FROM node:22-alpine

RUN addgroup -S nodegroup && adduser -S nodeuser -G nodegroup

WORKDIR /app

COPY package*.json ./

COPY tsconfig.json ./

RUN npm ci

COPY src/infrastructure/db/schema/ ./src/infrastructure/db/schema/

RUN npx prisma generate --schema=./src/infrastructure/db/schema/schema.prisma

COPY src/ ./src/

USER nodeuser

EXPOSE 3000

CMD ["npm", "run", "dev"]