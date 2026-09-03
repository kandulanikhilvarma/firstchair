import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center gap-3 px-6 py-24 text-center">
      <p className="font-display text-6xl text-brand-700">404</p>
      <h1 className="text-lg font-semibold text-fg">Page not found</h1>
      <p className="text-fg-muted">That link doesn&apos;t point anywhere on First Chair.</p>
      <Link
        href="/"
        className="mt-2 bg-brand-500 px-5 py-2.5 font-semibold text-on-brand hover:bg-brand-600"
      >
        Back to home
      </Link>
    </main>
  );
}
