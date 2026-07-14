"use client";

import { TxResult, TxStatus } from "@/hooks/use-monad-checkpoint-tx";
import { Loader2, CheckCircle2, AlertCircle, ExternalLink, Clock, Fuel, Layers } from "lucide-react";

interface TxConfirmationProps {
  txResult: TxResult;
}

const STATUS_CONFIG: Record<TxStatus, { label: string; sublabel: string; color: string }> = {
  IDLE: { label: "Awaiting Action", sublabel: "Submit a checkpoint to begin", color: "#9c9c9d" },
  PREPARING: { label: "Preparing Transaction", sublabel: "Encoding checkpoint data for Monad Testnet...", color: "#63a1ff" },
  INIT_PROJECT: { label: "Initializing Project On-Chain", sublabel: "Creating project on Monad Testnet before checkpoint...", color: "#ff6363" },
  SIGNING: { label: "Awaiting Signature", sublabel: "Confirm the transaction in your wallet...", color: "#ff6363" },
  PENDING: { label: "Transaction Pending", sublabel: "Waiting for Monad 1-second finality...", color: "#63a1ff" },
  CONFIRMED: { label: "Checkpoint Anchored", sublabel: "Successfully finalized on Monad Testnet", color: "#59d499" },
  FAILED: { label: "Transaction Failed", sublabel: "The checkpoint could not be anchored", color: "#ff6363" },
};

export function TxConfirmation({ txResult }: TxConfirmationProps) {
  const config = STATUS_CONFIG[txResult.status];

  if (txResult.status === "IDLE") return null;

  return (
    <div className="rounded-[16px] bg-[#07080a] border border-[#363739] shadow-key overflow-hidden">
      <div className="p-4 border-b border-[#363739] flex items-center gap-3">
        <div className="relative">
          {txResult.status === "CONFIRMED" ? (
            <CheckCircle2 className="h-6 w-6" style={{ color: config.color }} />
          ) : txResult.status === "FAILED" ? (
            <AlertCircle className="h-6 w-6" style={{ color: config.color }} />
          ) : (
            <div className="relative">
              <Loader2 className="h-6 w-6 animate-spin" style={{ color: config.color }} />
              <div
                className="absolute inset-0 rounded-full animate-ping opacity-20"
                style={{ backgroundColor: config.color }}
              />
            </div>
          )}
        </div>
        <div>
          <div className="text-[14px] font-medium text-[#ffffff]">{config.label}</div>
          <div className="text-[12px] font-mono text-[#9c9c9d]">{config.sublabel}</div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {txResult.status === "PENDING" && (
          <div className="space-y-2">
            <div className="h-1 rounded-full bg-[#111214] overflow-hidden">
              <div className="h-full rounded-full bg-[#63a1ff] animate-pulse w-3/4" />
            </div>
            <div className="text-[11px] font-mono text-[#6a6b6c] text-center">
              Sub-second finality in progress...
            </div>
          </div>
        )}

        {txResult.txHash && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-[#111214] border border-[#363739]">
            <div className="flex items-center gap-2 overflow-hidden">
              <Clock className="h-4 w-4 text-[#63a1ff] shrink-0" />
              <div className="overflow-hidden">
                <div className="text-[11px] font-mono text-[#9c9c9d] uppercase">Transaction Hash</div>
                <div className="text-[13px] font-mono text-[#ffffff] truncate">
                  {txResult.txHash.slice(0, 10)}...{txResult.txHash.slice(-8)}
                </div>
              </div>
            </div>
            <a
              href={`https://testnet.monadexplorer.com/tx/${txResult.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#1b1c1e] border border-[#363739] text-[11px] font-mono text-[#e6e6e6] hover:text-[#ffffff] hover:border-[#6a6b6c] transition-all"
            >
              <span>Explorer</span>
              <ExternalLink className="h-3 w-3 text-[#ff6363]" />
            </a>
          </div>
        )}

        {txResult.status === "CONFIRMED" && (
          <div className="grid grid-cols-2 gap-3">
            {txResult.gasUsed && (
              <div className="p-3 rounded-lg bg-[#111214] border border-[#363739]">
                <div className="flex items-center gap-1.5 mb-1">
                  <Fuel className="h-3.5 w-3.5 text-[#ff6363]" />
                  <span className="text-[11px] font-mono text-[#9c9c9d] uppercase">Gas Used</span>
                </div>
                <div className="text-[14px] font-mono font-medium text-[#ffffff]">
                  {Number(txResult.gasUsed).toLocaleString()}
                </div>
              </div>
            )}
            {txResult.blockNumber && (
              <div className="p-3 rounded-lg bg-[#111214] border border-[#363739]">
                <div className="flex items-center gap-1.5 mb-1">
                  <Layers className="h-3.5 w-3.5 text-[#63a1ff]" />
                  <span className="text-[11px] font-mono text-[#9c9c9d] uppercase">Block</span>
                </div>
                <div className="text-[14px] font-mono font-medium text-[#ffffff]">
                  #{Number(txResult.blockNumber).toLocaleString()}
                </div>
              </div>
            )}
          </div>
        )}

        {txResult.error && (
          <div className="p-3 rounded-lg bg-[#1b1c1e] border border-[#ff6363]/40 text-[12px] font-mono text-[#ff6363] flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span className="leading-[1.5]">{txResult.error}</span>
          </div>
        )}
      </div>

      {txResult.status === "CONFIRMED" && (
        <div className="px-4 py-3 border-t border-[#363739] flex items-center justify-between text-[11px] font-mono text-[#6a6b6c]">
          <span>Monad Testnet · Chain ID 10143</span>
          <span className="text-[#59d499]">1-Second Finality ✓</span>
        </div>
      )}
    </div>
  );
}
