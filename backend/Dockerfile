FROM node:20-alpine

WORKDIR /app

COPY package.json ./
RUN npm ci --only=production

COPY dist ./dist

EXPOSE 4000

ENV NODE_ENV=production

CMD ["node", "dist/server.js"]
