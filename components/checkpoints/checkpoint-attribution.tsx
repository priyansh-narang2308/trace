"use client";

import { useState } from "react";
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
    setTimeout(() => setCopiedAddr(null), 2000);
  };

  if (compact) {
    return (
      <div className="flex items-center justify-between gap-2 text-[12px] font-mono text-[#9c9c9d] pt-2 border-t border-[#363739]/50 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[#e6e6e6] bg-[#111214] px-2 py-0.5 rounded border border-[#363739]">
            <Award className="h-3 w-3 text-[#ff6363]" />
            <span>@{creatorAddress.slice(0, 6)}...{creatorAddress.slice(-4)}</span>
          </span>
          {collaborators.length > 0 && (
            <span className="flex items-center gap-1 text-[#63a1ff] bg-[#1b1c1e] px-2 py-0.5 rounded border border-[#363739]">
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
              className="cursor-pointer text-[#59d499] hover:underline flex items-center gap-0.5 font-medium"
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
    <div className="rounded-[16px] bg-[#07080a] border border-[#363739] shadow-key p-5 space-y-4 font-mono">
      <div className="flex items-center justify-between pb-3 border-b border-[#363739]">
        <div className="flex items-center gap-2 text-[15px] font-sans font-medium text-[#ffffff]">
          <KeyRound className="h-4 w-4 text-[#ff6363]" />
          <span>Cryptographic Attribution Matrix</span>
        </div>
        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#1b1c1e] text-[#59d499] border border-[#363739] flex items-center gap-1">
          <ShieldCheck className="h-3 w-3 text-[#59d499]" />
          <span>Monad P-256 Enclave</span>
        </span>
      </div>

      <div className="space-y-3">
        <div className="text-[11px] text-[#9c9c9d] uppercase font-bold tracking-wider">Primary Milestone Signer</div>
        <div className="flex items-center justify-between p-3 rounded-lg bg-[#111214] border border-[#363739] hover:border-[#6a6b6c] transition-colors">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-8 w-8 rounded-full bg-[#ff6363]/10 border border-[#ff6363]/30 flex items-center justify-center text-[#ff6363] text-[12px] font-bold shrink-0">
              P1
            </div>
            <div className="overflow-hidden">
              <div className="text-[13px] font-medium text-[#ffffff] truncate">{creatorAddress}</div>
              <div className="text-[11px] text-[#59d499]">Primary Cryptographic Anchor</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => copyToClipboard(creatorAddress)}
            className="cursor-pointer p-2 text-[#9c9c9d] hover:text-[#ffffff] rounded hover:bg-[#1b1c1e] transition-colors shrink-0"
          >
            {copiedAddr === creatorAddress ? <Check className="h-4 w-4 text-[#59d499]" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {collaborators.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="text-[11px] text-[#9c9c9d] uppercase font-bold tracking-wider flex items-center justify-between">
            <span>Authorized Co-Signers (`{collaborators.length}`)</span>
            <span>Multi-Sig Consensus</span>
          </div>
          <div className="space-y-2">
            {collaborators.map((addr, idx) => (
              <div
                key={addr}
                className="flex items-center justify-between p-2.5 rounded-lg bg-[#111214]/60 border border-[#363739] hover:border-[#6a6b6c] transition-colors"
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="h-7 w-7 rounded-full bg-[#63a1ff]/10 border border-[#63a1ff]/30 flex items-center justify-center text-[#63a1ff] text-[11px] font-bold shrink-0">
                    C{idx + 1}
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-[12px] font-medium text-[#e6e6e6] truncate">{addr}</div>
                    <div className="text-[10px] text-[#9c9c9d]">Co-Signer Witness</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(addr)}
                  className="cursor-pointer p-1.5 text-[#9c9c9d] hover:text-[#ffffff] rounded hover:bg-[#1b1c1e] transition-colors shrink-0"
                >
                  {copiedAddr === addr ? <Check className="h-3.5 w-3.5 text-[#59d499]" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="pt-3 border-t border-[#363739] flex items-center justify-between text-[11px] text-[#6a6b6c]">
        <span>Anchored at `{new Date(timestamp).toLocaleString()}`</span>
        {txHash && txHash !== "0x" && (
          <a
            href={`https://testnet.monadexplorer.com/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer text-[#63a1ff] hover:underline flex items-center gap-1"
          >
            <span>Tx Receipt</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  );
}
