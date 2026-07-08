import { describe, expect, it } from "vitest";
import { renderAuditEmail, renderWeeklyEmail } from "./email";

describe("renderAuditEmail", () => {
  it("puts the score in the subject and escapes the firm name in the body", () => {
    const { subject, html } = renderAuditEmail({
      firmName: "Smith & Jones <LLP>",
      city: "Austin",
      practiceArea: "personal injury",
      overallScore: 62,
      engines: [
        { engine: "openai", visibilityScore: 70, mentionedInPrompts: 4, totalPrompts: 5, recommended: 2, bestPosition: 1 },
        { engine: "gemini", visibilityScore: 54, mentionedInPrompts: 3, totalPrompts: 5, recommended: 0, bestPosition: 2 },
      ],
    });
    expect(subject).toBe("Smith & Jones <LLP>: 62/100 AI visibility");
    expect(html).toContain("Smith &amp; Jones &lt;LLP&gt;"); // escaped, no raw tags
    expect(html).not.toContain("<LLP>");
    expect(html).toContain("ChatGPT");
    expect(html).toContain("4/5 prompts · best #1");
  });
});

describe("renderWeeklyEmail", () => {
  it("shows an up arrow and signed delta for gains", () => {
    const { subject, html } = renderWeeklyEmail({
      firmName: "Loewy Law",
      score: 48,
      delta: 5,
      mentionRate: 0.6,
      topRecommendation: "Get listed on avvo.com",
    });
    expect(subject).toBe("Loewy Law: 48/100 (+5 this week)");
    expect(html).toContain("▲ +5");
    expect(html).toContain("60% of tracked prompts");
    expect(html).toContain("Get listed on avvo.com");
  });

  it("shows a down arrow for losses and omits the fix line when none", () => {
    const { subject, html } = renderWeeklyEmail({
      firmName: "Loewy Law",
      score: 40,
      delta: -3,
      mentionRate: 0.2,
      topRecommendation: null,
    });
    expect(subject).toBe("Loewy Law: 40/100 (-3 this week)");
    expect(html).toContain("▼ -3");
    expect(html).not.toContain("Fix first");
  });
});
