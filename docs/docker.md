# Docker deployment and releases

## Run the published image

```sh
docker compose up -d
```

Compose pulls `shenbourne/tool-nest:latest`, exposes `http://localhost:8080` on loopback, and retains the `toolnest-data` volume at `/app/data`. To pin a release, set `IMAGE_TAG=0.1.0` in your shell or `.env` before running Compose. Update with `docker compose pull && docker compose up -d`. Do not use `down -v` unless you intend to delete stored data.

Set `PORT` and `CORS_ORIGIN` together when changing the published port/origin. Do not expose write APIs directly to the public internet. Host bind mounts must be writable by UID/GID1000; the image runs as user `node`. Supply `SECRET_KEY` at runtime if required.

## GitHub Actions to Docker Hub

Configure repository Actions Secrets:

- `DOCKERHUB_USERNAME`: Docker Hub user with write access to `shenbourne/tool-nest`.
- `DOCKERHUB_TOKEN`: Docker Hub access token with write permission. Never commit it.

On `main` push, CI runs release-policy tests, nonmutating lint, type checks, application tests and build. Successful checks permit the release job:

1. Read root `package.json` version. A version change publishes automatically; a version without a Git tag also publishes for the initial release/retry. Unchanged already-tagged versions skip publication.
2. Build and push `linux/amd64` and `linux/arm64` to `shenbourne/tool-nest:<version>`.
3. Stable versions also update `latest`. Prereleases such as `1.3.0-beta.1` only update their version tag.
4. Inspect the remote manifest for both platforms, then create Git tag `v<version>` at the released commit. Tags are never moved. An automatic version change cannot reuse a historical tag.

Version must be SemVer without `+build` metadata (Docker tags do not allow `+`), at most128 characters. First version is `0.1.0` with Git tag `v0.1.0`.

To rebuild manually, open **Actions -> CI and Docker release -> Run workflow**, choose branch `main`, and optionally supply a commit SHA or Git tag in `main` history. Blank uses the current main commit. The selected source must pass all checks. This republishes its declared version, also updating `latest` for a stable version; rebuilding an older stable version therefore deliberately rolls latest back. Existing Git version tags retain their original release commit; OCI image revision labels identify the rebuilt source. No application data is included in images.

If secrets are missing or invalid, release fails with a visible error; configure them and rerun the failed job or use manual dispatch. A failed push never counts as a successful release.

## Build locally

```sh
docker build -t toolnest:local .
docker run -d --name toolnest -p 127.0.0.1:8080:3000 -e CORS_ORIGIN=http://localhost:8080 -v toolnest-data:/app/data toolnest:local
docker inspect --format '{{.State.Health.Status}}' toolnest
```

If your Docker Hub mirror refuses the official Node image, build with `--build-arg NODE_IMAGE=public.ecr.aws/docker/library/node:22-alpine`.

The runtime contains compiled server/shared code, production API dependencies, static frontend, GPL license and third-party notices. The context excludes host data, worktrees, credentials and build artifacts. Save/load an image for offline transfer with `docker save -o toolnest.tar toolnest:local` and `docker load -i toolnest.tar`.
