"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, Users, Copy, Check, ExternalLink, Award, KeyRound } from "lucide-react";

interface CheckpointAttributionProps {
  creatorAddress: string;
  collaborators?: string[];
  timestamp: string;
  txHash?: string | null;
  compact?: boolean;
}

export function CheckpointAttribution({
  creatorAddress,
  collaborators = [],
  timestamp,
  txHash,
  compact = false,
}: CheckpointAttributionProps) {
  const [copiedAddr, setCopiedAddr] = useState<string | null>(null);

  const copyToClipboard = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopiedAddr(addr);
    toast.success("Cryptographic address copied to clipboard!");
    setTimeout(() => setCopiedAddr(null), 2000);
  };

  if (compact) {
    return (
      <div className="flex items-center justify-between gap-2 text-[12px] font-mono text-ash pt-2 border-t border-border/50 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-mist bg-obsidian px-2 py-0.5 rounded border border-border">
            <Award className="h-3 w-3 text-coral-pulse" />
            <span>@{creatorAddress.slice(0, 6)}...{creatorAddress.slice(-4)}</span>
          </span>
          {collaborators.length > 0 && (
            <span className="flex items-center gap-1 text-electric-sky bg-graphite px-2 py-0.5 rounded border border-border">
              <Users className="h-3 w-3" />
              <span>+{collaborators.length} co-signers</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span>{new Date(timestamp).toLocaleTimeString()}</span>
          {txHash && txHash !== "0x" && (
            <a
              href={`https://testnet.monadexplorer.com/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer text-emerald-verify hover:underline flex items-center gap-0.5 font-medium"
            >
              <span>Verified</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[16px] bg-ink border border-border shadow-key p-5 space-y-4 font-mono">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-2 text-[15px] font-sans font-medium text-pure-white">
          <KeyRound className="h-4 w-4 text-coral-pulse" />
          <span>Cryptographic Attribution Matrix</span>
        </div>
        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-graphite text-emerald-verify border border-border flex items-center gap-1">
          <ShieldCheck className="h-3 w-3 text-emerald-verify" />
          <span>Monad P-256 Enclave</span>
        </span>
      </div>

      <div className="space-y-3">
        <div className="text-[11px] text-ash uppercase font-bold tracking-wider">Primary Milestone Signer</div>
        <div className="flex items-center justify-between p-3 rounded-lg bg-obsidian border border-border hover:border-smoke transition-colors">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-8 w-8 rounded-full bg-coral-pulse/10 border border-coral-pulse/30 flex items-center justify-center text-coral-pulse text-[12px] font-bold shrink-0">
              P1
            </div>
            <div className="overflow-hidden">
              <div className="text-[13px] font-medium text-pure-white truncate">{creatorAddress}</div>
              <div className="text-[11px] text-emerald-verify">Primary Cryptographic Anchor</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => copyToClipboard(creatorAddress)}
            className="cursor-pointer p-2 text-ash hover:text-pure-white rounded hover:bg-graphite transition-colors shrink-0"
          >
            {copiedAddr === creatorAddress ? <Check className="h-4 w-4 text-emerald-verify" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {collaborators.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="text-[11px] text-ash uppercase font-bold tracking-wider flex items-center justify-between">
            <span>Authorized Co-Signers (`{collaborators.length}`)</span>
            <span>Multi-Sig Consensus</span>
          </div>
          <div className="space-y-2">
            {collaborators.map((addr, idx) => (
              <div
                key={addr}
                className="flex items-center justify-between p-2.5 rounded-lg bg-obsidian/60 border border-border hover:border-smoke transition-colors"
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="h-7 w-7 rounded-full bg-electric-sky/10 border border-electric-sky/30 flex items-center justify-center text-electric-sky text-[11px] font-bold shrink-0">
                    C{idx + 1}
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-[12px] font-medium text-mist truncate">{addr}</div>
                    <div className="text-[10px] text-ash">Co-Signer Witness</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(addr)}
                  className="cursor-pointer p-1.5 text-ash hover:text-pure-white rounded hover:bg-graphite transition-colors shrink-0"
                >
                  {copiedAddr === addr ? <Check className="h-3.5 w-3.5 text-emerald-verify" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="pt-3 border-t border-border flex items-center justify-between text-[11px] text-smoke">
        <span>Anchored at `{new Date(timestamp).toLocaleString()}`</span>
        {txHash && txHash !== "0x" && (
          <a
            href={`https://testnet.monadexplorer.com/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer text-electric-sky hover:underline flex items-center gap-1"
          >
            <span>Tx Receipt</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  );
}
