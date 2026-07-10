"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  FileText,
  LayoutDashboard,
  Menu,
  MessageSquareText,
  Settings,
  Users,
  X,
} from "lucide-react";
import SignOutButton from "./sign-out-button";

// href present = a built destination; `soon` = feature not shipped yet, shown
// disabled instead of a dead "#" link.
const NAV = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard", active: true },
  { label: "Prompts", icon: MessageSquareText, soon: true },
  { label: "Competitors", icon: Users, soon: true },
  { label: "Reports", icon: FileText, soon: true },
  { label: "Billing", icon: CreditCard, href: "/billing" },
  { label: "Settings", icon: Settings, soon: true },
] as const;

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
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
        const active = "active" in item && item.active;
        return (
          <Link
            key={item.label}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`${base} ${
              active
                ? "bg-primary-700 text-white"
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

/** Sidebar (desktop) + top bar with a drawer (mobile) shared by all dashboard states. */
export default function Shell({
  brandName,
  children,
}: {
  brandName: string | null;
  children: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 border-r border-border bg-surface-0 px-4 py-6 lg:block">
        <span className="px-2 text-xl font-bold text-primary-900">Rankwell</span>
        <nav className="mt-8 space-y-1">
          <NavItems />
          <SignOutButton />
        </nav>
      </aside>

      <div className="min-w-0 flex-1">
        {/* Mobile top bar */}
        <div className="flex items-center justify-between border-b border-border bg-surface-0 px-4 py-3 lg:hidden">
          <span className="text-lg font-bold text-primary-900">Rankwell</span>
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
                <span className="text-xl font-bold text-primary-900">Rankwell</span>
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
              <SignOutButton />
            </nav>
          </div>
        )}

        {/* Desktop header */}
        <header className="hidden items-center justify-between border-b border-border bg-surface-0 px-6 py-4 lg:flex">
          <span className="text-sm font-medium text-ink-600">
            Brand <span className="font-semibold text-ink-900">{brandName ?? "—"}</span>
          </span>
        </header>
        {children}
      </div>
    </div>
  );
}
