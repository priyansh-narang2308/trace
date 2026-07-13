import Link from "next/link";
import { WalletConnect } from "@/components/wallet-connect";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Zap, Terminal, Layers } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-void-black text-pure-white font-sans selection:bg-coral-pulse/30 selection:text-white">
      <div className="sticky top-4 z-50 px-4 max-w-5xl mx-auto w-full">
        <header className="flex items-center justify-between px-5 py-3 rounded-full border border-[#363739] bg-void-black/80 backdrop-blur-xl shadow-key-subtle">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-5 w-5 rounded-xs bg-coral-pulse rotate-45 shrink-0 flex items-center justify-center shadow-sm" />
            <span className="text-sm font-medium tracking-tight text-pure-white font-sans">
              TRACE
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-[13px] font-medium text-ash">
            <Link
              href="/projects"
              className="transition-colors hover:text-pure-white"
            >
              Dashboard
            </Link>
            <a
              href="https://docs.monad.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-[#ffffff]"
            >
              Monad Docs
            </a>
            <span className="text-[11px] uppercase font-mono px-2 py-0.5 rounded bg-[#1b1c1e] text-[#9c9c9d] border border-[#363739]">
              Chain 10143
            </span>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/projects">
              <Button className="bg-[#e6e6e6] hover:bg-[#ffffff] text-[#111214] font-medium text-[13px] px-3.5 py-1.5 h-8 rounded-lg shadow-sm transition-all">
                Open Dashboard
              </Button>
            </Link>
            <WalletConnect />
          </div>
        </header>
      </div>

      <main className="flex-1 max-w-[1200px] mx-auto px-6 pt-24 pb-32 flex flex-col items-center justify-center text-center relative overflow-hidden w-full">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-linear-to-tr from-[#143ca3]/40 via-[#63a1ff]/20 to-[#ff6363]/30 blur-[90px] pointer-events-none rounded-full" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[150px] bg-[#ff6363]/25 blur-[70px] pointer-events-none rounded-full rotate-12" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1b1c1e] border border-[#363739] text-[#e6e6e6] text-[12px] font-mono mb-8 relative z-10 shadow-sm">
          <Zap className="h-3.5 w-3.5 text-[#ff6363]" />
          <span>Monad 1-Second Finality &bull; `$0.0001` Gas Fees</span>
        </div>

        <h1 className="max-w-4xl text-[44px] sm:text-[56px] font-normal tracking-[0.22px] leading-[1.17] text-[#ffffff] mb-6 relative z-10 font-sans">
          Your shortcut to <br className="hidden sm:inline" />
          <span className="text-[#ff6363] font-normal">
            onchain proof of contribution.
          </span>
        </h1>

        <p className="max-w-xl text-[16px] text-[#9c9c9d] mb-10 leading-[1.6] font-normal relative z-10">
          Anchor git milestones, UI captures, and collaborative hackathon
          progress into immutable sub-second checkpoints on Monad Testnet
          without friction.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3.5 mb-24 relative z-10">
          <Link href="/projects" className="w-full sm:w-auto">
            <Button className="bg-[#e6e6e6] hover:bg-[#ffffff] text-[#111214] text-[14px] font-medium px-6 h-11 rounded-lg shadow-sm gap-2 transition-all w-full sm:w-auto">
              <span>Launch Command Center</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <div className="w-full sm:w-auto">
            <WalletConnect />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1100px] w-full text-left relative z-10">
          <div className="p-6 rounded-[16px] bg-[#07080a] border border-[#363739] shadow-key transition-all hover:border-[#6a6b6c] group">
            <div className="h-12 w-12 rounded-full bg-[#111214] border border-[#363739] flex items-center justify-center text-[#e6e6e6] mb-5 group-hover:border-[#ff6363] transition-colors">
              <Terminal className="h-5 w-5 text-[#ff6363]" />
            </div>
            <h3 className="text-[20px] font-medium text-[#ffffff] mb-2 leading-[1.2]">
              Sub-Second Milestones
            </h3>
            <p className="text-[16px] text-[#9c9c9d] leading-[1.6] font-normal">
              Eliminate block delays. Monad&apos;s high-throughput architecture
              logs real-time developer activity instantly.
            </p>
          </div>

          <div className="p-6 rounded-[16px] bg-[#07080a] border border-[#363739] shadow-key transition-all hover:border-[#6a6b6c] group">
            <div className="h-12 w-12 rounded-full bg-[#111214] border border-[#363739] flex items-center justify-center text-[#e6e6e6] mb-5 group-hover:border-[#63a1ff] transition-colors">
              <ShieldCheck className="h-5 w-5 text-[#63a1ff]" />
            </div>
            <h3 className="text-[20px] font-medium text-[#ffffff] mb-2 leading-[1.2]">
              P-256 Precompile Security
            </h3>
            <p className="text-[16px] text-[#9c9c9d] leading-[1.6] font-normal">
              Native secp256r1 hardware passkey verification at `0x0100`
              guarantees cryptographically undeniable authorship.
            </p>
          </div>

          <div className="p-6 rounded-[16px] bg-[#07080a] border border-[#363739] shadow-key transition-all hover:border-[#6a6b6c] group">
            <div className="h-12 w-12 rounded-full bg-[#111214] border border-[#363739] flex items-center justify-center text-[#e6e6e6] mb-5 group-hover:border-[#59d499] transition-colors">
              <Layers className="h-5 w-5 text-[#59d499]" />
            </div>
            <h3 className="text-[20px] font-medium text-[#ffffff] mb-2 leading-[1.2]">
              Collaborative Ledger
            </h3>
            <p className="text-[16px] text-[#9c9c9d] leading-[1.6] font-normal">
              Co-sign project milestones with teammates while retaining
              individual wallet attribution on every transaction.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-[#363739] py-8 text-center bg-[#040506]">
        <div className="flex items-center justify-center gap-3 text-[12px] font-mono text-[#6a6b6c] tracking-tight">
          <span>TRACE v1.0.0</span>
          <span>|</span>
          <span>Monad Testnet (`Chain ID 10143`)</span>
          <span>|</span>
          <span>Powered by P-256 Precompiles</span>
        </div>
      </footer>
    </div>
  );
}
