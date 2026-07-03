import { describe, expect, it } from "vitest";
import { expandTemplates, LEGAL_TEMPLATES } from "./templates";

describe("prompt templates", () => {
  it("ships exactly 20 templates (F4)", () =>
    expect(LEGAL_TEMPLATES).toHaveLength(20));

  it("expands all placeholders — no braces left", () => {
    const out = expandTemplates({ city: "Austin", practice: "Personal Injury" });
    expect(out).toHaveLength(20);
    for (const p of out) {
      expect(p).not.toMatch(/[{}]/);
      expect(p).toContain("Austin");
    }
  });

  it("lowercases practice, preserves city casing", () => {
    const out = expandTemplates({ city: "El Paso", practice: "IMMIGRATION" });
    expect(out[0]).toBe("Who is the best immigration lawyer in El Paso?");
  });
});
