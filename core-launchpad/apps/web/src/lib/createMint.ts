import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createInitializeMintInstruction,
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  createCreateMetadataAccountV3Instruction,
  PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID,
} from "@metaplex-foundation/mpl-token-metadata";
import { Connection, Keypair, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import type { WalletContextState } from "@solana/wallet-adapter-react";

export async function createMintAndMetadata(args: {
  connection: Connection;
  wallet: WalletContextState;
  name: string;
  symbol: string;
  uri: string;
}): Promise<PublicKey> {
  if (!args.wallet.publicKey) throw new Error("Connect a wallet first.");
  const mint = Keypair.generate();
  const rent = await getMinimumBalanceForRentExemptMint(args.connection);
  const [metadata] = PublicKey.findProgramAddressSync(
    [Buffer.from("metadata"), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.publicKey.toBuffer()],
    TOKEN_METADATA_PROGRAM_ID,
  );

  const tx = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: args.wallet.publicKey,
      newAccountPubkey: mint.publicKey,
      space: MINT_SIZE,
      lamports: rent,
      programId: TOKEN_PROGRAM_ID,
    }),
    createInitializeMintInstruction(mint.publicKey, 6, args.wallet.publicKey, null),
    createCreateMetadataAccountV3Instruction(
      {
        metadata,
        mint: mint.publicKey,
        mintAuthority: args.wallet.publicKey,
        payer: args.wallet.publicKey,
        updateAuthority: args.wallet.publicKey,
      },
      {
        createMetadataAccountArgsV3: {
          data: {
            name: args.name,
            symbol: args.symbol,
            uri: args.uri,
            sellerFeeBasisPoints: 0,
            creators: [{ address: args.wallet.publicKey, verified: true, share: 100 }],
            collection: null,
            uses: null,
          },
          isMutable: false,
          collectionDetails: null,
        },
      },
    ),
  );

  const signature = await args.wallet.sendTransaction(tx, args.connection, { signers: [mint] });
  await args.connection.confirmTransaction(signature, "confirmed");
  return mint.publicKey;
}
