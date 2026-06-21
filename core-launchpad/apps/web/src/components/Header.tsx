"use client";

import Link from "next/link";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export function Header() {
  return (
    <header className="header">
      <Link className="brand" href="/">core launchpad</Link>
      <nav>
        <Link href="/">launches</Link>
        <Link href="/create">create</Link>
        <WalletMultiButton />
      </nav>
    </header>
  );
}
