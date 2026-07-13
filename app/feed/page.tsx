import { SocialFeed } from "@/components/feed/social-feed";
import { Sparkles, Radio, ShieldCheck, Flame } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SocialFeedPage() {
  return (
    <div className="min-h-screen bg-void-black text-pure-white font-sans selection:bg-coral-pulse/30 selection:text-pure-white pb-24">
      <header className="sticky top-0 z-50 border-b border-border bg-void-black/80 backdrop-blur-xl">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2.5 cursor-pointer">
              <div className="h-8 w-8 rounded-lg bg-coral-pulse flex items-center justify-center font-mono font-bold text-[16px] text-void-black shadow-sm">
                T
              </div>
              <span className="font-mono text-[16px] font-bold tracking-tight text-pure-white">
                TRACE
              </span>
            </Link>
            <div className="h-4 w-px bg-border" />
            <span className="font-mono text-[13px] text-coral-pulse flex items-center gap-1.5 font-medium">
              <Radio className="h-4 w-4 animate-pulse" />
              <span>Monad Testnet Enclave Stream</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/projects">
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer font-mono text-[13px] bg-obsidian hover:bg-graphite border-border text-pure-white"
              >
                Explore Projects
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-[1000px] mx-auto px-6 py-8 space-y-8">
        <div className="p-6 rounded-[20px] bg-ink border border-border shadow-key flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase bg-graphite text-coral-pulse border border-border">
                Live Stream
              </span>
              <span className="text-[12px] font-mono text-ash flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-verify" />
                <span>Verified via Monad Secp256r1 P-256 Precompile</span>
              </span>
            </div>
            <h1 className="text-[32px] font-medium tracking-tight text-pure-white font-sans">
              Monad Cryptographic Contribution Feed
            </h1>
            <p className="text-[14px] font-mono text-mist max-w-2xl leading-[1.6]">
              Sub-second milestone anchors, verified git diff proofs, and real-time team collaboration matrix updates across decentralized Monad Testnet enclaves.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-obsidian border border-border shrink-0 font-mono text-[13px] space-y-2">
            <div className="flex items-center justify-between gap-4 text-ash">
              <span>Finality Window:</span>
              <span className="text-emerald-verify font-bold">`~0.8s`</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-ash">
              <span>Verified Anchors:</span>
              <span className="text-pure-white font-bold">`4,921+`</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-ash">
              <span>Active Signers:</span>
              <span className="text-electric-sky font-bold">`382 Nodes`</span>
            </div>
          </div>
        </div>

        <SocialFeed />
      </main>
    </div>
  );
}
