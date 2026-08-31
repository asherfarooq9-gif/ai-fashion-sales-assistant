# ---- build ----
FROM node:20-slim AS build
WORKDIR /app
ARG VITE_API_URL=http://localhost:5000
ENV VITE_API_URL=$VITE_API_URL
COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/eval/package.json packages/eval/package.json
RUN npm ci
COPY packages/shared ./packages/shared
COPY apps/web ./apps/web
RUN npm run build --workspace @afsa/web

# ---- serve ----
FROM nginx:1.27-alpine
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80
