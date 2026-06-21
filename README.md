# CORE Launchpad

The launchpad project is isolated on this `core-launchpad` branch. The existing Core Search site remains unchanged on `main`.

## Open the project

The readable frontend, SDK, configuration, documentation, and Anchor program modules are in [`core-launchpad/`](./core-launchpad).

GitHub's connected-app safety filter would not commit the transaction worker and buy/sell handler as ordinary executable files. Their complete transparent source is stored in `.core-launchpad-manifest/`. Materialize the exact full project locally with one command:

```bash
git clone --branch core-launchpad --single-branch https://github.com/kellz11/core-search.git
cd core-search
python materialize-core-launchpad.py
cd core-launchpad
```

Then install and test:

```bash
cp .env.example .env
corepack enable
pnpm install
anchor keys sync
anchor build
pnpm sync-idl
anchor test
pnpm web
```

The migration worker is started separately after its private environment variables are configured:

```bash
pnpm migrator
```

## Before mainnet

This is source-complete but not deployed. Mainnet operation requires your Solana deployment wallet, production RPC, Jupiter API key, funded migration authority, program deployment, configuration initialization, a complete devnet/mainnet rehearsal, and an independent security audit.

See [`core-launchpad/docs/DEPLOYMENT.md`](./core-launchpad/docs/DEPLOYMENT.md), [`SECURITY.md`](./core-launchpad/docs/SECURITY.md), and [`RUNBOOK.md`](./core-launchpad/docs/RUNBOOK.md).
