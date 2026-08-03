import "server-only";
import { createClient } from "@/lib/supabase/server";
import {
  assembleTrend,
  buildCitationGaps,
  computeSov,
  heroStats,
  promptRowsFromScan,
  type DailyScoreDbRow,
  type ScanResponseRow,
} from "@/lib/dashboard";
import { recommendFromCitations } from "@/lib/scoring/recommend";

export interface DashboardData {
  brandName: string;
  hasScans: boolean;
  trend: ReturnType<typeof assembleTrend>;
  hero: ReturnType<typeof heroStats>;
  sov: ReturnType<typeof computeSov>;
  promptRows: ReturnType<typeof promptRowsFromScan>;
  citationGaps: ReturnType<typeof buildCitationGaps>;
  recommendations: ReturnType<typeof recommendFromCitations>;
}

const EMPTY = (brandName: string): DashboardData => ({
  brandName,
  hasScans: false,
  trend: [],
  hero: { today: 0, weekAgo: 0, delta: 0 },
  sov: [],
  promptRows: [],
  citationGaps: [],
  recommendations: [],
});

export interface BrandRef {
  id: string;
  name: string;
}

/** Every firm this workspace tracks, oldest first. Competitors are excluded —
 *  they are rows in the same table, linked by is_competitor_of. */
export async function getBrands(): Promise<BrandRef[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("brands")
    .select("id, name")
    .is("is_competitor_of", null)
    .order("created_at", { ascending: true });
  return data ?? [];
}

/**
 * Reads the requested brand (or the first) and assembles the dashboard from
 * daily_scores (30-day trend) plus the latest completed scan (SOV, prompt
 * table, citation gaps). RLS scopes every query to the user's workspace.
 * Returns null when the user has no brand yet (pre-onboarding).
 */
export async function getDashboardData(brandId?: string): Promise<DashboardData | null> {
  const supabase = await createClient();

  const brands = await getBrands();
  // An unknown or other-workspace id falls back to the first brand rather than
  // erroring; RLS already guarantees the list only contains this workspace's.
  const brand = brands.find((b) => b.id === brandId) ?? brands[0];
  if (!brand) return null;

  const since = new Date();
  since.setDate(since.getDate() - 30);
  const { data: scoreRows } = await supabase
    .from("daily_scores")
    .select("date, engine, visibility_score, share_of_voice, mention_count, recommendation_count")
    .eq("brand_id", brand.id)
    .gte("date", since.toISOString().slice(0, 10))
    .order("date", { ascending: true });

  if (!scoreRows || scoreRows.length === 0) return EMPTY(brand.name);

  const trend = assembleTrend(scoreRows as DailyScoreDbRow[]);
  const hero = heroStats(trend);

  // Latest completed scan for the detail views.
  const { data: jobs } = await supabase
    .from("scan_jobs")
    .select("id")
    .eq("brand_id", brand.id)
    .eq("status", "done")
    .order("finished_at", { ascending: false })
    .limit(1);
  const jobId = jobs?.[0]?.id;

  if (!jobId) {
    return { ...EMPTY(brand.name), hasScans: true, trend, hero };
  }

  const [{ data: responses }, { data: promptList }, { data: tracked }] = await Promise.all([
    supabase
      .from("engine_responses")
      .select("prompt_id, engine, citations, mentions(brand_id, position, is_recommendation, sentiment)")
      .eq("scan_job_id", jobId),
    supabase.from("prompts").select("id, text").eq("brand_id", brand.id),
    supabase.from("brands").select("id, name").or(`id.eq.${brand.id},is_competitor_of.eq.${brand.id}`),
  ]);

  const resp = (responses ?? []) as ScanResponseRow[];
  const promptText = new Map((promptList ?? []).map((p) => [p.id, p.text]));
  const brandNames = new Map((tracked ?? []).map((b) => [b.id, b.name]));
  const competitorNames = new Map(
    (tracked ?? []).filter((b) => b.id !== brand.id).map((b) => [b.id, b.name]),
  );

  const citationGaps = buildCitationGaps(resp, brand.id, competitorNames);

  return {
    brandName: brand.name,
    hasScans: true,
    trend,
    hero,
    sov: computeSov(resp, brandNames),
    promptRows: promptRowsFromScan(resp, promptText, brand.id),
    citationGaps,
    recommendations: recommendFromCitations(citationGaps),
  };
}
