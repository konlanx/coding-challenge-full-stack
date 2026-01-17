FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare yarn@4.12.0 --activate

WORKDIR /app

COPY shared/ /app/shared/

COPY backend/package.json backend/yarn.lock backend/.yarnrc.yml ./backend/
COPY backend/.yarn ./backend/.yarn

WORKDIR /app/backend
RUN yarn install --immutable

COPY backend/ ./

RUN yarn db:migrations:apply

RUN yarn build

FROM node:22-alpine AS production

RUN corepack enable && corepack prepare yarn@4.12.0 --activate

WORKDIR /app

COPY --from=builder /app/shared /app/shared

COPY --from=builder /app/backend/package.json /app/backend/yarn.lock /app/backend/.yarnrc.yml ./
COPY --from=builder /app/backend/.yarn ./.yarn
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/generated ./dist/generated
COPY --from=builder /app/backend/generated ./generated
COPY --from=builder /app/backend/prisma ./prisma
COPY --from=builder /app/backend/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/backend/node_modules ./node_modules

ENV PORT=3001
ENV DATABASE_URL=""
EXPOSE ${PORT}

COPY --from=builder /app/backend/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

ENTRYPOINT ["./docker-entrypoint.sh"]
