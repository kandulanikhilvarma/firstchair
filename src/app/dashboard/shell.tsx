"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CreditCard,
  FileText,
  Home,
  LayoutDashboard,
  Menu,
  MessageSquareText,
  Settings,
  Users,
  X,
} from "lucide-react";
import SignOutButton from "./sign-out-button";
import Wordmark from "../wordmark";

// href present = a built destination; `soon` = feature not shipped yet, shown
// disabled instead of a dead "#" link.
const NAV = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Prompts", icon: MessageSquareText, soon: true },
  { label: "Competitors", icon: Users, soon: true },
  { label: "Reports", icon: FileText, soon: true },
  { label: "Billing", icon: CreditCard, href: "/billing" },
  { label: "Settings", icon: Settings, href: "/settings" },
] as const;

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  // Active state comes from the real route; it used to be hardcoded to
  // Dashboard, so Billing and Settings never showed where you were.
  const pathname = usePathname();
  return (
    <>
      {NAV.map((item) => {
        const base = "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium";
        if (!("href" in item)) {
          return (
            <span
              key={item.label}
              aria-disabled
              className={`${base} cursor-default text-ink-600/50`}
            >
              <item.icon className="h-5 w-5" aria-hidden />
              {item.label}
              <span className="ml-auto rounded-full bg-surface-50 px-2 py-0.5 text-xs font-semibold text-ink-600">
                Soon
              </span>
            </span>
          );
        }
        const active = pathname === item.href;
        return (
          <Link
            key={item.label}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`${base} ${
              active
                ? "bg-ox-700 text-canary-100"
                : "text-ink-600 hover:bg-surface-50 hover:text-ink-900"
            }`}
          >
            <item.icon className="h-5 w-5" aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </>
  );
}

/** Signed-in users otherwise have no route back to the public site — the app
 *  shell replaces it entirely, which makes the product feel detached from the
 *  brand it belongs to. */
function ViewSiteLink({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link
      href="/"
      onClick={onNavigate}
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-ink-600 hover:bg-surface-50 hover:text-ink-900"
    >
      <Home className="h-5 w-5" aria-hidden />
      View site
    </Link>
  );
}

/** Trial countdown / trial-ended banner — the only conversion nudge in the app. */
function PlanBanner({ plan, trialDaysLeft }: { plan: string | null; trialDaysLeft: number | null }) {
  if (plan === "trial" && trialDaysLeft !== null) {
    const daysLeft = trialDaysLeft;
    return (
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-canary-100 px-4 py-2 text-sm lg:px-6">
        <span className="font-medium text-ink-900">
          <span className="tnum font-semibold">{daysLeft}</span> day
          {daysLeft === 1 ? "" : "s"} left in your free trial.
        </span>
        <Link href="/billing" className="font-semibold text-ox-700 hover:text-ox-900">
          Choose a plan →
        </Link>
      </div>
    );
  }
  if (plan === "canceled") {
    return (
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-rule/10 px-4 py-2 text-sm lg:px-6">
        <span className="font-medium text-ink-900">Your trial has ended — scans are paused.</span>
        <Link href="/billing" className="font-semibold text-ox-700 hover:text-ox-900">
          Reactivate →
        </Link>
      </div>
    );
  }
  return null;
}

/** Sidebar (desktop) + top bar with a drawer (mobile) shared by all dashboard states. */
export default function Shell({
  brandName,
  brands = [],
  currentBrandId = null,
  plan = null,
  trialDaysLeft = null,
  children,
}: {
  brandName: string | null;
  brands?: Array<{ id: string; name: string }>;
  currentBrandId?: string | null;
  plan?: string | null;
  trialDaysLeft?: number | null;
  children: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 border-r border-border bg-surface-0 px-4 py-6 lg:block">
        <Link href="/dashboard" className="block px-2" aria-label="First Chair dashboard">
          <Wordmark markClassName="h-7 w-7 text-ox-900" textClassName="text-lg text-ox-900" />
        </Link>
        <nav className="mt-8 space-y-1">
          <NavItems />
          <ViewSiteLink />
          <SignOutButton />
        </nav>
      </aside>

      <div className="min-w-0 flex-1">
        {/* Mobile top bar */}
        <div className="flex items-center justify-between border-b border-border bg-surface-0 px-4 py-3 lg:hidden">
          <Link href="/dashboard" aria-label="First Chair dashboard">
            <Wordmark markClassName="h-6 w-6 text-ox-900" textClassName="text-base text-ox-900" />
          </Link>
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
            className="cursor-pointer rounded-lg p-1 text-ink-600 hover:bg-surface-50"
          >
            <Menu className="h-6 w-6" aria-hidden />
          </button>
        </div>

        {/* Mobile drawer */}
        {menuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-ink-900/40"
              onClick={() => setMenuOpen(false)}
              aria-hidden
            />
            <nav className="absolute right-0 top-0 flex h-full w-64 flex-col gap-1 bg-surface-0 px-4 py-6 shadow-card-hover">
              <div className="mb-4 flex items-center justify-between">
                <Wordmark markClassName="h-6 w-6 text-ox-900" textClassName="text-base text-ox-900" />
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setMenuOpen(false)}
                  className="cursor-pointer rounded-lg p-1 text-ink-600 hover:bg-surface-50"
                >
                  <X className="h-6 w-6" aria-hidden />
                </button>
              </div>
              <NavItems onNavigate={() => setMenuOpen(false)} />
              <ViewSiteLink onNavigate={() => setMenuOpen(false)} />
              <SignOutButton />
            </nav>
          </div>
        )}

        {/* Desktop header — brand switcher, the Agency plan's whole point */}
        <header className="hidden items-center justify-between gap-4 border-b border-border bg-surface-0 px-6 py-3 lg:flex">
          {brands.length > 1 ? (
            <label className="flex items-baseline gap-2 text-sm">
              <span className="notation text-ink-500">Firm</span>
              <select
                value={currentBrandId ?? brands[0]?.id}
                onChange={(e) => router.push(`/dashboard?brand=${e.target.value}`)}
                className="cursor-pointer border-0 border-b border-border-strong bg-transparent py-1 pr-6 font-semibold text-ink-900 focus:border-ox-700 focus:outline-none"
              >
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <span className="text-sm">
              <span className="notation text-ink-500">Firm</span>{" "}
              <span className="font-semibold text-ink-900">{brandName ?? "—"}</span>
            </span>
          )}
          {/* The onboarding wizard already creates an additional brand, and
              saveOnboarding enforces the plan limit — no separate flow needed. */}
          <Link
            href="/onboarding"
            className="notation border-b-2 border-canary-400 pb-0.5 text-ox-700 hover:border-ox-700"
          >
            Add a firm
          </Link>
        </header>
        <PlanBanner plan={plan} trialDaysLeft={trialDaysLeft} />
        {children}
      </div>
    </div>
  );
}
