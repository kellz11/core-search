import type { Metadata } from "next";
import "@solana/wallet-adapter-react-ui/styles.css";
import "./globals.css";
import { WalletProvider } from "@/components/WalletProvider";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "core launchpad",
  description: "SOL bonding curves that graduate into CORE-paired liquidity",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <WalletProvider>
          <Header />
          <main className="shell">{children}</main>
        </WalletProvider>
      </body>
    </html>
  );
}
