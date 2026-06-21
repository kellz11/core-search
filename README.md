# CORE Launchpad

This is the clean working branch for the CORE launchpad. The existing Core Search website remains untouched on `main`.

## Open it

[Open this branch in GitHub](https://github.com/kellz11/core-search/tree/core-app)

[Open it in GitHub Codespaces](https://codespaces.new/kellz11/core-search?ref=core-app)

The launchpad project is inside [`core-launchpad/`](./core-launchpad). Codespaces automatically reconstructs the complete source and installs the Node dependencies.

## Run locally

```bash
git clone --branch core-app --single-branch https://github.com/kellz11/core-search.git
cd core-search
python materialize-core-launchpad.py
cd core-launchpad
cp .env.example .env
corepack enable
pnpm install
anchor keys sync
anchor build
pnpm sync-idl
anchor test
pnpm web
```

Start the private migration worker after configuring its RPC, migration wallet, and Jupiter API credentials:

```bash
pnpm migrator
```

## Included

- Wallet-connected Next.js frontend
- Anchor bonding curve program
- Fixed one-billion-token launch supply
- 100 net SOL graduation threshold
- SOL-to-CORE conversion through Jupiter
- New-token/CORE Raydium CPMM pool creation
- LP-token burn and recovery journal
- Tests, Docker configuration, deployment guide, security notes, and migration runbook

## Before mainnet

The source is prepared but not deployed. Mainnet operation still requires your Solana deployment wallet, RPC credentials, Jupiter API key, funded migration authority, program deployment, configuration initialization, full rehearsal, and an independent security audit.

Read [`DEPLOYMENT.md`](./core-launchpad/docs/DEPLOYMENT.md), [`SECURITY.md`](./core-launchpad/docs/SECURITY.md), and [`RUNBOOK.md`](./core-launchpad/docs/RUNBOOK.md).
