/** Simulare credit auto — dobândă anuală efectivă estimativă pentru mașini rulate. */
export const DEFAULT_APR = 9.9;

export type FinanceResult = {
  financed: number;
  monthly: number;
  totalPaid: number;
  totalInterest: number;
};

export function calcFinance(
  price: number,
  downPayment: number,
  months: number,
  apr = DEFAULT_APR,
): FinanceResult {
  const financed = Math.max(price - downPayment, 0);
  const r = apr / 100 / 12;
  const monthly =
    financed === 0 ? 0 : r === 0 ? financed / months : (financed * r) / (1 - Math.pow(1 + r, -months));
  const totalPaid = monthly * months;
  return {
    financed,
    monthly,
    totalPaid,
    totalInterest: Math.max(totalPaid - financed, 0),
  };
}

export function eur(value: number): string {
  return new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}
