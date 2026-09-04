export default function Loading() {
  return (
    <div className="flex flex-1 items-center justify-center py-24" role="status" aria-label="Loading">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-brand-500" />
    </div>
  );
}
