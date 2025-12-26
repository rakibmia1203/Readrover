export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-28 rounded-3xl border border-slate-200/70 bg-white/80 p-8 shadow-soft">
        <div className="h-6 w-40 rounded bg-slate-200/70 animate-pulse" />
        <div className="mt-3 h-4 w-72 rounded bg-slate-200/60 animate-pulse" />
      </div>

      <div className="grid gap-6 md:grid-cols-[260px,1fr]">
        <div className="h-96 rounded-2xl border border-slate-200/70 bg-white/80 shadow-soft animate-pulse" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-200/70 bg-white/80 p-3 shadow-soft">
              <div className="aspect-[3/4] rounded-xl bg-slate-200/60 animate-pulse" />
              <div className="mt-3 h-4 w-3/4 rounded bg-slate-200/60 animate-pulse" />
              <div className="mt-2 h-3 w-1/2 rounded bg-slate-200/60 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
