export const LAMPORTS_PER_SOL_BIGINT = 1_000_000_000n;
export const TOKEN_SCALE = 1_000_000n;

export function formatUnits(value: bigint, scale: bigint, digits = 4): string {
  const whole = value / scale;
  const fraction = (value % scale).toString().padStart(scale.toString().length - 1, "0").slice(0, digits);
  return `${whole.toLocaleString()}${digits ? `.${fraction}` : ""}`;
}

export function parseDecimal(value: string, decimals: number): bigint {
  const [whole = "0", fraction = ""] = value.trim().split(".");
  const padded = (fraction + "0".repeat(decimals)).slice(0, decimals);
  return BigInt(whole || "0") * 10n ** BigInt(decimals) + BigInt(padded || "0");
}

export function shorten(address: string): string {
  return `${address.slice(0, 5)}…${address.slice(-5)}`;
}
