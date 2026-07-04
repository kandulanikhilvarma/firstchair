// Day-1 market probe, automated. Runs the 30 prompts from ../day1-probe.md
// through whichever engines have API keys set, matches known real firms
// (from ../icp-list.md) using the same deterministic matcher the product
// uses, and writes a skimmable report. Replaces manual browser typing +
// screenshotting for the "does an engine name a real firm" evidence gate.
//
// Usage: set at least one of OPENAI_API_KEY / GEMINI_API_KEY / PERPLEXITY_API_KEY
// in .env.local, then from rankwell/: npm run probe
//
// Caveat (documented, not hidden): API answers approximate but don't equal
// the consumer apps (master plan §2.6). Good enough for the evidence gate —
// it's the same method the product itself uses.

import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { callEngine, type EngineName } from "../src/lib/engines";
import { findMentions, type TrackedBrand } from "../src/lib/scoring/mentions";

const SYSTEM_PROMPT =
  "You are a helpful assistant answering a consumer's question. Answer naturally and concretely. When the question asks for professionals or firms, name specific ones you would point the person to, with a short reason each. Keep the answer under 300 words.";

// 29 of the 30 day1-probe.md prompts — #14 ("Is [firm you find in #1] a good
// law firm?") is templated on a prior result at runtime, not a fixed string;
// run it manually in-browser after seeing what #1 surfaces.
const PROMPTS: string[] = [
  "Who is the best personal injury lawyer in Austin?",
  "Best car accident attorney in Austin",
  "Top rated immigration lawyer in Austin",
  "Who is the best personal injury lawyer in Houston?",
  "Best truck accident lawyer in Houston",
  "Top immigration attorneys in Houston",
  "I was rear-ended in Austin and the insurance company is lowballing me. Which lawyer should I call?",
  "My visa got denied, I need a good immigration lawyer in Houston. Who do you recommend?",
  "Can you recommend a personal injury law firm in Houston that works on contingency?",
  "Which Austin law firm is best for a slip and fall case?",
  "I need an abogado de inmigración in Houston — who is good?",
  "Who should I hire for a wrongful death case in Austin?",
  "Compare the top 3 personal injury firms in Austin",
  "What are the biggest immigration law firms in Houston and how do they differ?",
  "Should I hire a lawyer for a minor car accident in Texas?",
  "How much does a personal injury lawyer cost in Austin?",
  "How do I choose an immigration lawyer in Houston?",
  "What questions should I ask a personal injury attorney before hiring?",
  "Do I need a lawyer for a green card application in Texas?",
  "Best personal injury lawyer near downtown Austin",
  "Personal injury attorney Round Rock TX",
  "Immigration lawyer near Katy Houston",
  "Best injury law firm in Austin for motorcycle accidents",
  "Houston lawyer for 18-wheeler accident on I-45",
  "What does Avvo say are the top injury lawyers in Austin?",
  "According to Google reviews, who is the best immigration lawyer in Houston?",
  "List super lawyers rated personal injury attorneys in Austin",
  "Which Austin injury firms have the most 5-star reviews?",
  "Where can I find rankings of Houston immigration lawyers?",
];

// Real firms found via web search 2026-07-04 (icp-list.md) — what we scan for.
const KNOWN_FIRMS: TrackedBrand[] = [
  "Loewy Law Firm", "Byrd Davis Alden & Henrichson", "Howry, Breen & Herman",
  "DJC Law", "FVF Law Firm", "The Zimmerman Law Firm",
  "Simmons and Fletcher", "Arnold & Itkin", "Smith & Hassler", "Zehl & Associates",
  "The Doan Law Firm", "JLW Immigration Law Group", "Nanthaveth & Associates",
  "Foster LLP", "Dang Law Group", "TKR Law Group", "Azarmehr Law Group",
  "Vega & Associates", "The Modi Law Firm", "Gonzalez Olivieri",
  "De Mott, Curtright & Armendáriz", "DMCA", "Lozano Law Firm",
].map((name, i) => ({ brandId: `firm-${i}`, name, aliases: [] }));

const ENGINES: EngineName[] = ["openai", "gemini", "perplexity"];

interface Row {
  n: number;
  prompt: string;
  engine: EngineName;
  firmsFound: string[];
  citations: string[];
  error: string | null;
}

async function main() {
  const available = ENGINES.filter((e) => {
    const key = { openai: "OPENAI_API_KEY", gemini: "GEMINI_API_KEY", perplexity: "PERPLEXITY_API_KEY" }[e];
    return Boolean(process.env[key]);
  });

  if (available.length === 0) {
    console.error(
      "No engine keys found. Set at least one of OPENAI_API_KEY / GEMINI_API_KEY / " +
        "PERPLEXITY_API_KEY in rankwell/.env.local and rerun with: npm run probe",
    );
    process.exit(1);
  }
  console.log(`Running ${PROMPTS.length} prompts x ${available.length} engine(s): ${available.join(", ")}`);

  const rows: Row[] = [];
  for (let i = 0; i < PROMPTS.length; i++) {
    for (const engine of available) {
      process.stdout.write(`  [${i + 1}/${PROMPTS.length}] ${engine}... `);
      try {
        const res = await callEngine(engine, SYSTEM_PROMPT, PROMPTS[i]);
        const mentions = findMentions(res.rawText, KNOWN_FIRMS);
        rows.push({
          n: i + 1,
          prompt: PROMPTS[i],
          engine,
          firmsFound: mentions.map((m) => KNOWN_FIRMS.find((f) => f.brandId === m.brandId)!.name),
          citations: res.citations,
          error: null,
        });
        console.log(mentions.length > 0 ? `${mentions.length} known firm(s)` : "no known firm");
      } catch (err) {
        rows.push({ n: i + 1, prompt: PROMPTS[i], engine, firmsFound: [], citations: [], error: String(err) });
        console.log("FAILED");
      }
    }
  }

  const hits = rows.filter((r) => r.firmsFound.length > 0);
  const byFirm = new Map<string, number>();
  for (const r of hits) for (const f of r.firmsFound) byFirm.set(f, (byFirm.get(f) ?? 0) + 1);

  const lines: string[] = [
    "# Day-1 probe results (automated)",
    "",
    `Generated ${new Date().toISOString()}. Engines: ${available.join(", ")}. ` +
      `${hits.length} of ${rows.length} calls named a known tracked firm.`,
    "",
    "**Caveat:** API answers approximate but don't equal consumer ChatGPT/Gemini/Perplexity " +
      "(master plan §2.6) — same method the product uses in production. For a second data " +
      "point, spot-check 2-3 of the strongest hits below in the consumer apps directly.",
    "",
    "## Firms named, by frequency (your evidence + future case studies)",
    "",
    "| Firm | Times named |",
    "|---|---|",
    ...[...byFirm.entries()].sort((a, b) => b[1] - a[1]).map(([f, n]) => `| ${f} | ${n} |`),
    "",
    "## Full results",
    "",
    "| # | Prompt | Engine | Known firms named | Citations |",
    "|---|---|---|---|---|",
    ...rows.map(
      (r) =>
        `| ${r.n} | ${r.prompt} | ${r.engine} | ${r.error ? `ERROR: ${r.error}` : r.firmsFound.join(", ") || "—"} | ${r.citations.slice(0, 2).join(", ") || "—"} |`,
    ),
  ];

  const outPath = join(process.cwd(), "..", "probe-results.md");
  writeFileSync(outPath, lines.join("\n") + "\n");
  console.log(`\nWrote ${outPath}`);
  console.log(
    hits.length >= 3
      ? "Verify gate MET: 3+ calls named a known firm."
      : "Verify gate NOT YET met — try more cities/firms or check consumer apps directly.",
  );
}

main();
