# Architecture

## On-chain program

The program owns a `Curve` PDA for each mint. SOL sits directly in that account; launch tokens sit in its associated token account. Pricing uses `x*y=k` over virtual reserves while separately tracking real reserves.

Buy price:

```text
fee = gross SOL * fee_bps / 10,000
net SOL = gross SOL - fee
k = virtual_sol * virtual_tokens
new_virtual_tokens = ceil(k / (virtual_sol + net SOL))
tokens_out = virtual_tokens - new_virtual_tokens
```

Sell price is the inverse operation, with fees taken from the gross SOL output. Ceil division prevents the curve from over-distributing value due to integer truncation.

## Supply defaults

- Total: 1,000,000,000 tokens, six decimals
- Curve allocation: 793,100,000
- Migration allocation: 206,900,000
- Initial virtual SOL: 30 SOL
- Initial virtual tokens: 1,031,030,000
- Graduation: 100 net SOL in real reserves

These are form defaults; the program supports configurable launch economics subject to safety checks. Migration threshold, fee rate, fee receiver, and migration authority are snapshotted into each curve at creation, so later global configuration changes cannot alter an active launch.

## Migration state machine

```text
Trading -> MigrationReady -> Migrating -> AssetsWithdrawn -> Migrated
```

No sell or buy can execute after `MigrationReady`. Only the configured migration authority can advance migration. `withdraw_migration_assets` records exact withdrawn amounts before zeroing curve reserves. `finalize_migration` records the Raydium pool and deposited CORE/token amounts.

## Off-chain worker

The worker journals each external phase before submission. Jupiter's exact signed transaction and signature are persisted before broadcast; a restart reconciles the dedicated wallet balance or replays the same signature, which Solana cannot execute twice. Raydium's deterministic pool id is recorded before creation, and an existing pool is recovered before LP burning/finalization. The secret key is never sent to the browser.

## LP policy

The Raydium CPMM position is made permanent by burning the complete LP token balance immediately after pool creation. This is irreversible. A later version can integrate Raydium Burn & Earn if ongoing LP fee rights are desired.
