import Link from "next/link";
import { WalletConnect } from "@/components/wallet-connect";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Zap, GitBranch, Terminal } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-linear-to-br from-background via-background/95 to-muted/30">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-linear-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-black text-white shadow-md">
              T
            </div>
            <span className="text-xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              TRACE
            </span>
            <span className="hidden sm:inline-block text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
              Monad Testnet
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/projects">
              <Button variant="ghost" size="sm" className="font-medium">
                Dashboard
              </Button>
            </Link>
            <WalletConnect />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 container mx-auto px-4 py-20 md:py-32 flex flex-col items-center justify-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-indigo-400 text-xs font-mono mb-8 animate-fade-in">
          <Zap className="h-3.5 w-3.5 text-amber-400" />
          <span>Powered by Monad 1-Second Finality (`10,000+ TPS`)</span>
        </div>

        <h1 className="max-w-4xl text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-none text-foreground mb-6">
          Real-Time, Verified <br />
          <span className="bg-linear-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Proof of Contribution.
          </span>
        </h1>

        <p className="max-w-2xl text-lg sm:text-xl text-muted-foreground mb-10 leading-relaxed font-normal">
          Anchor your code commits, UI mockups, and collaborative milestones into immutable 1-second micro-checkpoints on Monad Testnet for less than `$0.0001`.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mb-20 w-full sm:w-auto">
          <Link href="/projects" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto px-8 h-12 text-base font-semibold shadow-lg shadow-primary/20 gap-2">
              Explore Dashboard
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <div className="w-full sm:w-auto">
            <WalletConnect />
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full text-left">
          <div className="p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-xs hover:border-primary/40 transition-all">
            <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4">
              <Terminal className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Instant Micro-Checkpoints</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Don&apos;t wait 12 seconds or pay `$5+` gas fees. Monad&apos;s sub-second block times make continuous development logging seamless.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-xs hover:border-primary/40 transition-all">
            <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-4">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Onchain Attribution</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every milestone is cryptographically signed and stored on Monad (`Chain ID 10143`), giving solo hackers and teams undisputed proof of creation.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-xs hover:border-primary/40 transition-all">
            <div className="h-12 w-12 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400 mb-4">
              <GitBranch className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Live Timeline Playback</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Watch your project evolve step-by-step. Replay commits, feature additions, and screenshot proofs directly from MonadVision.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground font-mono">
        TRACE &bull; BuildAnything Monad Hackathon &bull; Chain ID 10143
      </footer>
    </div>
  );
}
