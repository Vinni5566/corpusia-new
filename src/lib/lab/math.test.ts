import { describe, expect, it } from "vitest";
import {
  clamp01,
  marketingUtility,
  financeUtility,
  solveNashBargain,
  simulateBargainingRounds,
  shapleySplit,
} from "./math";

describe("Nash Bargaining Kernel — Math Utilities", () => {
  it("clamp01 clamps values correctly to range [0, 1]", () => {
    expect(clamp01(-0.5)).toBe(0);
    expect(clamp01(0.45)).toBe(0.45);
    expect(clamp01(1.8)).toBe(1);
  });

  it("calculates marketing utility proportionally to ideal ask", () => {
    expect(marketingUtility(5000, 10000)).toBe(0.5);
    expect(marketingUtility(10000, 10000)).toBe(1);
    expect(marketingUtility(0, 10000)).toBe(0);
  });

  it("calculates finance utility based on variance from policy cap", () => {
    expect(financeUtility(10000, 10000)).toBe(1); // 0 variance -> utility 1
    expect(financeUtility(15000, 10000)).toBe(0.5); // 50% variance -> utility 0.5
    expect(financeUtility(20000, 10000)).toBe(0); // 100% variance -> utility 0
  });

  it("solves Nash Bargaining equilibrium correctly", () => {
    const solution = solveNashBargain(12000, 10000);
    expect(solution.optimalAmount).toBeGreaterThan(0);
    expect(solution.optimalProduct).toBeGreaterThan(0);
    expect(solution.optimalAmount).toBeLessThanOrEqual(12000);
  });

  it("simulates monotonic convergence rounds toward Pareto solution", () => {
    const { rounds, solution } = simulateBargainingRounds(15000, 15000, 10000);
    expect(rounds.length).toBe(4);
    expect(rounds[0].roundNo).toBe(1);
    expect(rounds[3].efficiencyPct).toBeGreaterThanOrEqual(90);
    expect(solution.optimalAmount).toBeGreaterThan(0);
  });

  it("calculates Shapley value allocation split across agents", () => {
    const agents = ["marketing", "finance", "engineering"];
    const simpleCoalitionValue = (coalition: string[]) => coalition.length * 100;
    const split = shapleySplit(agents, simpleCoalitionValue);

    expect(split.marketing).toBe(100);
    expect(split.finance).toBe(100);
    expect(split.engineering).toBe(100);
  });
});
