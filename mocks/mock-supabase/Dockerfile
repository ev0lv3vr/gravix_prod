FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --production

COPY . .

EXPOSE 3200 3201

CMD ["node", "server.js"]
