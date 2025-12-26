"use client";
import { useEffect } from "react";
import { pushRecent } from "@/components/RecentView";
export default function ClientRecent({ slug }: { slug: string }) {
  useEffect(() => { pushRecent(slug); }, [slug]);
  return null;
}
