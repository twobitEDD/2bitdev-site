# 2bitDEV.com

Studio site for **2bit Entertainment** — indie games, interactive experiences, and software production.

Forked from the `cursor/2bit-entertainment-website-a215` branch of the former SERV website codebase, rebranded for [2bitDEV.com](https://2bitDEV.com) with portfolio-aligned project copy from [ed-norris-portfolio](https://github.com/twobitEDD/ed-norris-portfolio).

## Stack

- Next.js 13 (App Router)
- Chakra UI
- TypeScript
- Railway (Nixpacks via `railway.json`)

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
| `NEXT_PUBLIC_SITE_URL` | No | `https://2bitDEV.com` | Canonical URL for Open Graph metadata |
| `PORT` | No | `3000` | Set automatically by Railway |
| `NEXT_PUBLIC_SERV_RANDOM_STATUS_URL` | No | Railway SERV status endpoint | Only used by `/random/*` demo routes |
| `NEXT_PUBLIC_SERV_RANDOM_REQUESTS_URL` | No | Railway SERV requests endpoint | Only used by `/random/*` demo routes |

No secrets are required for the marketing homepage.

## Railway deployment

This project uses `railway.json`:

- **Build:** `yarn install && yarn build`
- **Start:** `yarn start`

### Connect to the existing `2bitent-site` service

1. In [Railway twobitENT project](https://railway.com/project/3b864b9d-7403-40f2-9a9a-863f393d9e70), open service **2bitent-site**.
2. **Settings → Source:** connect GitHub repo `twobitEDD/2bitdev-site`, branch `main`.
3. **Settings → Networking:** add custom domain `2bitDEV.com` (and `www.2bitDEV.com` if desired).
4. Deploy from the dashboard or push to `main`.

### CLI deploy (alternative)

```bash
railway link -p 3b864b9d-7403-40f2-9a9a-863f393d9e70 -e 2d1f98bb-ee10-449e-a8a9-81f940acbfd9 -s 8334c011-9071-46ca-bb97-7929d618d176
railway up
```

## Custom domain DNS (2bitDEV.com)

At your domain registrar, add a **CNAME** record:

| Type | Name | Value |
|------|------|-------|
| CNAME | `@` or `www` | `2bitent-site-production.up.railway.app` |

Railway will show the exact target after you add the domain in **Settings → Networking → Custom Domain**. Use the value Railway provides (it may differ slightly).

For apex/root (`@`) domains, some registrars require an **ALIAS/ANAME** record instead of CNAME — follow Railway's domain setup wizard.

## Origin repo

- **Previous Railway source:** `servprotocolorg/serv-website` @ `cursor/2bit-entertainment-website-a215` (`c8dd588`)
- **New repo:** `twobitEDD/2bitdev-site`

## Contact

**EddNorris@2bitdev.com**
