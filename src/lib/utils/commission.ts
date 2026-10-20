/**
 * Platform Escrow Commission Fee Calculator
 * Calculates commission fee based on account value:
 * 5% of account price, bounded between KES 50 (minimum) and KES 500 (maximum).
 *
 * Examples:
 * - KES 800 account -> 5% is 40 -> clamped to min KES 50
 * - KES 2,000 account -> 5% is 100 -> KES 100
 * - KES 5,000 account -> 5% is 250 -> KES 250
 * - KES 8,000 account -> 5% is 400 -> KES 400
 * - KES 10,000+ account -> 5% is 500+ -> clamped to max KES 500
 */
export function calculateEscrowCommission(amount: number): number {
  const numericAmount = Number(amount);
  if (!numericAmount || isNaN(numericAmount) || numericAmount <= 0) return 0;
  const rawCommission = Math.round(numericAmount * 0.05);
  return Math.min(500, Math.max(50, rawCommission));
}
