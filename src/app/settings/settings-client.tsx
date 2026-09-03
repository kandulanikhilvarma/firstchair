"use client";

import { useState, useTransition } from "react";
import { addCompetitor, removeCompetitor, setPromptActive, updateBrandDetails } from "./actions";

interface Competitor {
  id: string;
  name: string;
}
interface Prompt {
  id: string;
  text: string;
  is_active: boolean;
}

export default function SettingsClient({
  brandId,
  name,
  city,
  practice,
  aliases,
  competitors,
  prompts,
}: {
  brandId: string;
  name: string;
  city: string;
  practice: string;
  aliases: string[];
  competitors: Competitor[];
  prompts: Prompt[];
}) {
  return (
    <div className="mx-auto max-w-4xl space-y-12 px-6 py-10">
      <Details
        brandId={brandId}
        name={name}
        city={city}
        practice={practice}
        aliases={aliases}
      />
      <Competitors brandId={brandId} competitors={competitors} />
      <Questions prompts={prompts} />
    </div>
  );
}

function Panel({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-line-strong bg-surface-1">
      <div className="border-b border-line-strong bg-surface-2 px-6 py-3">
        <h2 className="font-display text-xl text-fg">{title}</h2>
        <p className="mt-0.5 text-sm text-fg-muted">{hint}</p>
      </div>
      <div className="px-6 py-6">{children}</div>
    </section>
  );
}

const fieldCls =
  "mt-1 w-full border-0 border-b border-line-strong bg-transparent px-0 py-2 text-fg placeholder:text-fg-muted/55 focus:border-brand-500 focus:outline-none focus:ring-0";

function Notice({ state }: { state: { ok: boolean; msg: string } | null }) {
  if (!state) return null;
  return (
    <p role="status" className={`mt-3 text-sm ${state.ok ? "text-success" : "text-danger"}`}>
      {state.msg}
    </p>
  );
}

function Details({
  brandId,
  name,
  city,
  practice,
  aliases,
}: {
  brandId: string;
  name: string;
  city: string;
  practice: string;
  aliases: string[];
}) {
  const [pending, start] = useTransition();
  const [state, setState] = useState<{ ok: boolean; msg: string } | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    start(async () => {
      const res = await updateBrandDetails({
        brandId,
        name: String(f.get("name") ?? ""),
        city: String(f.get("city") ?? ""),
        practice: String(f.get("practice") ?? ""),
        aliases: String(f.get("aliases") ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      });
      setState(res.ok ? { ok: true, msg: "Saved." } : { ok: false, msg: res.error });
    });
  }

  return (
    <Panel title="Firm details" hint="How this firm is matched in engine answers.">
      <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="notation text-fg-muted">Firm name</span>
          <input name="name" defaultValue={name} required className={fieldCls} />
        </label>
        <label className="block text-sm">
          <span className="notation text-fg-muted">City</span>
          <input name="city" defaultValue={city} required className={fieldCls} />
        </label>
        <label className="block text-sm">
          <span className="notation text-fg-muted">Practice area</span>
          <input name="practice" defaultValue={practice} required className={fieldCls} />
        </label>
        <label className="block text-sm">
          <span className="notation text-fg-muted">Also known as</span>
          <input
            name="aliases"
            defaultValue={aliases.join(", ")}
            placeholder="Smith Jones, S&amp;J Law"
            className={fieldCls}
          />
          <span className="mt-1 block text-xs text-fg-muted">
            Comma separated. Every spelling an engine might use.
          </span>
        </label>
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={pending}
            className="cursor-pointer bg-brand-500 px-6 py-3 font-semibold text-on-brand transition-colors hover:bg-brand-600 disabled:cursor-wait disabled:opacity-70"
          >
            {pending ? "Saving…" : "Save details"}
          </button>
          <Notice state={state} />
        </div>
      </form>
    </Panel>
  );
}

function Competitors({
  brandId,
  competitors,
}: {
  brandId: string;
  competitors: Competitor[];
}) {
  const [pending, start] = useTransition();
  const [state, setState] = useState<{ ok: boolean; msg: string } | null>(null);

  function onAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const value = String(new FormData(form).get("name") ?? "");
    start(async () => {
      const res = await addCompetitor({ brandId, name: value });
      setState(res.ok ? { ok: true, msg: `Added ${value}.` } : { ok: false, msg: res.error });
      if (res.ok) form.reset();
    });
  }

  function onRemove(id: string, label: string) {
    start(async () => {
      const res = await removeCompetitor(id);
      setState(res.ok ? { ok: true, msg: `Removed ${label}.` } : { ok: false, msg: res.error });
    });
  }

  return (
    <Panel title="Competitors" hint="Up to five. Share of voice is measured against these.">
      {competitors.length === 0 ? (
        <p className="text-fg-muted">No competitors tracked yet.</p>
      ) : (
        <ul>
          {competitors.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between border-b border-line py-2.5 last:border-0"
            >
              <span className="text-fg">{c.name}</span>
              <button
                type="button"
                onClick={() => onRemove(c.id, c.name)}
                disabled={pending}
                className="notation cursor-pointer text-danger hover:underline disabled:opacity-50"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={onAdd} className="mt-5 flex flex-wrap items-end gap-3">
        <label className="block flex-1 text-sm">
          <span className="notation text-fg-muted">Add a competitor</span>
          <input name="name" required placeholder="Barnes Whitfield" className={fieldCls} />
        </label>
        <button
          type="submit"
          disabled={pending || competitors.length >= 5}
          className="cursor-pointer border border-brand-500 px-5 py-2.5 font-semibold text-brand-700 transition-colors hover:bg-brand-600 hover:text-on-brand disabled:cursor-not-allowed disabled:opacity-45"
        >
          Add
        </button>
      </form>
      <Notice state={state} />
    </Panel>
  );
}

function Questions({ prompts }: { prompts: Prompt[] }) {
  const [pending, start] = useTransition();
  const [state, setState] = useState<{ ok: boolean; msg: string } | null>(null);
  const [local, setLocal] = useState(prompts);

  function toggle(id: string, next: boolean) {
    setLocal((rows) => rows.map((r) => (r.id === id ? { ...r, is_active: next } : r)));
    start(async () => {
      const res = await setPromptActive(id, next);
      if (!res.ok) {
        setLocal((rows) => rows.map((r) => (r.id === id ? { ...r, is_active: !next } : r)));
        setState({ ok: false, msg: res.error });
      } else {
        setState(null);
      }
    });
  }

  const activeCount = local.filter((p) => p.is_active).length;

  return (
    <Panel
      title="Tracked questions"
      hint={`${activeCount} of ${local.length} active. Inactive questions are not sent to the engines and cost nothing.`}
    >
      <ul>
        {local.map((p) => (
          <li key={p.id} className="flex items-start gap-3 border-b border-line py-3 last:border-0">
            <input
              id={`q-${p.id}`}
              type="checkbox"
              checked={p.is_active}
              disabled={pending}
              onChange={(e) => toggle(p.id, e.target.checked)}
              className="mt-1 h-4 w-4 shrink-0 accent-brand-500"
            />
            <label
              htmlFor={`q-${p.id}`}
              className={`cursor-pointer text-sm ${p.is_active ? "text-fg" : "text-fg-muted line-through"}`}
            >
              {p.text}
            </label>
          </li>
        ))}
      </ul>
      <Notice state={state} />
    </Panel>
  );
}
