"use client";

import { Loader2, Terminal, ShieldCheck } from "lucide-react";

interface ProjectSkeletonProps {
  variant?: "card" | "detail" | "list";
}

export function ProjectSkeleton({ variant = "card" }: ProjectSkeletonProps) {
  if (variant === "detail") {
    return (
      <div className="min-h-screen bg-void-black text-pure-white pb-24">
        <div className="sticky top-0 z-50 border-b border-border bg-void-black/80 backdrop-blur-xl">
          <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center gap-4">
            <div className="h-8 w-8 rounded-lg bg-graphite animate-pulse" />
            <div className="h-4 w-20 rounded bg-graphite animate-pulse" />
            <div className="h-4 w-px bg-border" />
            <div className="h-4 w-40 rounded bg-graphite animate-pulse" />
          </div>
        </div>
        <main className="max-w-[1200px] mx-auto px-6 py-8 space-y-8">
          <div className="p-6 rounded-[16px] bg-ink border border-border shadow-key space-y-4">
            <div className="h-8 w-64 rounded bg-graphite animate-pulse" />
            <div className="h-4 w-full max-w-lg rounded bg-graphite animate-pulse" />
            <div className="h-4 w-48 rounded bg-graphite animate-pulse" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 rounded-xl bg-ink border border-border shadow-key space-y-3">
                <div className="h-3 w-24 rounded bg-graphite animate-pulse" />
                <div className="h-8 w-16 rounded bg-graphite animate-pulse" />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-5 rounded-xl bg-ink border border-border shadow-key space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded bg-graphite animate-pulse" />
                    <div className="h-4 w-48 rounded bg-graphite animate-pulse" />
                  </div>
                  <div className="h-3 w-full rounded bg-graphite animate-pulse" />
                  <div className="h-3 w-3/4 rounded bg-graphite animate-pulse" />
                </div>
              ))}
            </div>
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="p-5 rounded-xl bg-ink border border-border shadow-key space-y-3">
                  <div className="h-4 w-32 rounded bg-graphite animate-pulse" />
                  <div className="h-3 w-full rounded bg-graphite animate-pulse" />
                  <div className="h-3 w-2/3 rounded bg-graphite animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (variant === "list") {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 rounded-xl bg-ink border border-border shadow-key flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-graphite animate-pulse shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-48 rounded bg-graphite animate-pulse" />
              <div className="h-3 w-full max-w-xs rounded bg-graphite animate-pulse" />
            </div>
            <div className="h-6 w-16 rounded bg-graphite animate-pulse shrink-0" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-6 rounded-xl bg-ink border border-border shadow-key space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-graphite animate-pulse" />
            <div className="space-y-2 flex-1">
              <div className="h-4 w-32 rounded bg-graphite animate-pulse" />
              <div className="h-3 w-20 rounded bg-graphite animate-pulse" />
            </div>
          </div>
          <div className="h-3 w-full rounded bg-graphite animate-pulse" />
          <div className="h-3 w-2/3 rounded bg-graphite animate-pulse" />
          <div className="flex items-center gap-2 pt-2">
            <div className="h-5 w-16 rounded bg-graphite animate-pulse" />
            <div className="h-5 w-16 rounded bg-graphite animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PageLoader({ message = "Syncing with Monad Testnet..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4">
      <div className="relative">
        <div className="h-12 w-12 rounded-xl bg-ink border border-border flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-coral-pulse" />
        </div>
        <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-verify animate-pulse" />
      </div>
      <div className="text-center space-y-1">
        <p className="text-[14px] font-medium text-pure-white font-sans">{message}</p>
        <p className="text-[12px] font-mono text-ash">
          Sub-second finality (~0.8s) · Chain ID 10143
        </p>
      </div>
    </div>
  );
}

export function InlineSpinner({ text = "Loading..." }: { text?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-ash font-mono text-[12px]">
      <Loader2 className="h-3 w-3 animate-spin text-coral-pulse" />
      <span>{text}</span>
    </span>
  );
}
