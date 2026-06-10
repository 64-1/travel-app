export function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-48 rounded-lg bg-muted" />
      <div className="h-4 w-64 rounded bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2 mt-6">
        <div className="h-32 rounded-xl bg-muted" />
        <div className="h-32 rounded-xl bg-muted" />
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return <div className="h-40 animate-pulse rounded-xl bg-muted" />;
}
