// Weekly report — Vercel Cron hits this once a week. For each paying/trial
// workspace it emails the owner their brand's current visibility score and the
// week-over-week delta. Admin client (no user session) — CRON_SECRET gated.
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { renderWeeklyEmail, sendEmail } from "@/lib/email";

export const runtime = "nodejs";
export const maxDuration = 120;

type Blend = { date: string; sum: number; n: number };

/** Blend the 3 engine scores per date (missing engine counts as 0/3). */
function blendByDate(rows: Array<{ date: string; visibility_score: number }>): Array<{ date: string; score: number }> {
  const byDate = new Map<string, Blend>();
  for (const r of rows) {
    const b = byDate.get(r.date) ?? { date: r.date, sum: 0, n: 0 };
    b.sum += r.visibility_score;
    b.n += 1;
    byDate.set(r.date, b);
  }
  return [...byDate.values()]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((b) => ({ date: b.date, score: Math.round(b.sum / 3) })); // always /3 engines
}

export async function GET(req: Request) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data: workspaces, error } = await supabase
    .from("workspaces")
    .select("id")
    .neq("plan", "canceled");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let sent = 0;
  let skipped = 0;
  const weekAgoDate = new Date(Date.now() - 8 * 86400_000).toISOString().slice(0, 10);

  for (const ws of workspaces ?? []) {
    const { data: brands } = await supabase
      .from("brands")
      .select("id, name")
      .eq("workspace_id", ws.id)
      .is("is_competitor_of", null)
      .order("created_at", { ascending: true })
      .limit(1);
    const brand = brands?.[0];
    if (!brand) {
      skipped++;
      continue;
    }

    const { data: scores } = await supabase
      .from("daily_scores")
      .select("date, visibility_score, mention_count")
      .eq("brand_id", brand.id)
      .gte("date", weekAgoDate)
      .order("date", { ascending: true });
    if (!scores || scores.length === 0) {
      skipped++;
      continue;
    }

    const blended = blendByDate(scores);
    const score = blended[blended.length - 1].score;
    const weekAgo = blended[0].score;

    // Owner email via workspace membership -> auth user.
    const { data: members } = await supabase.from("members").select("user_id").eq("workspace_id", ws.id).limit(1);
    const userId = members?.[0]?.user_id;
    if (!userId) {
      skipped++;
      continue;
    }
    const { data: userRes } = await supabase.auth.admin.getUserById(userId);
    const email = userRes.user?.email;
    if (!email) {
      skipped++;
      continue;
    }

    // Mention rate on the latest date across the 3 engines' prompt coverage.
    const latestDate = blended[blended.length - 1].date;
    const latestMentions = scores.filter((s) => s.date === latestDate).reduce((n, s) => n + s.mention_count, 0);
    const { count: promptCount } = await supabase
      .from("prompts")
      .select("id", { count: "exact", head: true })
      .eq("brand_id", brand.id)
      .eq("is_active", true);
    const denom = (promptCount ?? 0) * 3;
    const mentionRate = denom > 0 ? Math.min(1, latestMentions / denom) : 0;

    const { subject, html } = renderWeeklyEmail({
      firmName: brand.name,
      score,
      delta: score - weekAgo,
      mentionRate,
      // ponytail: recommendations need the citation-gap join; weekly v1 omits
      // the fix line, add once F6's buildCitationGaps is shared.
      topRecommendation: null,
    });
    try {
      await sendEmail(email, subject, html);
      sent++;
    } catch {
      skipped++;
    }
  }

  return NextResponse.json({ sent, skipped });
}
