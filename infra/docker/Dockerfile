# Multi-stage production Dockerfile for HydroNexus frontend applications
# Parameterized by ARG APP_NAME (officer-portal or citizen-portal)

FROM node:22-alpine AS builder

ARG APP_NAME=officer-portal
ENV APP_NAME=${APP_NAME}

WORKDIR /app

# Install and activate pnpm matching project version
RUN corepack enable && corepack prepare pnpm@10.34.3 --activate

# Copy workspace manifests
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages/ ./packages/
COPY apps/ ./apps/
COPY eslint.config.mjs ./

# Install dependencies and compile production assets
RUN pnpm install --frozen-lockfile || pnpm install
RUN pnpm --filter ${APP_NAME} build

# Stage 2: Lean Nginx production web server
FROM nginx:alpine AS runner

ARG APP_NAME=officer-portal

COPY --from=builder /app/apps/${APP_NAME}/dist /usr/share/nginx/html
COPY infra/docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
