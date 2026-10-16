ARG NODE_IMAGE=node:22-alpine
FROM ${NODE_IMAGE} AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.11.0 --activate
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY apps/web/package.json apps/web/
COPY apps/server/package.json apps/server/
COPY packages/shared/package.json packages/shared/
RUN pnpm install --frozen-lockfile
COPY tsconfig.base.json ./
COPY apps apps
COPY packages packages
RUN pnpm build
RUN pnpm --filter @toolnest/server deploy --prod --offline --frozen-lockfile /runtime \
  && rm -rf /runtime/src /runtime/node_modules/@toolnest/shared/src

FROM ${NODE_IMAGE} AS runtime
ENV NODE_ENV=production PORT=3000 DATA_DIR=/app/data
WORKDIR /app
COPY --from=builder --chown=node:node /runtime ./apps/server
COPY --from=builder --chown=node:node /app/apps/web/dist ./apps/web/dist
COPY LICENSE THIRD_PARTY_NOTICES.md ./
RUN mkdir -p /app/data && chown node:node /app/data
USER node
VOLUME ["/app/data"]
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:3000/api/health || exit 1
CMD ["node", "apps/server/dist/index.js"]
