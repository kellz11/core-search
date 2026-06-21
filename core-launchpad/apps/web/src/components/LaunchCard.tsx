import Link from "next/link";
import { formatUnits, LAMPORTS_PER_SOL_BIGINT, shorten } from "@/lib/format";

export type Launch = {
  mint: string;
  name: string;
  symbol: string;
  uri: string;
  status: number;
  realSolReserves: bigint;
  threshold: bigint;
  migrationPool: string;
};

const states = ["trading", "migration ready", "migrating", "pool creation", "migrated"];

export function LaunchCard({ launch }: { launch: Launch }) {
  const progress = launch.threshold > 0n
    ? Math.min(100, Number((launch.realSolReserves * 10_000n) / launch.threshold) / 100)
    : 0;
  return (
    <Link className="card" href={`/token/${launch.mint}`}>
      <div className="cardTop">
        <div>
          <h3>{launch.name}</h3>
          <p>${launch.symbol} · {shorten(launch.mint)}</p>
        </div>
        <span className={`status status-${launch.status}`}>{states[launch.status] ?? "unknown"}</span>
      </div>
      <div className="progress"><span style={{ width: `${progress}%` }} /></div>
      <div className="row muted">
        <span>{formatUnits(launch.realSolReserves, LAMPORTS_PER_SOL_BIGINT, 2)} SOL</span>
        <span>{progress.toFixed(2)}%</span>
      </div>
    </Link>
  );
}
