import React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-[rgb(var(--surface)/0.82)] backdrop-blur shadow-soft",
        "border-[rgb(var(--border)/0.70)]",
        className
      )}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-6 pb-6", className)} {...props} />;
}

export function Button({
  className, variant = "primary", ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger" }) {
  const styles =
    variant === "primary"
      ? "bg-brand-gradient text-white shadow-soft hover:opacity-95"
      : variant === "secondary"
      ? "border bg-[rgb(var(--surface))] hover:bg-[rgb(var(--surface)/0.92)] border-[rgb(var(--border)/0.85)]"
      : variant === "danger"
      ? "bg-rose-600 text-white hover:bg-rose-700"
      : "hover:bg-slate-100";
  return (
    <button
      className={cn("inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition disabled:opacity-50", styles, className)}
      {...props}
    />
  );
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-xl border bg-[rgb(var(--surface))] px-3 py-2 text-sm outline-none",
        "border-[rgb(var(--border)/0.85)]",
        "focus:ring-2 focus:ring-[rgb(var(--ring)/0.35)] focus:border-[rgb(var(--ring)/0.55)]",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-xl border bg-[rgb(var(--surface))] px-3 py-2 text-sm outline-none",
        "border-[rgb(var(--border)/0.85)]",
        "focus:ring-2 focus:ring-[rgb(var(--ring)/0.35)] focus:border-[rgb(var(--ring)/0.55)]",
        className
      )}
      {...props}
    />
  );
}

export function Badge({ className, tone = "neutral", ...props }: React.HTMLAttributes<HTMLSpanElement> & { tone?: "neutral" | "indigo" | "pink" | "amber" | "dark" }) {
  const t =
    tone === "indigo"
      ? "bg-blue-50 text-blue-700 border-blue-100"
      : tone === "pink"
      ? "bg-pink-50 text-pink-700 border-pink-100"
      : tone === "amber"
      ? "bg-amber-50 text-amber-800 border-amber-100"
      : tone === "dark"
      ? "bg-slate-900 text-white border-slate-900"
      : "bg-slate-50 text-slate-700 border-slate-200";
  return <span className={cn("inline-flex items-center rounded-full border px-3 py-1 text-xs", t, className)} {...props} />;
}
