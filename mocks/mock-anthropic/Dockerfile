FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --production

COPY . .

ENV MOCK_ANTHROPIC_PORT=3100
ENV MOCK_MODE=replay

EXPOSE 3100

CMD ["node", "server.js"]
