"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { motion, type Variants } from "framer-motion";
import { WalletConnect } from "@/components/wallet-connect";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ShieldCheck,
  Terminal,
  Layers,
  Menu,
  X,
  Sparkles,
  Command,
  Cpu,
  Zap,
} from "lucide-react";
import Lightfall from "@/components/Lightfall";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: "easeOut" as const },
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-void-black text-pure-white font-sans selection:bg-coral-pulse/30 selection:text-white relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden w-full h-screen style={{ willChange: 'transform' }}">
        <Lightfall
          className="w-full h-full"
          colors={["#FF2A2A", "#FF6363", "#991111"]}
          backgroundColor="#040506"
          speed={0.6}
          streakCount={3}
          streakWidth={1.2}
          glow={1.4}
          zoom={3}
        />
      </div>

      <div className="sticky top-4 z-50 px-4 max-w-5xl mx-auto w-full">
        <motion.header
          initial={{ y: -35, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" as const }}
          className="flex items-center justify-between px-5 py-3 rounded-full border border-border bg-void-black/80 backdrop-blur-xl shadow-key"
        >
          <Link href="/" className="flex items-center gap-2.5 cursor-pointer">
            <div className="h-5 w-5 rounded-xs bg-coral-pulse rotate-45 shrink-0 flex items-center justify-center shadow-sm" />
            <span className="text-sm font-medium tracking-tight text-pure-white font-sans">
              TRACE
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-[13px] font-medium text-ash">
            <Link
              href="/projects"
              className="transition-colors cursor-pointer hover:text-pure-white"
            >
              Dashboard
            </Link>
            <a
              href="https://docs.monad.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors cursor-pointer hover:text-pure-white"
            >
              Monad Docs
            </a>
            <span
              onClick={() => toast.info("Monad Testnet active on Chain ID 10143")}
              className="text-[11px] uppercase font-mono px-2 py-0.5 rounded bg-obsidian text-ash border cursor-pointer border-border"
            >
              Chain 10143
            </span>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/projects">
              <Button className="bg-pure-white cursor-pointer hover:bg-mist text-void-black font-semibold text-[14px] px-6 h-11 rounded-xl shadow-lg transition-all hover:scale-[1.02]">
                Open Dashboard
              </Button>
            </Link>
            <WalletConnect />
          </div>

          <div className="flex md:hidden items-center gap-2">
            <WalletConnect />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="h-10 w-10 rounded-xl bg-obsidian border border-border flex items-center justify-center text-pure-white cursor-pointer hover:bg-graphite transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </motion.header>

        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.25, ease: "easeOut" as const }}
            className="md:hidden mt-3 p-5 rounded-3xl bg-void-black/95 backdrop-blur-xl border border-border shadow-key space-y-4 font-sans"
          >
            <nav className="flex flex-col gap-3 text-[14px] font-medium text-ash">
              <Link
                href="/projects"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-pure-white transition-colors py-1 cursor-pointer"
              >
                Dashboard
              </Link>
              <a
                href="https://docs.monad.xyz"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-pure-white transition-colors py-1 cursor-pointer"
              >
                Monad Docs
              </a>
              <div className="pt-1 flex items-center justify-between">
                <span className="text-ash text-[12px]">Network</span>
                <span className="text-[11px] uppercase font-mono px-2 py-0.5 rounded bg-obsidian text-emerald-verify border border-border">
                  Chain 10143
                </span>
              </div>
            </nav>
            <div className="pt-3 border-t border-border">
              <Link href="/projects" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-pure-white cursor-pointer hover:bg-mist text-void-black font-semibold text-[14px] h-11 rounded-xl shadow-lg">
                  Open Dashboard
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>

      <main className="flex-1 max-w-[1200px] mx-auto px-6 pt-28 pb-24 flex flex-col items-center justify-center text-center relative z-10 w-full">
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 24 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" as const }}
          className="w-full max-w-4xl mx-auto bg-void-black/90 backdrop-blur-xl border border-border/90 shadow-[0_0_120px_rgba(4,5,6,0.98)] px-8 py-12 sm:px-16 sm:py-16 rounded-[36px] relative mb-12 text-center"
        >
          <h1 className="text-[44px] sm:text-[62px] font-medium tracking-[0.2px] leading-[1.12] text-pure-white mb-6 font-sans drop-shadow-[0_2px_15px_rgba(0,0,0,1)]">
            Your shortcut to <br className="hidden sm:inline" />
            <span className="inline-block mt-2 bg-[#140608] border border-coral-pulse/60 shadow-[0_0_45px_rgba(255,42,42,0.4)] text-[#ff3838] font-semibold px-6 py-2 rounded-2xl tracking-tight">
              onchain proof of contribution.
            </span>
          </h1>

          <p className="max-w-xl mx-auto text-[17px] text-pure-white/80 mb-2 leading-[1.65] font-normal drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
            Anchor git milestones, UI captures, and collaborative hackathon
            progress into immutable sub-second checkpoints on Monad Testnet
            without friction.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" as const }}
          className="flex flex-col sm:flex-row items-center gap-3.5 mb-28"
        >
          <Link href="/projects" className="w-full sm:w-auto">
            <Button className="bg-mist hover:bg-pure-white text-void-black text-[14px] font-medium px-6 h-11 rounded-lg shadow-sm gap-2 cursor-pointer transition-all w-full sm:w-auto">
              <span>Launch Command Center</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <div className="w-full sm:w-auto cursor-pointer">
            <WalletConnect />
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1100px] w-full text-left mb-28"
        >
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="p-6 rounded-[16px] bg-ink/80 backdrop-blur-md border border-border shadow-key transition-all hover:border-smoke group cursor-pointer"
          >
            <div className="h-12 w-12 rounded-full bg-obsidian border border-border flex items-center justify-center text-mist mb-5 group-hover:border-coral-pulse transition-colors">
              <Terminal className="h-5 w-5 text-coral-pulse" />
            </div>
            <h3 className="text-[20px] font-medium text-pure-white mb-2 leading-[1.2]">
              Sub-Second Milestones
            </h3>
            <p className="text-[16px] text-ash leading-[1.6] font-normal">
              Eliminate block delays. Monad&apos;s high-throughput architecture
              logs real-time developer activity instantly.
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="p-6 rounded-[16px] bg-ink/80 backdrop-blur-md border border-border shadow-key transition-all hover:border-smoke group cursor-pointer"
          >
            <div className="h-12 w-12 rounded-full bg-obsidian border border-border flex items-center justify-center text-mist mb-5 group-hover:border-electric-sky transition-colors">
              <ShieldCheck className="h-5 w-5 text-electric-sky" />
            </div>
            <h3 className="text-[20px] font-medium text-pure-white mb-2 leading-[1.2]">
              P-256 Precompile Security
            </h3>
            <p className="text-[16px] text-ash leading-[1.6] font-normal">
              Native secp256r1 hardware passkey verification at `0x0100`
              guarantees cryptographically undeniable authorship.
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="p-6 rounded-[16px] bg-ink/80 backdrop-blur-md border border-border shadow-key transition-all hover:border-smoke group cursor-pointer"
          >
            <div className="h-12 w-12 rounded-full bg-obsidian border border-border flex items-center justify-center text-mist mb-5 group-hover:border-emerald-verify transition-colors">
              <Layers className="h-5 w-5 text-emerald-verify" />
            </div>
            <h3 className="text-[20px] font-medium text-pure-white mb-2 leading-[1.2]">
              Collaborative Ledger
            </h3>
            <p className="text-[16px] text-ash leading-[1.6] font-normal">
              Co-sign project milestones with teammates while retaining
              individual wallet attribution on every transaction.
            </p>
          </motion.div>
        </motion.div>

    
      </main>

      <div className="w-full relative overflow-hidden bg-void-black pt-20 pb-8 border-t border-border select-none z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut" as const }}
          className="w-full flex items-center justify-center mb-10 overflow-hidden px-4"
        >
          <div className="text-[100px] sm:text-[170px] md:text-[240px] font-mono font-extrabold tracking-tighter text-pure-white/6 leading-none hover:text-coral-pulse/15 transition-all duration-700 cursor-default text-center">
            TRACE
          </div>
        </motion.div>

        <div className="max-w-[1200px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] font-mono text-ash pt-6 border-t border-border">
          <span>
            © 2026 TRACE Enclave Ledger. Built for Monad Testnet (`Chain ID
            10143`).
          </span>
          <div className="flex items-center gap-4">
            <span>TRACE v1.0.0</span>
            <span>|</span>
            <span>Powered by P-256 Precompiles</span>
          </div>
        </div>
      </div>
    </div>
  );
}
