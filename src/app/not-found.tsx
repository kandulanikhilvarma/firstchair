import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center gap-3 px-6 py-24 text-center">
      <p className="font-heading text-5xl font-bold text-primary-900">404</p>
      <h1 className="text-lg font-semibold text-ink-900">Page not found</h1>
      <p className="text-ink-600">That link doesn&apos;t point anywhere on First Chair.</p>
      <Link
        href="/"
        className="mt-2 rounded-lg bg-primary-700 px-5 py-2.5 font-semibold text-white hover:bg-primary-500"
      >
        Back to home
      </Link>
    </main>
  );
}
