FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
RUN ln -s /app/node_modules/ddd-tool-kit/lib /app/node_modules/src
EXPOSE 3001
CMD ["node", "dist/main"]
