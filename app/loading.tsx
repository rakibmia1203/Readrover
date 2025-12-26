export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-64 rounded-2xl bg-slate-200/70 animate-pulse" />
      <div className="h-32 rounded-3xl bg-slate-200/50 animate-pulse" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-slate-200/70 bg-white/80 p-3 shadow-soft">
            <div className="aspect-[3/4] rounded-xl bg-slate-200/60 animate-pulse" />
            <div className="mt-3 h-4 w-3/4 rounded bg-slate-200/60 animate-pulse" />
            <div className="mt-2 h-3 w-1/2 rounded bg-slate-200/60 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
