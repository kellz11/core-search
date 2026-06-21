import Link from "next/link";
import { LaunchList } from "@/components/LaunchList";

export default function Home() {
  return (
    <>
      <section className="hero">
        <p className="eyebrow">SOL in. CORE out.</p>
        <h1>Every launch graduates into CORE.</h1>
        <p>Tokens trade against a SOL bonding curve. At 100 SOL, the curve locks, converts the raised SOL into CORE, and opens a permanent token/CORE Raydium pool.</p>
        <Link className="button" href="/create">create a launch</Link>
      </section>
      <section>
        <div className="sectionTitle"><h2>live launches</h2><span>100 SOL graduation</span></div>
        <LaunchList />
      </section>
    </>
  );
}
