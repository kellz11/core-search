"use client";

import { FormEvent, useState } from "react";
import { BN } from "@coral-xyz/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { SystemProgram } from "@solana/web3.js";
import { deriveCurvePda, deriveGlobalPda } from "@core-launchpad/sdk";
import { useLaunchpadProgram } from "@/lib/program";
import { createMintAndMetadata } from "@/lib/createMint";

const TOTAL_SUPPLY = 1_000_000_000n * 1_000_000n;
const CURVE_ALLOCATION = 793_100_000n * 1_000_000n;
const MIGRATION_ALLOCATION = TOTAL_SUPPLY - CURVE_ALLOCATION;
const INITIAL_VIRTUAL_SOL = 30n * 1_000_000_000n;
const INITIAL_VIRTUAL_TOKENS = 1_031_030_000n * 1_000_000n;

export function CreateLaunchForm() {
  const program = useLaunchpadProgram();
  const wallet = useWallet();
  const { connection } = useConnection();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResult("");
    if (!program || !wallet.publicKey) return setError("Connect a wallet first.");
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const symbol = String(form.get("symbol") ?? "").trim().toUpperCase();
    const uri = String(form.get("uri") ?? "").trim();
    if (!name || !symbol || !uri) return setError("Name, symbol, and metadata URI are required.");

    setBusy(true);
    try {
      const mint = await createMintAndMetadata({ connection, wallet, name, symbol, uri });
      const global = deriveGlobalPda(program.programId);
      const curve = deriveCurvePda(program.programId, mint);
      const tokenVault = getAssociatedTokenAddressSync(mint, curve, true);
      const signature = await program.methods
        .createLaunch(
          name,
          symbol,
          uri,
          new BN(TOTAL_SUPPLY.toString()),
          new BN(CURVE_ALLOCATION.toString()),
          new BN(MIGRATION_ALLOCATION.toString()),
          new BN(INITIAL_VIRTUAL_SOL.toString()),
          new BN(INITIAL_VIRTUAL_TOKENS.toString()),
        )
        .accounts({
          global,
          creator: wallet.publicKey,
          mint,
          curve,
          tokenVault,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      setResult(`Mint ${mint.toBase58()} created. Transaction ${signature}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="form" onSubmit={submit}>
      <label>token name<input name="name" maxLength={32} placeholder="Example Core" /></label>
      <label>symbol<input name="symbol" maxLength={10} placeholder="EXCORE" /></label>
      <label>metadata JSON URI<input name="uri" placeholder="https://arweave.net/..." /></label>
      <div className="facts">
        <span>Supply: 1,000,000,000</span>
        <span>Curve: 793,100,000</span>
        <span>Migration: 206,900,000</span>
        <span>Graduation: 100 SOL net</span>
      </div>
      <button className="button" disabled={busy}>{busy ? "creating…" : "create launch"}</button>
      {result && <p className="success">{result}</p>}
      {error && <p className="error">{error}</p>}
    </form>
  );
}
