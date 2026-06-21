# CORE Launchpad

A production-oriented Solana launchpad where each new token trades against a SOL virtual-liquidity bonding curve and graduates at **100 net SOL** into a permanent **new-token / CORE** Raydium CPMM pool.

CORE mint: `4FdojUmXeaFMBG6yUaoufAC5Bz7u9AwnSAMizkx5pump`

## What is included

- Anchor program for fixed-supply token launches, constant-product virtual reserves, buy/sell quoting, fees, and a hard migration lifecycle.
- Next.js wallet-connected launchpad UI for creating tokens, browsing launches, and trading.
- Automated migration worker that withdraws the completed curve, swaps raised SOL into CORE through Jupiter Swap API V2, creates a Raydium CPMM pool, burns the LP tokens, and records the pool on-chain.
- Recovery journal, local tests, deployment guide, security assumptions, and operational runbook.
- Optional `...pump` vanity-mint grinder powered by `@nirholas/pump-sdk` from the requested repository.

## Why this is a custom program

`@nirholas/pump-sdk` is an instruction-builder SDK for Pump's already-deployed programs. It can create and trade Pump tokens, but it cannot rewrite Pump's native graduation rule. A SOL curve that changes quote assets at graduation—SOL is swapped into CORE and the final AMM pair becomes token/CORE—requires its own on-chain curve and migration authority.

## Lifecycle

1. Creator creates a six-decimal SPL mint and Metaplex metadata.
2. `create_launch` mints the entire fixed supply into the PDA vault and permanently revokes mint authority.
3. Buyers and sellers trade against constant-product virtual reserves. The default economics mirror Pump-style proportions: 793.1M tokens on the curve and 206.9M reserved for migration.
4. At 100 net SOL, the program changes status from `Trading` to `MigrationReady`; further curve trading is rejected.
5. The migration worker:
   - marks migration begun;
   - withdraws raised SOL and all remaining launch tokens;
   - retains a configurable SOL reserve for pool-creation fees and gas;
   - swaps the rest of the SOL into CORE using Jupiter Swap API V2;
   - creates the token/CORE Raydium CPMM pool;
   - burns every LP token received;
   - finalizes the pool address and deposited amounts on-chain.

## Prerequisites

- Node.js 20+
- pnpm 9+
- Rust + Solana CLI
- Anchor CLI 0.31.1
- A funded Solana deployment wallet
- A dedicated funded migration-authority wallet
- A production RPC endpoint
- A Jupiter Developer Platform API key

## Start locally

```bash
cp .env.example .env
pnpm install
anchor keys sync
anchor build
pnpm sync-idl
anchor test
pnpm web
```

Initialize the global configuration once after deployment:

```bash
pnpm tsx scripts/initialize-config.ts
```

Then start the worker:

```bash
pnpm migrator
```

## Required production setup

Read `docs/DEPLOYMENT.md`, `docs/SECURITY.md`, and `docs/RUNBOOK.md` before mainnet. This repository is deployable code, but it is not already deployed because deployment requires your wallet signature, RPC credentials, API key, and funded migration authority.

## Important trust boundary

The curve itself is non-custodial while trading. Migration is a controlled two-stage process because Jupiter routing and Raydium pool creation happen across separate transactions. The configured migration authority temporarily holds assets between withdrawal and finalized pool creation. Put this key in a hardened signer or replace it with a controlled service/multisig flow after audit.
