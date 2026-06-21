import { AnchorProvider, BN, Idl, Program } from "@coral-xyz/anchor";
import { getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import idl from "./idl/core_launchpad.json" with { type: "json" };

export const CORE_MINT = new PublicKey("4FdojUmXeaFMBG6yUaoufAC5Bz7u9AwnSAMizkx5pump");
export const STATUS = {
  TRADING: 0,
  MIGRATION_READY: 1,
  MIGRATING: 2,
  ASSETS_WITHDRAWN: 3,
  MIGRATED: 4,
} as const;

export type CurveAccount = {
  creator: PublicKey;
  mint: PublicKey;
  tokenVault: PublicKey;
  name: string;
  symbol: string;
  uri: string;
  totalSupply: BN;
  curveTokenAllocation: BN;
  migrationTokenAllocation: BN;
  migrationAuthority: PublicKey;
  feeReceiver: PublicKey;
  migrationThresholdLamports: BN;
  feeBps: number;
  virtualSolReserves: BN;
  virtualTokenReserves: BN;
  realSolReserves: BN;
  realTokenReserves: BN;
  migrationTokenReserves: BN;
  withdrawnSolAmount: BN;
  withdrawnTokenAmount: BN;
  migratedCoreAmount: BN;
  migratedTokenAmount: BN;
  status: number;
  migrationPool: PublicKey;
  createdAt: BN;
  bump: number;
};

export function getProgram(provider: AnchorProvider, programId?: PublicKey): Program {
  const resolved = programId ?? new PublicKey((idl as { address: string }).address);
  return new Program({ ...(idl as Idl), address: resolved.toBase58() }, provider);
}

export function deriveGlobalPda(programId: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync([Buffer.from("global")], programId)[0];
}

export function deriveCurvePda(programId: PublicKey, mint: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync([Buffer.from("curve"), mint.toBuffer()], programId)[0];
}

export function quoteBuy(virtualSol: bigint, virtualTokens: bigint, netSolIn: bigint): bigint {
  const k = virtualSol * virtualTokens;
  const newVirtualSol = virtualSol + netSolIn;
  const newVirtualTokens = ceilDiv(k, newVirtualSol);
  return virtualTokens - newVirtualTokens;
}

export function quoteSell(virtualSol: bigint, virtualTokens: bigint, tokenIn: bigint): bigint {
  const k = virtualSol * virtualTokens;
  const newVirtualTokens = virtualTokens + tokenIn;
  const newVirtualSol = ceilDiv(k, newVirtualTokens);
  return virtualSol - newVirtualSol;
}

export function calculateFee(amount: bigint, feeBps: number): bigint {
  return (amount * BigInt(feeBps)) / 10_000n;
}

export function quoteCappedBuy(args: {
  grossSolIn: bigint;
  feeBps: number;
  virtualSol: bigint;
  virtualTokens: bigint;
  realSol: bigint;
  migrationThreshold: bigint;
}): { grossAccepted: bigint; fee: bigint; netSol: bigint; tokensOut: bigint } {
  if (args.grossSolIn <= 0n) return { grossAccepted: 0n, fee: 0n, netSol: 0n, tokensOut: 0n };
  const remaining = args.migrationThreshold - args.realSol;
  if (remaining <= 0n) return { grossAccepted: 0n, fee: 0n, netSol: 0n, tokensOut: 0n };
  const quotedFee = calculateFee(args.grossSolIn, args.feeBps);
  const quotedNet = args.grossSolIn - quotedFee;
  let grossAccepted = args.grossSolIn;
  let fee = quotedFee;
  let netSol = quotedNet;
  if (quotedNet > remaining) {
    grossAccepted = ceilDiv(remaining * 10_000n, 10_000n - BigInt(args.feeBps));
    fee = grossAccepted - remaining;
    netSol = remaining;
  }
  return {
    grossAccepted,
    fee,
    netSol,
    tokensOut: quoteBuy(args.virtualSol, args.virtualTokens, netSol),
  };
}

function ceilDiv(a: bigint, b: bigint): bigint {
  if (b <= 0n) throw new Error("division by zero");
  return (a + b - 1n) / b;
}

export async function buyTokens(args: {
  program: Program;
  mint: PublicKey;
  buyer: PublicKey;
  feeReceiver: PublicKey;
  solAmount: bigint;
  minimumTokensOut: bigint;
}): Promise<string> {
  const programId = args.program.programId;
  const curve = deriveCurvePda(programId, args.mint);
  const global = deriveGlobalPda(programId);
  const tokenVault = getAssociatedTokenAddressSync(args.mint, curve, true);
  const buyerTokenAccount = getAssociatedTokenAddressSync(args.mint, args.buyer);
  return args.program.methods
    .buy(new BN(args.solAmount.toString()), new BN(args.minimumTokensOut.toString()))
    .accounts({
      global,
      curve,
      mint: args.mint,
      tokenVault,
      buyer: args.buyer,
      buyerTokenAccount,
      feeReceiver: args.feeReceiver,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
}

export async function sellTokens(args: {
  program: Program;
  mint: PublicKey;
  seller: PublicKey;
  feeReceiver: PublicKey;
  tokenAmount: bigint;
  minimumSolOut: bigint;
}): Promise<string> {
  const programId = args.program.programId;
  const curve = deriveCurvePda(programId, args.mint);
  const global = deriveGlobalPda(programId);
  const tokenVault = getAssociatedTokenAddressSync(args.mint, curve, true);
  const sellerTokenAccount = getAssociatedTokenAddressSync(args.mint, args.seller);
  return args.program.methods
    .sell(new BN(args.tokenAmount.toString()), new BN(args.minimumSolOut.toString()))
    .accounts({
      global,
      curve,
      mint: args.mint,
      tokenVault,
      seller: args.seller,
      sellerTokenAccount,
      feeReceiver: args.feeReceiver,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .rpc();
}
