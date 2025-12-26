export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-[340px,1fr]">
        <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-soft">
          <div className="aspect-[3/4] rounded-2xl bg-slate-200/60 animate-pulse" />
          <div className="mt-4 h-6 w-32 rounded bg-slate-200/70 animate-pulse" />
          <div className="mt-2 h-10 rounded-xl bg-slate-200/60 animate-pulse" />
        </div>
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-soft">
            <div className="h-7 w-2/3 rounded bg-slate-200/70 animate-pulse" />
            <div className="mt-3 h-4 w-1/2 rounded bg-slate-200/60 animate-pulse" />
            <div className="mt-4 h-20 rounded bg-slate-200/50 animate-pulse" />
          </div>
          <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-soft">
            <div className="h-6 w-40 rounded bg-slate-200/70 animate-pulse" />
            <div className="mt-3 h-24 rounded bg-slate-200/50 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
