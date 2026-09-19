export function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function marketingUtility(amount: number, idealAmount: number): number {
  if (idealAmount <= 0) return 0;
  return clamp01(amount / idealAmount);
}

export function financeUtility(amount: number, policyCap: number): number {
  if (policyCap <= 0) return 0;
  const variance = Math.abs(amount - policyCap) / policyCap;
  return clamp01(1 - variance);
}

export interface NashSolution {
  optimalAmount: number;
  optimalProduct: number;
}

export function solveNashBargain(
  idealAmount: number,
  policyCap: number,
  steps = 800,
): NashSolution {
  const upperBound = Math.max(idealAmount, policyCap) * 1.5;
  let best: NashSolution = { optimalAmount: 0, optimalProduct: 0 };

  for (let i = 0; i <= steps; i++) {
    const amount = (upperBound * i) / steps;
    const um = marketingUtility(amount, idealAmount);
    const uf = financeUtility(amount, policyCap);
    const product = um * uf;
    if (product > best.optimalProduct) {
      best = { optimalAmount: amount, optimalProduct: product };
    }
  }
  return best;
}

export interface BargainRoundResult {
  roundNo: number;
  marketingOffer: number;
  financeOffer: number;
  amount: number;
  marketingUtility: number;
  financeUtility: number;
  efficiencyPct: number;
}

export function simulateBargainingRounds(
  requestedAmount: number,
  idealAmount: number,
  policyCap: number,
  roundFractions: number[] = [0.45, 0.75, 0.92, 1],
): { rounds: BargainRoundResult[]; solution: NashSolution } {
  const solution = solveNashBargain(idealAmount, policyCap);
  const conservativeAnchor = policyCap * 0.5;

  const rounds: BargainRoundResult[] = roundFractions.map((fraction, idx) => {
    const marketingOffer =
      requestedAmount + (solution.optimalAmount - requestedAmount) * fraction;
    const financeOffer =
      conservativeAnchor + (solution.optimalAmount - conservativeAnchor) * fraction;
    const amount = (marketingOffer + financeOffer) / 2;
    const um = marketingUtility(amount, idealAmount);
    const uf = financeUtility(amount, policyCap);
    const product = um * uf;
    const efficiencyPct =
      solution.optimalProduct > 0
        ? clamp01(product / solution.optimalProduct) * 100
        : 100;

    return {
      roundNo: idx + 1,
      marketingOffer: Math.round(marketingOffer),
      financeOffer: Math.round(financeOffer),
      amount: Math.round(amount),
      marketingUtility: um,
      financeUtility: uf,
      efficiencyPct: Math.round(efficiencyPct * 10) / 10,
    };
  });

  return { rounds, solution };
}
