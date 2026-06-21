# Build report

Generated: 2026-06-21

## Included

- Anchor 0.31.1 launchpad program
- Next.js wallet-connected web application
- Shared TypeScript SDK and exact quote math
- Jupiter Swap API V2 migration transaction preparation/execution
- Raydium CPMM creation, LP burn, and crash recovery
- Per-curve snapshotted economics and authorities
- Dockerfiles, Docker Compose, CI, tests, deployment/security/runbook docs
- Optional `...pump` vanity mint grinder using `@nirholas/pump-sdk`

## Validation completed in this environment

- All JSON and IDL placeholder files parse successfully.
- TypeScript source passes syntax/strict diagnostics available without installed third-party modules.
- The default reserve equation was independently checked: 30 virtual SOL and 1,031,030,000 virtual tokens distribute exactly 793,100,000 sale tokens at 100 net SOL.
- Migration restart paths were reviewed for duplicate Jupiter execution, existing Raydium pool recovery, and already-burned LP recovery.

## Validation still required before mainnet

This environment did not contain Rust, Solana CLI, Anchor CLI, or downloaded npm dependencies, so `pnpm install`, `anchor build`, `anchor test`, devnet migration rehearsal, and an independent security audit must be run by the deployer. The project is source-complete but is not deployed.
