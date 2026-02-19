FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --production

COPY . .

EXPOSE 3300

ENV MOCK_STRIPE_PORT=3300

CMD ["node", "server.js"]
