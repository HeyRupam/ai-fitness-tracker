FROM oven/bun:1 AS build
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Build-time env vars baked into the JS bundle by Vite
ARG VITE_API_URL=/api
ARG VITE_KEYCLOAK_URL=http://localhost:8181
ARG VITE_KEYCLOAK_REALM=fitness-oauth2
ARG VITE_KEYCLOAK_CLIENT_ID=oauth2-pkce-client
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_KEYCLOAK_URL=$VITE_KEYCLOAK_URL
ENV VITE_KEYCLOAK_REALM=$VITE_KEYCLOAK_REALM
ENV VITE_KEYCLOAK_CLIENT_ID=$VITE_KEYCLOAK_CLIENT_ID

COPY . .
RUN bun run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
