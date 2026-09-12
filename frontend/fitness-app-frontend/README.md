# AI Fitness Tracker — Frontend

React 19 + Vite SPA for the AI Fitness Tracker. See the [root README](../../README.md) for the full architecture and setup.

## Scripts

```bash
bun install        # install dependencies
bun run dev        # start dev server on http://localhost:5173
bun run lint       # run ESLint
bun run build      # production build into dist/
```

## Configuration

Vite reads these at build time (create a `.env.local` for local development):

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8095/api` | Gateway base URL (`/api` in Docker, proxied by nginx) |
| `VITE_KEYCLOAK_URL` | `http://localhost:8181` | Keycloak base URL as seen by the browser |
| `VITE_KEYCLOAK_REALM` | `fitness-oauth2` | Keycloak realm |
| `VITE_KEYCLOAK_CLIENT_ID` | `oauth2-pkce-client` | Public PKCE client ID |
| `VITE_REDIRECT_URI` | `window.location.origin` | OAuth2 redirect URI |
