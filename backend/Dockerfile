# Build from the PROJECT ROOT (the seed reads ../src/data):   docker build -f backend/Dockerfile -t stayora-api .
# Run:  docker run -p 4000:4000 -e ADMIN_TOKEN=change-me-to-16+chars -e CORS_ORIGIN=https://your-site -v stayora-data:/data stayora-api
FROM node:22-alpine AS deps
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev

FROM node:22-alpine
ENV NODE_ENV=production DB_PATH=/data/stayora.db PORT=4000
WORKDIR /app
COPY --from=deps /app/backend/node_modules backend/node_modules
COPY backend backend
COPY src/data src/data
RUN mkdir /data && chown node:node /data
USER node
WORKDIR /app/backend
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1:4000/api/health || exit 1
CMD ["node", "src/server.js"]
