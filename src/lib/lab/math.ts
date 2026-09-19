// Section 2 — Nash Bargaining Kernel math primitives.
// Pure functions, no side effects, shared conceptually with the
// `lab-bargain` Edge Function (Deno copy lives in
// supabase/functions/_shared/math.ts since the two runtimes can't share
// a module import directly).

export function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/** Marketing utility: how close the granted amount gets to its ideal ask. */
export function marketingUtility(amount: number, idealAmount: number): number {
  if (idealAmount <= 0) return 0;
  return clamp01(amount / idealAmount);
}

/** Finance utility: 1 minus the variance of the amount from the policy cap. */
export function financeUtility(amount: number, policyCap: number): number {
  if (policyCap <= 0) return 0;
  const variance = Math.abs(amount - policyCap) / policyCap;
  return clamp01(1 - variance);
}

export interface NashSolution {
  optimalAmount: number;
  optimalProduct: number;
}

/**
 * Numerically maximizes (U_marketing(x) - d_m) * (U_finance(x) - d_f)
 * over the feasible amount range, with disagreement point d = (0, 0)
 * (the zero-deal / status-quo outcome). Fine-grained grid search is used
 * instead of a hand-derived closed form — for these utility shapes it
 * converges to the same optimum and is far less error-prone to implement
 * correctly under time constraints.
 */
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

/**
 * Simulates N rounds of monotonic convergence toward the Nash solution.
 * Round fractions control how far each round moves from the initial
 * anchor points toward the solver's target (mirrors the spec's requirement
 * that "the LLM's number diverge from the solver's trajectory" is disallowed
 * — every round's numeric offer is clamped to this trajectory).
 */
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

/**
 * Explicit Shapley value split for a small, fixed set of agents sharing one
 * budget pool. For N<=4 this brute-forces all permutations, which is more
 * than fast enough and avoids pulling in an optimization dependency.
 */
export function shapleySplit(
  agentIds: string[],
  valueFn: (coalition: string[]) => number,
): Record<string, number> {
  const n = agentIds.length;
  const contributions: Record<string, number> = Object.fromEntries(
    agentIds.map((id) => [id, 0]),
  );

  const permute = (arr: string[]): string[][] => {
    if (arr.length <= 1) return [arr];
    const result: string[][] = [];
    arr.forEach((item, i) => {
      const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
      for (const perm of permute(rest)) {
        result.push([item, ...perm]);
      }
    });
    return result;
  };

  const permutations = permute(agentIds);
  for (const perm of permutations) {
    let coalition: string[] = [];
    let prevValue = 0;
    for (const agent of perm) {
      coalition = [...coalition, agent];
      const value = valueFn(coalition);
      contributions[agent] += value - prevValue;
      prevValue = value;
    }
  }

  for (const id of agentIds) {
    contributions[id] /= permutations.length;
  }
  return contributions;
}
