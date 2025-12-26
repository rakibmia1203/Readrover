export function formatBDT(amount: number) {
  return new Intl.NumberFormat("bn-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

export const ORDER_STATUSES = ["PENDING","CONFIRMED","SHIPPED","DELIVERED","CANCELLED"] as const;
export type OrderStatus = typeof ORDER_STATUSES[number];

export function clamp(n: number, min: number, max: number) { return Math.max(min, Math.min(max, n)); }

