# Migration runbook

## Normal migration

The worker logs the curve, withdrawn assets, Jupiter swap signature, Raydium pool signature, LP burn signature, and final on-chain state. The same values are persisted in `services/migrator/data/migrations.json`.

## Worker stopped after withdrawal

Restart it with the same migration authority and state file. The on-chain curve remains `AssetsWithdrawn`; curve trading cannot resume. The journal contains the signed Jupiter transaction, pre-swap CORE balance, pool id, and transaction signatures so a restart can reconcile or replay the same transaction without double execution. Verify balances before any manual intervention.

## Jupiter swap failed

No pool is created. Inspect price impact and liquidity for the CORE mint. Increase slippage only after confirming the route is legitimate. Do not manually swap from another wallet because the worker expects assets at the configured authority.

## Pool creation failed

The worker retains launch tokens and CORE. Confirm Raydium pool creation fee, mint token programs, ATAs, and RPC simulation logs. Restart after correction.

## Pool created but finalization failed

Use the journaled pool id and signatures. Confirm LP was burned. Re-run the worker; it will finalize from the `AssetsWithdrawn` state using the stored pool id.

## Incident stop

Stop the worker process if a migration key may be compromised. Global authority rotation applies only to launches created after the update because each curve snapshots its migration authority. Existing curves and assets already withdrawn remain tied to the old authority and require a dedicated incident recovery plan.
