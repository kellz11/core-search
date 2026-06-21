"use client";

import { AnchorProvider, Idl, Program, type Wallet } from "@coral-xyz/anchor";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram, Transaction, VersionedTransaction } from "@solana/web3.js";
import { useMemo } from "react";
import idl from "@/idl/core_launchpad.json";

const readOnlyWallet: Wallet = {
  publicKey: SystemProgram.programId,
  async signTransaction<T extends Transaction | VersionedTransaction>(_tx: T): Promise<T> {
    throw new Error("Connect a wallet before sending a transaction.");
  },
  async signAllTransactions<T extends Transaction | VersionedTransaction>(_txs: T[]): Promise<T[]> {
    throw new Error("Connect a wallet before sending a transaction.");
  },
};

export function useLaunchpadProgram(): Program {
  const connectedWallet = useAnchorWallet();
  const { connection } = useConnection();
  const address = process.env.NEXT_PUBLIC_PROGRAM_ID ?? (idl as { address: string }).address;
  return useMemo(() => {
    const provider = new AnchorProvider(connection, connectedWallet ?? readOnlyWallet, { commitment: "confirmed" });
    return new Program({ ...(idl as Idl), address }, provider);
  }, [address, connectedWallet, connection]);
}

export function programId(): PublicKey {
  return new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID ?? (idl as { address: string }).address);
}
