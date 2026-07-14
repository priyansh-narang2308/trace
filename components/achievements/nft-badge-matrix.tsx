"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Award,
  ShieldCheck,
  Sparkles,
  Zap,
  CheckCircle2,
  Lock,
  ExternalLink,
  Loader2,
  Trophy,
  Flame,
} from "lucide-react";

interface BadgeItem {
  id: string;
  title: string;
  description: string;
  tier: "COMMON" | "RARE" | "EPIC" | "LEGENDARY" | "MYTHIC";
  xpReward: number;
  mintAddress: string | null;
  unlocked: boolean;
  progress: number;
}

const TIER_STYLES: Record<string, { badgeBg: string; border: string; text: string; glow: string }> = {
  LEGENDARY: {
    badgeBg: "bg-coral-pulse/15",
    border: "border-coral-pulse/60",
    text: "text-coral-pulse",
    glow: "shadow-[0_0_20px_rgba(255,99,99,0.25)]",
  },
  MYTHIC: {
    badgeBg: "bg-purple-500/15",
    border: "border-purple-500/60",
    text: "text-purple-400",
    glow: "shadow-[0_0_20px_rgba(168,85,247,0.25)]",
  },
  EPIC: {
    badgeBg: "bg-electric-sky/15",
    border: "border-electric-sky/60",
    text: "text-electric-sky",
    glow: "shadow-[0_0_15px_rgba(99,161,255,0.2)]",
  },
  RARE: {
    badgeBg: "bg-emerald-verify/15",
    border: "border-emerald-verify/60",
    text: "text-emerald-verify",
    glow: "shadow-[0_0_15px_rgba(89,212,153,0.2)]",
  },
  COMMON: {
    badgeBg: "bg-graphite",
    border: "border-border",
    text: "text-ash",
    glow: "",
  },
};

export function NftBadgeMatrix() {
  const { address, isConnected } = useAccount();
  const [badges, setBadges] = useState<BadgeItem[]>([]);
  const [totalXp, setTotalXp] = useState(1100);
  const [isLoading, setIsLoading] = useState(true);
  const [mintingId, setMintingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadBadges() {
      try {
        const res = await fetch(`/api/achievements?address=${address || "0xAnonymous"}`);
        if (res.ok) {
          const data = await res.json();
          setBadges(data.badges || []);
          if (data.totalXp) setTotalXp(data.totalXp);
        }
      } catch (err) {
        console.error("Failed to load badges:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadBadges();
  }, [address]);

  const claimBadge = async (badgeId: string, title: string) => {
    if (!isConnected || !address) {
      toast.error("Connect your Monad wallet to claim NFT contribution badges!");
      return;
    }

    setMintingId(badgeId);
    toast.info(`Initiating NFT Badge mint for '${title}'...`);

    try {
      const res = await fetch("/api/achievements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ badgeId, address }),
      });

      if (!res.ok) throw new Error("Failed to mint NFT badge");

      const data = await res.json();

      setBadges((prev) =>
        prev.map((b) =>
          b.id === badgeId
            ? { ...b, mintAddress: b.mintAddress || "0x0100000000000000000000000000000000000000" }
            : b
        )
      );

      toast.success(`NFT Badge '${title}' successfully minted to Monad Testnet! (` + (data.mintTxHash ? `${data.mintTxHash.slice(0, 8)}...` : "Confirmed") + `)`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error claiming badge";
      toast.error(msg);
    } finally {
      setMintingId(null);
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-ink border border-border p-8 text-center font-mono text-ash">
        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-3 text-coral-pulse" />
        <span>Loading TRACE Proof-of-Contribution Achievement Matrix...</span>
      </Card>
    );
  }

  return (
    <Card className="bg-ink border border-border shadow-key overflow-hidden">
      <CardHeader className="pb-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <CardTitle className="text-[18px] font-medium text-pure-white flex items-center gap-2 font-sans">
            <Trophy className="h-5 w-5 text-coral-pulse" />
            <span>Monad Contribution NFT Badges</span>
          </CardTitle>
          <p className="text-[12px] font-mono text-ash mt-1">
            Earn verifiable on-chain reputation badges and P-256 precompile attestations for active code shipping.
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-[13px] self-start sm:self-auto">
          <div className="px-3 py-1.5 rounded-xl bg-obsidian border border-border flex items-center gap-2">
            <Flame className="h-4 w-4 text-coral-pulse" />
            <span className="text-pure-white font-bold">{totalXp}</span>
            <span className="text-ash">Enclave XP</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-mono">
          {badges.map((badge) => {
            const style = TIER_STYLES[badge.tier] || TIER_STYLES.COMMON;
            const isMinting = mintingId === badge.id;

            return (
              <div
                key={badge.id}
                className={`p-5 rounded-2xl bg-obsidian border transition-all duration-200 flex flex-col justify-between ${
                  badge.unlocked
                    ? `${style.border} ${style.glow}`
                    : "border-border/60 opacity-60 hover:opacity-90"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`h-11 w-11 rounded-xl flex items-center justify-center border ${style.badgeBg} ${style.border} ${style.text} shrink-0`}
                      >
                        {badge.unlocked ? (
                          <Award className="h-6 w-6" />
                        ) : (
                          <Lock className="h-5 w-5 opacity-60" />
                        )}
                      </div>
                      <div>
                        <div className="font-sans font-bold text-[15px] text-pure-white leading-tight">
                          {badge.title}
                        </div>
                        <div className={`text-[11px] font-bold tracking-wider mt-0.5 ${style.text}`}>
                          {badge.tier} TIER
                        </div>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-graphite text-electric-sky border border-border shrink-0">
                      +{badge.xpReward} XP
                    </span>
                  </div>

                  <p className="text-[12px] text-mist font-sans leading-relaxed">
                    {badge.description}
                  </p>

                  {!badge.unlocked && (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-[11px] text-ash">
                        <span>Milestone Progress</span>
                        <span className="font-bold text-pure-white">{badge.progress}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-graphite overflow-hidden">
                        <div
                          className="h-full bg-electric-sky transition-all duration-300"
                          style={{ width: `${badge.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-5 mt-4 border-t border-border flex items-center justify-between">
                  {badge.mintAddress ? (
                    <div className="flex items-center justify-between w-full">
                      <span className="flex items-center gap-1.5 text-emerald-verify font-bold text-[12px]">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Attested On-Chain</span>
                      </span>
                      <a
                        href={`https://testnet.monadexplorer.com/address/${badge.mintAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          e.stopPropagation();
                          toast.info(`Inspecting NFT Badge contract ${badge.mintAddress?.slice(0, 10)}...`);
                        }}
                        className="cursor-pointer text-electric-sky hover:underline text-[12px] flex items-center gap-1"
                      >
                        <span>Token Contract</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  ) : badge.unlocked ? (
                    <Button
                      type="button"
                      onClick={() => claimBadge(badge.id, badge.title)}
                      disabled={isMinting}
                      className="cursor-pointer w-full bg-coral-pulse hover:bg-coral-pulse/90 text-void-black font-bold font-mono text-[12px] h-9 rounded-xl shadow-sm gap-2"
                    >
                      {isMinting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Attesting to Monad...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          <span>Claim NFT Badge (`0x0100`)</span>
                        </>
                      )}
                    </Button>
                  ) : (
                    <div className="w-full text-center text-[12px] text-ash py-1 font-mono">
                      Locked (`Complete milestone requirements`)
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
