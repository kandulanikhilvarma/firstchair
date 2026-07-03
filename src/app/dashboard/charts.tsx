"use client";

import { useState } from "react";
import {
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { EngineName } from "@/lib/engines/types";
import { ENGINE_LABELS, ENGINES, type SovSlice, type TrendPoint } from "@/lib/seed";

// hex mirrors @theme tokens in globals.css (recharts can't read CSS vars in SSR)
const SERIES: Record<EngineName, string> = {
  openai: "#2563eb",
  gemini: "#059669",
  perplexity: "#d97706",
};
const DONUT_COLORS = ["#2563eb", "#059669", "#d97706", "#7c3aed", "#db2777", "#0891b2"];

export function Sparkline({ data }: { data: TrendPoint[] }) {
  const avg = data.map((p) => ({
    date: p.date,
    score: Math.round((p.openai + p.gemini + p.perplexity) / 3),
  }));
  return (
    <ResponsiveContainer width="100%" height={48}>
      <LineChart data={avg}>
        <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function TrendChart({ data }: { data: TrendPoint[] }) {
  const [visible, setVisible] = useState<Record<EngineName, boolean>>({
    openai: true,
    gemini: true,
    perplexity: true,
  });
  return (
    <div>
      <div className="mb-3 flex gap-2">
        {ENGINES.map((e) => (
          <button
            key={e}
            type="button"
            aria-pressed={visible[e]}
            onClick={() => setVisible((v) => ({ ...v, [e]: !v[e] }))}
            className={`cursor-pointer rounded-full border px-3 py-1 text-sm font-medium transition-colors duration-150 ${
              visible[e]
                ? "border-transparent text-white"
                : "border-border bg-surface-0 text-ink-600"
            }`}
            style={visible[e] ? { backgroundColor: SERIES[e] } : undefined}
          >
            {ENGINE_LABELS[e]}
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data}>
          <XAxis dataKey="date" tick={{ fontSize: 12 }} tickFormatter={(d: string) => d.slice(5)} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} width={32} />
          <Tooltip />
          {ENGINES.filter((e) => visible[e]).map((e) => (
            <Line
              key={e}
              type="monotone"
              dataKey={e}
              name={ENGINE_LABELS[e]}
              stroke={SERIES[e]}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SovDonut({ data }: { data: SovSlice[] }) {
  const total = data.reduce((n, s) => n + s.mentions, 0);
  return (
    <div className="flex items-center gap-4">
      <ResponsiveContainer width={160} height={160}>
        <PieChart>
          <Pie
            data={data}
            dataKey="mentions"
            nameKey="name"
            innerRadius={48}
            outerRadius={72}
            strokeWidth={1}
          >
            {data.map((s, i) => (
              <Cell key={s.name} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <ul className="space-y-1 text-sm">
        {data.map((s, i) => (
          <li key={s.name} className="flex items-center gap-2">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }}
            />
            <span className="text-ink-900">{s.name}</span>
            <span className="tnum text-ink-600">
              {Math.round((100 * s.mentions) / total)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
