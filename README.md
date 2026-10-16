# ToolNest

A bilingual developer toolbox with a Vue frontend and Node.js API, packaged in one Docker image.

## Run with Docker

```sh
docker compose up -d
```

Open http://localhost:8080. The default image is `shenbourne/tool-nest:latest`; set `IMAGE_TAG=0.1.0` to pin a version. Data is kept in the `toolnest-data` volume.

See [Docker deployment and version releases](docs/docker.md) for configuration, local builds, and GitHub Actions setup. Published images support Linux amd64 and arm64.

Root `package.json` controls releases. Stable versions publish the version and `latest`; prereleases publish only their version. Each successfully published version has a corresponding `v<version>` Git tag.

Licensed under [GPL-3.0](LICENSE). See [third-party notices](THIRD_PARTY_NOTICES.md).
