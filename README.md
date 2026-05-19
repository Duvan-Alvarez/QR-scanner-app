This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Deploy with Docker (recommended for SQLite)

This project uses a local SQLite database file by default. Serverless platforms (like Vercel) are not ideal for file-based DBs because filesystem changes are ephemeral. Use Docker on a VM or managed container service and mount a volume for persistence.

Quick steps using Docker Compose:

1. Copy `.env.example` to `.env` and adjust values if needed.

2. Build and start the service:

```bash
docker compose build
docker compose up -d
```

3. The app will be available on `http://localhost:3000`. The SQLite file is persisted under `./data/database.sqlite` on the host.

Notes:
- Make sure the production Node version in the image matches your native environment if you rely on native modules (`better-sqlite3`). The provided `Dockerfile` uses `node:20`.
- If you prefer serverless (Vercel/Netlify), migrate to a managed DB (Postgres, MySQL) and update `lib/db.js` accordingly.

## Publish Docker image from CI

The CI workflow can optionally push the built image to Docker Hub or GitHub Container Registry (GHCR) if you configure repository secrets.

Docker Hub:

- Create two repository secrets in GitHub: `DOCKER_USERNAME` and `DOCKER_PASSWORD` (your Docker Hub credentials or a robot account).
- The workflow will push the image to `DOCKER_USERNAME/qr-scanner-app:latest` when those secrets are present.

GitHub Container Registry (GHCR):

- Create a Personal Access Token (PAT) with `write:packages` and `delete:packages` scopes.
- In GitHub, add the PAT as a repository secret named `GHCR_PAT`.
- The workflow will push the image to `ghcr.io/<your-org-or-user>/qr-scanner-app:latest` when `GHCR_PAT` is present.

How to create a GHCR PAT:

1. Go to https://github.com/settings/tokens/new
2. Give it a descriptive name (e.g. `ghcr-publish`), set expiration as desired.
3. Select `write:packages` (and optionally `delete:packages`) scope.
4. Create token and copy it.

Add the token to your repo secrets:

1. Go to your repository on GitHub -> Settings -> Secrets and variables -> Actions -> New repository secret.
2. Name: `GHCR_PAT`, Value: (the token you copied).

After adding the secrets, push to `main` to trigger the CI which will build and push the image automatically.


# QR-scanner-app
