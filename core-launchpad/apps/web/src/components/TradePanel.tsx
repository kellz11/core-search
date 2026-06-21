"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { BN } from "@coral-xyz/anchor";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { buyTokens, calculateFee, quoteCappedBuy, quoteSell, sellTokens } from "@core-launchpad/sdk";
import { parseDecimal, TOKEN_SCALE } from "@/lib/format";
import { useLaunchpadProgram } from "@/lib/program";

type Props = {
  mint: string;
  feeReceiver: string;
  feeBps: number;
  virtualSol: bigint;
  virtualTokens: bigint;
  realSol: bigint;
  migrationThreshold: bigint;
  status: number;
  onComplete: () => void;
};

export function TradePanel(props: Props) {
  const program = useLaunchpadProgram();
  const wallet = useWallet();
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const quote = useMemo(() => {
    try {
      if (!amount) return 0n;
      if (side === "buy") {
        return quoteCappedBuy({
          grossSolIn: parseDecimal(amount, 9),
          feeBps: props.feeBps,
          virtualSol: props.virtualSol,
          virtualTokens: props.virtualTokens,
          realSol: props.realSol,
          migrationThreshold: props.migrationThreshold,
        }).tokensOut;
      }
      const gross = quoteSell(props.virtualSol, props.virtualTokens, parseDecimal(amount, 6));
      return gross - calculateFee(gross, props.feeBps);
    } catch { return 0n; }
  }, [amount, side, props]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!program || !wallet.publicKey) return setMessage("Connect a wallet first.");
    if (props.status !== 0) return setMessage("Bonding-curve trading is closed.");
    setBusy(true);
    setMessage("");
    try {
      const mint = new PublicKey(props.mint);
      const feeReceiver = new PublicKey(props.feeReceiver);
      const slippageFloor = quote * 95n / 100n;
      const signature = side === "buy"
        ? await buyTokens({
            program,
            mint,
            buyer: wallet.publicKey,
            feeReceiver,
            solAmount: parseDecimal(amount, 9),
            minimumTokensOut: slippageFloor,
          })
        : await sellTokens({
            program,
            mint,
            seller: wallet.publicKey,
            feeReceiver,
            tokenAmount: parseDecimal(amount, 6),
            minimumSolOut: slippageFloor,
          });
      setMessage(`Confirmed: ${signature}`);
      setAmount("");
      props.onComplete();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : String(e));
    } finally { setBusy(false); }
  }

  return (
    <div className="tradePanel">
      <div className="tabs">
        <button className={side === "buy" ? "active" : ""} onClick={() => setSide("buy")}>buy</button>
        <button className={side === "sell" ? "active" : ""} onClick={() => setSide("sell")}>sell</button>
      </div>
      <form onSubmit={submit}>
        <label>{side === "buy" ? "SOL" : "tokens"}<input value={amount} onChange={(e: ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)} inputMode="decimal" placeholder="0.0" /></label>
        <p className="muted">Estimated output: {side === "buy" ? Number(quote / TOKEN_SCALE).toLocaleString() + " tokens" : Number(quote) / 1e9 + " SOL"}</p>
        <button className="button" disabled={busy || props.status !== 0}>{busy ? "confirming…" : side}</button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
}
