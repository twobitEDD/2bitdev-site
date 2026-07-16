# Deploy — 2bit Entertainment studio site (2bitENT.com)

Marketing site for **2bit Entertainment** — indie games, interactive experiences, and software production.

> Not the Edd Norris personal portfolio (that is [2bitDEV.com](https://2bitdev.com) via `ed-norris-portfolio`).

## Standard workflow (required)

**Always deploy via GitHub → Railway.** Do **not** use `railway up` CLI uploads.

1. Push to `main` on `twobitEDD/2bitdev-site`
2. Railway auto-builds and deploys from the connected service
3. Verify at the Railway URL or custom domain

This lets any machine or agent contribute by pushing git commits — no local Railway CLI deploy needed.

## Railway service

| Field | Value |
|-------|-------|
| Project | [twobitENT](https://railway.com/project/3b864b9d-7403-40f2-9a9a-863f393d9e70) |
| Service | **2bitent-com** |
| Service ID | `9803a8a5-536f-44ab-aef6-21651ed48de9` |
| GitHub | `twobitEDD/2bitdev-site` → branch `main` |
| Build | Nixpacks via `railway.toml` — `yarn install && yarn build` |
| Start | `yarn start` |
| Railway URL | https://2bitent-com-production.up.railway.app |
| Custom domain | **2bitent.com** (see DNS below) |

### Do not use

- **2bitent-site** (`8334c011-9071-46ca-bb97-7929d618d176`) — legacy service still on old `serv-website` source; do not CLI-deploy or reconfigure

### Optional repo rename

The GitHub repo is named `2bitdev-site` for historical reasons. Consider renaming to `twobitEDD/2bitent-site` in GitHub settings, then update the Railway source connection. Site branding is already **2bit Entertainment** / **2bitENT**.

## Environment variables

Set in Railway → **2bitent-com** → Variables.

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `NEXT_PUBLIC_SITE_URL` | No | `https://2bitENT.com` | Canonical URL for Open Graph metadata |
| `PORT` | No | `3000` | Set automatically by Railway |
| `NEXT_PUBLIC_SERV_RANDOM_STATUS_URL` | No | SERV status endpoint | `/random/*` demo routes only |
| `NEXT_PUBLIC_SERV_RANDOM_REQUESTS_URL` | No | SERV requests endpoint | `/random/*` demo routes only |

No secrets are required for the marketing homepage.

## Custom domain — 2bitent.com

1. In Railway → **2bitent-com** → **Settings → Networking → Custom Domain**, add `2bitent.com` (and `www.2bitent.com` if desired).
2. At your DNS provider:

| Type | Name | Value |
|------|------|-------|
| CNAME | `www` | `2bitent-com-production.up.railway.app` |

For apex/root (`@`), use Railway's domain wizard (ALIAS/ANAME if CNAME is not supported).

3. **Migration note:** `2bitent.com` may still be attached to the legacy **2bitent-site** service. Remove it from that service only after the new domain is verified on **2bitent-com** (user confirmation recommended).

## Local development

```bash
yarn install
yarn dev
```

## Connect GitHub (one-time / new service)

```bash
railway link -p 3b864b9d-7403-40f2-9a9a-863f393d9e70 -e production -s 2bitent-com
railway service source connect --repo twobitEDD/2bitdev-site --branch main --service 2bitent-com
```

Do **not** run `railway up` for production deploys.
