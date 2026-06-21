"use client";

import { useEffect, useState } from "react";
import { BN } from "@coral-xyz/anchor";

import { LaunchCard, type Launch } from "./LaunchCard";
import { useLaunchpadProgram } from "@/lib/program";

export function LaunchList() {
  const program = useLaunchpadProgram();
  const [launches, setLaunches] = useState<Launch[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!program) return;
    let cancelled = false;
    (async () => {
      try {
        const curves = await (program.account as any).curve.all();
        if (!cancelled) {
          setLaunches(curves.map((entry: any) => ({
            mint: entry.account.mint.toBase58(),
            name: entry.account.name,
            symbol: entry.account.symbol,
            uri: entry.account.uri,
            status: entry.account.status,
            realSolReserves: BigInt((entry.account.realSolReserves as BN).toString()),
            threshold: BigInt((entry.account.migrationThresholdLamports as BN).toString()),
            migrationPool: entry.account.migrationPool.toBase58(),
          })));
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => { cancelled = true; };
  }, [program]);

  if (error) return <div className="error">{error}</div>;
  if (!launches.length) return <div className="empty">No launches yet.</div>;
  return <div className="grid">{launches.map((launch: Launch) => <LaunchCard key={launch.mint} launch={launch} />)}</div>;
}
