FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:24-alpine AS production
WORKDIR /app

# Install security updates
RUN apk update && apk upgrade --no-cache

# Set permissions for the node user
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev && chown -R node:node /app

COPY --from=builder --chown=node:node /app/dist ./dist

USER node
ENV DB_SSL=false
EXPOSE 3000
CMD ["node", "dist/main.js"]
