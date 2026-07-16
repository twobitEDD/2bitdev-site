# 2bitENT.com

Studio site for **2bit Entertainment** — indie games, interactive experiences, and software production.

Forked from the `cursor/2bit-entertainment-website-a215` branch of the former SERV website codebase, with portfolio-aligned project copy from [ed-norris-portfolio](https://github.com/twobitEDD/ed-norris-portfolio).

> **Not** the Edd Norris personal portfolio — that lives at [2bitDEV.com](https://2bitDEV.com) (`ed-norris-portfolio` / `apps/personal`).

## Stack

- Next.js 13 (App Router)
- Chakra UI
- TypeScript
- Railway (Nixpacks via `railway.toml`)

## Local development

```bash
yarn install
yarn dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build & validate

```bash
yarn install
yarn typecheck
yarn lint
yarn build
yarn start
```

## Environment variables

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `NEXT_PUBLIC_SITE_URL` | No | `https://2bitENT.com` | Canonical URL for Open Graph metadata |
| `PORT` | No | `3000` | Set automatically by Railway |
| `NEXT_PUBLIC_SERV_RANDOM_STATUS_URL` | No | Railway SERV status endpoint | Only used by `/random/*` demo routes |
| `NEXT_PUBLIC_SERV_RANDOM_REQUESTS_URL` | No | Railway SERV requests endpoint | Only used by `/random/*` demo routes |

No secrets are required for the marketing homepage.

## Railway deployment

**Always deploy via GitHub push → Railway.** See **[DEPLOY.md](./DEPLOY.md)** for the full workflow.

| Field | Value |
|-------|-------|
| Service | **2bitent-com** (not legacy `2bitent-site`) |
| GitHub | `twobitEDD/2bitdev-site` → `main` |
| Railway URL | https://2bitent-com-production.up.railway.app |
| Custom domain | **2bitent.com** |

Build/start commands are in `railway.toml`:

- **Build:** `yarn install && yarn build`
- **Start:** `yarn start`

Do **not** use `railway up` for production deploys.

## Origin repo

- **Previous Railway source:** `servprotocolorg/serv-website` @ `cursor/2bit-entertainment-website-a215` (`c8dd588`)
- **This repo:** `twobitEDD/2bitdev-site` (entertainment studio site for 2bitENT.com)

## Contact

**hello@2bitentertainment.com**
