FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare yarn@4.12.0 --activate

WORKDIR /app

COPY shared/ /app/shared/

COPY frontend/package.json frontend/yarn.lock frontend/.yarnrc.yml ./frontend/
COPY frontend/.yarn ./frontend/.yarn

WORKDIR /app/frontend
RUN yarn install --immutable

COPY frontend/ ./

ARG VITE_API_BASE_URL=http://localhost:3001
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN yarn build

FROM nginx:alpine AS production

COPY --from=builder /app/frontend/dist /usr/share/nginx/html

COPY frontend/nginx.conf /etc/nginx/templates/default.conf.template

ENV NGINX_PORT=80

EXPOSE ${NGINX_PORT}

CMD ["nginx", "-g", "daemon off;"]
