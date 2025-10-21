FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN addgroup -S nodegroup && adduser -S nodeuser -G nodegroup

COPY . .

# Ajusta permissões para o novo usuário
RUN chown -R nodeuser:nodegroup /app

USER nodeuser

# Expõe a porta padrão
EXPOSE 1818

CMD ["npm", "run", "dev"]
