# Deployment — 2bit Entertainment site (2bitENT.com)

## Rule: GitHub push only — never `railway up` on `2bitent-site`

| Item | Value |
|------|-------|
| **Project** | `twobitENT` (`3b864b9d-7403-40f2-9a9a-863f393d9e70`) |
| **Environment** | `production` (`2d1f98bb-ee10-449e-a8a9-81f940acbfd9`) |
| **Service** | `2bitent-com` (`9803a8a5-536f-44ab-aef6-21651ed48de9`) |
| **GitHub** | `twobitEDD/2bitdev-site` → branch `main` |
| **Railway URL** | https://2bitent-com-production.up.railway.app |
| **Custom domain** | `2bitent.com` (attach in Railway dashboard → this service) |

### Legacy service — do not deploy here

**`2bitent-site`** (`8334c011-9071-46ca-bb97-7929d618d176`) is the **old** entertainment deployment:

- GitHub: `servprotocolorg/serv-website` → branch `cursor/2bit-entertainment-website-a215`
- Railway URL: https://2bitent-site-production.up.railway.app

**Never** run `railway up` or CLI deploys to `2bitent-site`. Leave it on its GitHub source only. Do not link this repo to that service.

## Standard workflow

1. Edit code in this repo (`twobitEDD/2bitdev-site`).
2. Commit and **push to `main`** on GitHub.
3. Railway auto-builds on **`2bitent-com`** (`railway.toml` / `railway.json`).
4. Verify: https://2bitent-com-production.up.railway.app (title: **2bit Entertainment**).

Do **not** use `railway up` for production deploys.

## Build config

- `railway.toml` — Nixpacks, `yarn install && yarn build`, `yarn start`
- `railway.json` — schema mirror for Railway UI

## Environment variables

Most config is in `src/config/site.ts`. Optional:

| Variable | Notes |
|----------|-------|
| `NEXT_PUBLIC_SITE_URL` | Defaults to `https://2bitENT.com` |

## Custom domain: 2bitent.com

1. Railway → **twobitENT** → **2bitent-com** → **Settings** → **Networking** → add `2bitent.com`.
2. DNS: point `2bitent.com` (and `www` if needed) per Railway’s CNAME/A instructions.
3. Verify https://2bitent.com shows **2bit Entertainment**.

## Local Railway CLI (optional)

For logs only — not deploys:

```bash
railway link --project 3b864b9d-7403-40f2-9a9a-863f393d9e70 --environment production --service 2bitent-com
railway logs
```

Unlink when done:

```bash
railway unlink -y
```
