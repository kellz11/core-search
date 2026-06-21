# Deployment

## 1. Install toolchain

Install Solana CLI, Rust, Anchor 0.31.1, Node 20+, and pnpm. Use a dedicated deployer wallet and production RPC.

## 2. Generate and synchronize the program id

```bash
solana-keygen new -o target/deploy/core_launchpad-keypair.json
anchor keys sync
```

`anchor keys sync` updates `declare_id!` and `Anchor.toml`. Commit the public program id changes, never the keypair file.

## 3. Build and test

```bash
pnpm install
anchor build
pnpm sync-idl
anchor test
```

Run a devnet rehearsal. Jupiter/Raydium production liquidity for the supplied CORE mint is mainnet-only, so use mock tokens and a devnet pool for full migration rehearsals.

## 4. Deploy

```bash
anchor deploy --provider.cluster mainnet
```

Copy the resulting program id into `PROGRAM_ID` and `NEXT_PUBLIC_PROGRAM_ID`.

## 5. Configure

Create a migration wallet and fund it for transaction fees and Raydium's pool-creation fee. Set the migration wallet public key, fee receiver, CORE mint, 100 SOL threshold, and platform fee through `scripts/initialize-config.ts`.

## 6. Deploy web and worker

- Web: Vercel, Cloudflare, or any Node host. Only public RPC and program values belong in browser variables.
- Worker: a persistent private service such as Fly.io, Railway, AWS ECS, or a hardened VM. Add `MIGRATION_AUTHORITY_SECRET` and `JUPITER_API_KEY` only there.
- Run exactly one active worker unless you add a distributed lock.

## 7. Mainnet acceptance test

Before opening public launches:

1. Create a low-threshold temporary program/config on devnet or a separate mainnet test deployment.
2. Verify buys, sells, slippage, threshold lock, worker recovery, CORE receipt, pool creation, LP burn, and finalization.
3. Confirm the pool has the exact expected mint pair and both vault balances.
4. Confirm the LP ATA balance is zero and total LP supply reflects the burn.
5. Rotate the migration key into the production signer.
