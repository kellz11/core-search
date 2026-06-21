"use client";

import { useCallback, useEffect, useState } from "react";
import { BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { deriveCurvePda } from "@core-launchpad/sdk";
import { useLaunchpadProgram } from "@/lib/program";
import { formatUnits, LAMPORTS_PER_SOL_BIGINT, shorten, TOKEN_SCALE } from "@/lib/format";
import { TradePanel } from "./TradePanel";

export function TokenPage({ mintAddress }: { mintAddress: string }) {
  const program = useLaunchpadProgram();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!program) return;
    try {
      const mint = new PublicKey(mintAddress);
      const curve = await (program.account as any).curve.fetch(deriveCurvePda(program.programId, mint));
      setData({ curve });
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
  }, [program, mintAddress]);

  useEffect(() => { load(); }, [load]);
  if (error) return <div className="error">{error}</div>;
  if (!data) return <div className="empty">Loading…</div>;

  const c = data.curve;
  const raised = BigInt((c.realSolReserves as BN).toString());
  const threshold = BigInt((c.migrationThresholdLamports as BN).toString());
  const progress = Math.min(100, Number(raised * 10_000n / threshold) / 100);
  return (
    <div className="tokenLayout">
      <section>
        <p className="eyebrow">${c.symbol}</p>
        <h1>{c.name}</h1>
        <p className="muted mono">{mintAddress}</p>
        <div className="progress large"><span style={{ width: `${progress}%` }} /></div>
        <div className="row"><strong>{formatUnits(raised, LAMPORTS_PER_SOL_BIGINT, 3)} SOL</strong><span>{progress.toFixed(2)}% to CORE migration</span></div>
        <div className="stats">
          <div><span>curve tokens</span><strong>{formatUnits(BigInt(c.realTokenReserves.toString()), TOKEN_SCALE, 0)}</strong></div>
          <div><span>status</span><strong>{["trading", "ready", "migrating", "pooling", "migrated"][c.status]}</strong></div>
          <div><span>creator</span><strong>{shorten(c.creator.toBase58())}</strong></div>
          <div><span>pool</span><strong>{c.status === 4 ? shorten(c.migrationPool.toBase58()) : "pending"}</strong></div>
        </div>
      </section>
      <TradePanel
        mint={mintAddress}
        feeReceiver={c.feeReceiver.toBase58()}
        feeBps={c.feeBps}
        virtualSol={BigInt(c.virtualSolReserves.toString())}
        virtualTokens={BigInt(c.virtualTokenReserves.toString())}
        realSol={raised}
        migrationThreshold={threshold}
        status={c.status}
        onComplete={load}
      />
    </div>
  );
}
