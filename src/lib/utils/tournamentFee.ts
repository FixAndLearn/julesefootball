/**
 * Calculates fair, proportional platform fee for hosting tournaments & 1v1 duels.
 * 
 * Rules based on eFootballMarket Kenya policy:
 * - Free tournaments (pot = 0): KES 0
 * - Pot <= KES 100: KES 15 (e.g. 100 bob pot -> KES 15, within user's 10-20 bob target)
 * - Pot <= KES 250: KES 20
 * - Pot <= KES 500: KES 35
 * - Pot <= KES 1,000: KES 60 (exactly in user's 50 to 70 bob target)
 * - Pot <= KES 2,500: KES 100 (5% of 2,000 bob pot)
 * - Pot > KES 2,500: 5% flat of total pot
 */
export function calculateTournamentFee(totalPot: number): number {
  if (totalPot <= 0) return 0;
  if (totalPot <= 100) return Math.min(15, Math.max(10, Math.round(totalPot * 0.15)));
  if (totalPot <= 250) return 20;
  if (totalPot <= 500) return 35;
  if (totalPot <= 1000) return 60; // Fair fee for 1,000 KES pot (50-70 range)
  if (totalPot <= 2500) return Math.max(60, Math.round(totalPot * 0.05)); // 2,000 KES pot -> 100 KES
  return Math.round(totalPot * 0.05); // 5% for larger pools
}

export function calculateNetPrizePool(
  totalPot: number,
  playerCount: number,
  payoutSplit: "winner_takes_all" | "80_20" | "70_30"
): {
  adminFee: number;
  netPrizePool: number;
  firstPlace: number;
  secondPlace: number;
  isWinnerTakesAll: boolean;
} {
  if (totalPot <= 0) {
    return {
      adminFee: 0,
      netPrizePool: 0,
      firstPlace: 0,
      secondPlace: 0,
      isWinnerTakesAll: true,
    };
  }

  const adminFee = calculateTournamentFee(totalPot);
  const netPrizePool = Math.max(0, totalPot - adminFee);

  // If 1v1 (2 players) or explicitly winner takes all:
  if (playerCount <= 2 || payoutSplit === "winner_takes_all") {
    return {
      adminFee,
      netPrizePool,
      firstPlace: netPrizePool,
      secondPlace: 0,
      isWinnerTakesAll: true,
    };
  }

  if (payoutSplit === "70_30") {
    const firstPlace = Math.round(netPrizePool * 0.7);
    const secondPlace = Math.max(0, netPrizePool - firstPlace);
    return {
      adminFee,
      netPrizePool,
      firstPlace,
      secondPlace,
      isWinnerTakesAll: false,
    };
  }

  // Default 80_20
  const firstPlace = Math.round(netPrizePool * 0.8);
  const secondPlace = Math.max(0, netPrizePool - firstPlace);
  return {
    adminFee,
    netPrizePool,
    firstPlace,
    secondPlace,
    isWinnerTakesAll: false,
  };
}
