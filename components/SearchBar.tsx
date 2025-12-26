"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Button, Input } from "@/components/ui";

export default function SearchBar({ placeholder }: { placeholder?: string }) {
  const router = useRouter();
  const sp = useSearchParams();
  const initial = useMemo(() => sp.get("q") ?? "", [sp]);
  const [q, setQ] = useState(initial);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(sp.toString());
    if (q.trim()) params.set("q", q.trim());
    else params.delete("q");
    params.delete("page");
    router.push(`/books?${params.toString()}`);
  }

  return (
    <form onSubmit={submit} className="flex gap-2">
      <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder ?? "Search title, author, tags..."} />
      <Button variant="secondary">Search</Button>
    </form>
  );
}
