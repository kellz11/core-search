import { TokenPage } from "@/components/TokenPage";

export default async function Page({ params }: { params: Promise<{ mint: string }> }) {
  const { mint } = await params;
  return <TokenPage mintAddress={mint} />;
}
