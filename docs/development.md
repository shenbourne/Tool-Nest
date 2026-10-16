# Local development

From the repository root, install the locked dependencies and build shared contracts before starting the API:

```powershell
pnpm install --frozen-lockfile
pnpm --filter @toolnest/shared build
pnpm dev
```

The frontend defaults to port3000 and forwards `/api` to `http://localhost:3001`. To use an API at a different address, set the environment variable in the shell that starts Vite:

```powershell
$env:VITE_API_TARGET = 'http://127.0.0.1:3355'
pnpm dev:web
```

In a POSIX shell:

```sh
VITE_API_TARGET=http://127.0.0.1:3355 pnpm dev:web
```

An unset or empty value keeps the default. Restart Vite after changing the variable. This configuration reads the process environment; a `.env` file alone is not loaded into this configuration by `loadEnv`. Production uses the same Node origin for the SPA and `/api` and does not use the Vite development proxy. For container deployment see [docker.md](docker.md).
