import { describe, expect, it } from "vitest";
import { symbolicallyVerify } from "../../../supabase/functions/_shared/verifier";

describe("Symbolic Policy Verifier", () => {
  const defaultRules = {
    max_amount: 15000,
    requires_approval_above: 10000,
    variance_tolerance: 0.15,
    strict_mode: false,
  };

  it("approves amounts within hard max cap", () => {
    const result = symbolicallyVerify(8000, defaultRules);
    expect(result.verdict).toBe("approve");
  });

  it("rejects amounts exceeding hard max cap", () => {
    const result = symbolicallyVerify(20000, defaultRules);
    expect(result.verdict).toBe("reject");
    expect(result.rationale).toContain("exceeds hard cap");
  });

  it("rejects amounts exceeding approval threshold when strict mode is active", () => {
    const strictRules = { ...defaultRules, strict_mode: true };
    const result = symbolicallyVerify(12000, strictRules);
    expect(result.verdict).toBe("reject");
    expect(result.rationale).toContain("Strict mode active");
  });
});
