import Link from "next/link";
import { Card, CardContent, Badge } from "@/components/ui";

const collections = [
  { title: "CSE Student Pack", desc: "Compiler, OS, DS&A essentials.", q: "compiler", tone: "indigo" as const },
  { title: "Career Boost", desc: "Interviews, habits, productivity.", q: "career", tone: "pink" as const },
  { title: "Bangla Classics", desc: "Timeless literature & novels.", q: "classic", tone: "amber" as const },
  { title: "AI/ML Starter", desc: "Beginner-friendly AI journey.", q: "ai", tone: "indigo" as const },
];

export default function CollectionsPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-8 shadow-soft">
        <h1 className="text-2xl font-semibold">Collections</h1>
        <p className="mt-2 text-sm text-slate-600">Curated shortcuts for fast shopping.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {collections.map((c) => (
          <Link key={c.title} href={`/books?q=${encodeURIComponent(c.q)}`}>
            <Card className="transition hover:-translate-y-0.5 hover:shadow-md">
              <CardContent className="pt-6">
                <Badge tone={c.tone}>Curated</Badge>
                <div className="mt-2 text-lg font-semibold">{c.title}</div>
                <div className="mt-1 text-sm text-slate-600">{c.desc}</div>
                <div className="mt-3 text-sm font-semibold">Explore →</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
