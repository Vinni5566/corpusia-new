import type { Constitution, LabDecision, AttackLogEntry, BargainingRound } from "./types";

export interface ReportData {
  constitution: Constitution | null;
  decisions: LabDecision[];
  attackLog: AttackLogEntry[];
  recentRounds: BargainingRound[];
  blocklistVersion: number;
}

export function generateComplianceReport(data?: Partial<ReportData>) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to generate the PDF report.");
    return;
  }

  const constitution = data?.constitution ?? null;
  const decisions = data?.decisions ?? [];
  const attackLog = data?.attackLog ?? [];
  const blocklistVersion = data?.blocklistVersion ?? 1;
  const generatedAt = new Date().toLocaleString();

  const rawRules = constitution?.rules as Record<string, unknown> | undefined;
  const rules =
    rawRules && typeof rawRules === "object" && !Array.isArray(rawRules)
      ? {
          max_amount: typeof rawRules.max_amount === "number" ? rawRules.max_amount : 15000,
          requires_approval_above: typeof rawRules.requires_approval_above === "number" ? rawRules.requires_approval_above : 10000,
          variance_tolerance: typeof rawRules.variance_tolerance === "number" ? rawRules.variance_tolerance : 0.15,
          strict_mode: Boolean(rawRules.strict_mode),
        }
      : {
          max_amount: 15000,
          requires_approval_above: 10000,
          variance_tolerance: 0.15,
          strict_mode: false,
        };

  const totalDecisions = decisions.length;
  const approvedDecisions = decisions.filter((d) => d.status === "Approved" || d.llm_verdict === "approve").length;
  const rejectedDecisions = decisions.filter((d) => d.status === "Rejected" || d.llm_verdict === "reject").length;
  const blockedAttacks = attackLog.filter((a) => a.outcome === "blocked").length;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>CorpusAI — Governance Compliance & Policy Audit Report</title>
      <style>
        @page { size: A4; margin: 20mm; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #0f172a;
          background: #ffffff;
          line-height: 1.5;
          font-size: 13px;
          margin: 0;
          padding: 20px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #3b82f6;
          padding-bottom: 15px;
          margin-bottom: 20px;
        }
        .header-title { font-size: 20px; font-weight: 700; color: #1e3a8a; }
        .header-sub { font-size: 11px; color: #64748b; }
        .badge {
          display: inline-block;
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          background: #eff6ff;
          color: #1d4ed8;
          border: 1px solid #bfdbfe;
        }
        .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 20px; }
        .card {
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 12px;
          background: #f8fafc;
        }
        .card-title { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #475569; margin-bottom: 8px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
        th, td { padding: 8px 10px; text-align: left; border-bottom: 1px solid #e2e8f0; }
        th { background: #f1f5f9; font-weight: 600; color: #334155; }
        .status-blocked, .status-approved { color: #16a34a; font-weight: 600; }
        .status-breached, .status-rejected { color: #dc2626; font-weight: 600; }
        .footer {
          margin-top: 30px;
          border-top: 1px solid #e2e8f0;
          padding-top: 15px;
          font-size: 11px;
          color: #94a3b8;
          display: flex;
          justify-content: space-between;
        }
        @media print {
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="margin-bottom: 20px; text-align: right;">
        <button onclick="window.print()" style="background: #2563eb; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 600; cursor: pointer;">
          🖨️ Print / Save as PDF
        </button>
      </div>

      <div class="header">
        <div>
          <div class="header-title">CorpusAI Enterprise Governance Compliance Audit</div>
          <div class="header-sub">Automated Multi-Agent Policy Verification & Audit Summary</div>
        </div>
        <div>
          <span class="badge">Constitution v${constitution?.version ?? 1}</span>
        </div>
      </div>

      <div style="font-size: 11px; color: #64748b; margin-bottom: 15px;">
        <strong>Report Generated:</strong> ${generatedAt} &nbsp;|&nbsp; 
        <strong>Blocklist Version:</strong> v${blocklistVersion} &nbsp;|&nbsp;
        <strong>Ratified By:</strong> ${constitution?.ratified_by ?? "System"}
      </div>

      <div class="grid">
        <div class="card">
          <div class="card-title">Active Constitutional Rules</div>
          <div>• <strong>Max Spend Cap:</strong> $${rules.max_amount.toLocaleString()}</div>
          <div>• <strong>Approval Threshold:</strong> $${rules.requires_approval_above.toLocaleString()}</div>
          <div>• <strong>Variance Tolerance:</strong> ${(rules.variance_tolerance * 100).toFixed(0)}%</div>
          <div>• <strong>Strict Mode:</strong> ${rules.strict_mode ? "ACTIVE (Enabled)" : "Inactive (Disabled)"}</div>
        </div>
        <div class="card">
          <div class="card-title">Governance Metrics Summary</div>
          <div>• <strong>Total Decisions Audited:</strong> ${totalDecisions}</div>
          <div>• <strong>Policy Approved:</strong> <span class="status-approved">${approvedDecisions}</span></div>
          <div>• <strong>Policy Rejected:</strong> <span class="status-rejected">${rejectedDecisions}</span></div>
          <div>• <strong>Adversarial Attacks Blocked:</strong> <span class="status-blocked">${blockedAttacks}</span></div>
        </div>
      </div>

      <div class="card-title" style="margin-top: 20px;">Audited Decisions & Symbolic Verifications</div>
      <table>
        <thead>
          <tr>
            <th>Initiative / Title</th>
            <th>Requested By</th>
            <th>Amount</th>
            <th>LLM Verdict</th>
            <th>Symbolic Policy</th>
            <th>Agreement</th>
          </tr>
        </thead>
        <tbody>
          ${
            decisions.length > 0
              ? decisions
                  .slice(0, 10)
                  .map(
                    (d) => `
            <tr>
              <td>${d.title}</td>
              <td>${d.requested_by}</td>
              <td>$${Number(d.amount).toLocaleString()}</td>
              <td>${d.llm_verdict ?? d.status}</td>
              <td>${d.symbolic_verdict ?? "approve"}</td>
              <td>${d.verdict_agreement !== false ? "✅ Match" : "⚠️ Override"}</td>
            </tr>
          `,
                  )
                  .join("")
              : '<tr><td colspan="6" style="text-align:center; color:#94a3b8;">No decision gate logs recorded.</td></tr>'
          }
        </tbody>
      </table>

      <div class="card-title" style="margin-top: 25px;">Adversarial Security & Attack Audit Log</div>
      <table>
        <thead>
          <tr>
            <th>Payload Preview</th>
            <th>Outcome</th>
            <th>Blocklist Ver. Before</th>
            <th>Blocklist Ver. After</th>
          </tr>
        </thead>
        <tbody>
          ${
            attackLog.length > 0
              ? attackLog
                  .slice(0, 8)
                  .map(
                    (a) => `
            <tr>
              <td><code>${a.payload}</code></td>
              <td class="${a.outcome === "blocked" ? "status-blocked" : "status-breached"}">${(a.outcome ?? "BLOCKED").toUpperCase()}</td>
              <td>v${a.blocklist_version_before}</td>
              <td>v${a.blocklist_version_after}</td>
            </tr>
          `,
                  )
                  .join("")
              : '<tr><td colspan="4" style="text-align:center; color:#94a3b8;">No adversarial attack attempts logged.</td></tr>'
          }
        </tbody>
      </table>

      <div class="footer">
        <div>CorpusAI Autonomous Multi-Agent Governance & Policy Subsystem</div>
        <div>Page 1 of 1</div>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
