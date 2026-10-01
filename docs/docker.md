# Running with Docker

The repo ships a multi-stage `Dockerfile` for the Next.js app and a
`docker-compose.yml` with a single frontend service. The Express API and
MongoDB connection are configured separately through `backend/.env`.

## Quick start

1. Copy the env templates and fill them in:

   ```bash
   cp .env.local.example .env.local
   cp backend/.env.example backend/.env
   ```

2. Build and start:

   ```bash
   docker compose --env-file .env.local up --build -d
   ```

3. The app is served on <http://localhost:3000>.

Use `HOST_PORT`, not `PORT`, to move the published port.

## Build-time vs runtime variables

- `NEXT_PUBLIC_*` variables are inlined into the client bundle at build
  time. If you change any of them, rebuild.
- Server-only secrets such as `ENCRYPTION_KEY`, `META_APP_SECRET`, and
  the backend `MONGODB_URI` should stay in env files and never be baked
  into the image.

## Plain Docker

```bash
docker build \
  --build-arg NEXT_PUBLIC_API_URL=http://localhost:5000 \
  -t wacrm .

docker run -d --env-file .env.local -e PORT=3000 -p 3000:3000 wacrm
```
