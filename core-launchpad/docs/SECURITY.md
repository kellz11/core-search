# Security assumptions

## Audit status

This code has not received an independent smart-contract audit. Do not accept public mainnet funds before audit, fuzzing, and a full migration rehearsal.

## Migration authority

The launch-snapshotted migration authority can withdraw assets only after that launch's 100 SOL threshold and only while the curve is in the migration state. It temporarily controls the withdrawn assets while swapping and creating the pool. Compromise or misuse during that window can lose funds.

Recommended controls:

- Dedicated key with no unrelated assets.
- Secret manager or remote signer, not a plaintext `.env` on a laptop.
- Worker allowlists the exact program id and CORE mint.
- Alert on every state transition and balance movement.
- One worker instance or distributed locking.
- Replace the direct key with a reviewed multisig/transaction-policy service before high-value launches.

## External dependencies

Migration relies on Jupiter routing, a healthy CORE market, Raydium CPMM, RPC availability, and sufficient SOL for transaction/pool fees. Slippage protection prevents an arbitrary execution price but can delay migration during volatility or low liquidity.

## LP burn

LP burning is permanent. It prevents liquidity withdrawal but also prevents recovery from a mispriced pool. Verify amounts, decimals, mints, and price impact before enabling automatic mainnet migration.

## Metadata and mint controls

The bundled web flow creates immutable Metaplex metadata, requires no freeze authority, and the program revokes mint authority immediately after minting the fixed supply. Direct callers must still use the supplied program constraints; the program rejects any mint that has a freeze authority or existing supply.
