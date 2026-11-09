# Build targets:
#   docker build --target api    -t clipforge-api .
#   docker build --target worker -t clipforge-worker .
FROM node:22-bookworm-slim AS base
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json* ./
COPY packages/core/package.json packages/core/
COPY apps/api/package.json apps/api/
COPY apps/worker/package.json apps/worker/
COPY apps/web/package.json apps/web/
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi
COPY packages packages
COPY apps/api apps/api
COPY apps/worker apps/worker
COPY tsconfig.base.json ./
RUN npm run db:generate && npm run build -w @clipforge/api -w @clipforge/worker
ENV NODE_ENV=production

FROM base AS api
EXPOSE 4000
USER node
CMD ["node", "apps/api/dist/index.js"]

FROM base AS worker
# ffmpeg renders clips, yt-dlp fetches links, OpenCV powers speaker tracking, DejaVu is the caption font.
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg python3 python3-pip fonts-dejavu-core \
    && pip3 install --no-cache-dir --break-system-packages -U "yt-dlp[default]" opencv-python-headless \
    && rm -rf /var/lib/apt/lists/*
USER node
EXPOSE 9100
CMD ["node", "apps/worker/dist/index.js"]
