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

This project uses `railway.toml`:

- **Build:** `yarn install && yarn build`
- **Start:** `yarn start`

### Service: `2bitent-site` (twobitENT project)

1. In [Railway twobitENT project](https://railway.com/project/3b864b9d-7403-40f2-9a9a-863f393d9e70), open service **2bitent-site**.
2. **Settings → Source:** connect GitHub repo `twobitEDD/2bitdev-site`, branch `main`.
3. **Settings → Networking:** custom domain **2bitENT.com** (and `www.2bitENT.com` if desired).
4. Deploy from the dashboard or push to `main`.

### CLI deploy (alternative)

```bash
railway link -p 3b864b9d-7403-40f2-9a9a-863f393d9e70 -e production -s 2bitent-site
railway up
```

## Custom domain DNS (2bitENT.com)

At your domain registrar (or Cloudflare), add a **CNAME** record:

| Type | Name | Value |
|------|------|-------|
| CNAME | `@` or `www` | `2bitent-site-production.up.railway.app` |

Railway will show the exact target after you add the domain in **Settings → Networking → Custom Domain**. Use the value Railway provides (it may differ slightly).

For apex/root (`@`) domains, some registrars require an **ALIAS/ANAME** record instead of CNAME — follow Railway's domain setup wizard.

## Origin repo

- **Previous Railway source:** `servprotocolorg/serv-website` @ `cursor/2bit-entertainment-website-a215` (`c8dd588`)
- **This repo:** `twobitEDD/2bitdev-site` (entertainment studio site for 2bitENT.com)

## Contact

**hello@2bitentertainment.com**
