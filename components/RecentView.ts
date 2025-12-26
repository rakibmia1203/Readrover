"use client";
const KEY = "readrover_recent_v2";

export function pushRecent(slug: string) {
  if (typeof window === "undefined") return;
  const raw = window.localStorage.getItem(KEY);
  let arr: string[] = [];
  try { if (raw) arr = JSON.parse(raw); } catch {}
  arr = [slug, ...arr.filter((x) => x !== slug)].slice(0, 12);
  window.localStorage.setItem(KEY, JSON.stringify(arr));
}

export function getRecent(): string[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(KEY);
  try { return raw ? JSON.parse(raw) : []; } catch { return []; }
}
