FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build:prod

FROM node:20-alpine AS runner
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY api/ ./api/
COPY --from=builder /app/dist ./dist/
EXPOSE 8080
ENV NODE_ENV=production
CMD ["node", "api/prod-server.js"]
