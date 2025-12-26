"use client";

import { useMemo, useState } from "react";
import { Button, Card, CardContent, Badge } from "@/components/ui";
import Link from "next/link";

type Quiz = { mood: "focus" | "relax" | "career" | "classic"; difficulty: "easy" | "medium" | "hard"; language: "Bangla" | "English" | "Any"; };

const rules = [
  { tags: ["productivity", "habits"], mood: "focus", difficulty: "easy" },
  { tags: ["ai", "ml", "career"], mood: "career", difficulty: "medium" },
  { tags: ["classic", "bangla literature"], mood: "classic", difficulty: "medium" },
  { tags: ["clean code", "software engineering"], mood: "career", difficulty: "hard" },
];

export default function BookMatchPage() {
  const [quiz, setQuiz] = useState<Quiz>({ mood: "focus", difficulty: "easy", language: "Any" });

  const recommendation = useMemo(() => {
    const score = (r: any) => (r.mood === quiz.mood ? 3 : 0) + (r.difficulty === quiz.difficulty ? 2 : 0);
    const best = [...rules].sort((a, b) => score(b) - score(a))[0];
    return best?.tags?.[0] ?? "habits";
  }, [quiz]);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-8 shadow-soft">
        <Badge tone="dark">Unique feature</Badge>
        <h1 className="mt-3 text-2xl font-semibold">BookMatch</h1>
        <p className="mt-2 text-sm text-slate-600">A fast quiz that recommends a keyword for quick discovery.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="text-sm font-semibold">Mood</div>
              <select value={quiz.mood} onChange={(e) => setQuiz({ ...quiz, mood: e.target.value as any })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
                <option value="focus">Focus / Productivity</option>
                <option value="relax">Relax / Light reading</option>
                <option value="career">Career / Skill-up</option>
                <option value="classic">Classic literature</option>
              </select>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-semibold">Difficulty</div>
              <select value={quiz.difficulty} onChange={(e) => setQuiz({ ...quiz, difficulty: e.target.value as any })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
                <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
              </select>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-semibold">Language</div>
              <select value={quiz.language} onChange={(e) => setQuiz({ ...quiz, language: e.target.value as any })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
                <option value="Any">Any</option><option value="Bangla">Bangla</option><option value="English">English</option>
              </select>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-slate-50 p-5">
            <div className="text-sm text-slate-600">Recommendation keyword</div>
            <div className="mt-1 text-2xl font-semibold">{recommendation}</div>
            <Link href={`/books?q=${encodeURIComponent(recommendation)}`} className="mt-3 inline-block"><Button>See recommended books</Button></Link>
            <div className="mt-2 text-xs text-slate-500">Upgrade path: AI embeddings + personalization.</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
