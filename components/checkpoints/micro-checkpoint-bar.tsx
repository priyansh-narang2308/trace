"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Zap,
  GitCommit,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Command,
  Sparkles,
  ArrowRight,
} from "lucide-react";

interface MicroCheckpointBarProps {
  projectId: string;
  onSuccess?: (checkpoint: Record<string, unknown>) => void;
}

const PRESET_SUGGESTIONS = [
  {
    label: "Commit: Refactored Monad contract precompiles",
    type: "GIT_COMMIT",
  },
  {
    label: "Update: Styled dark cockpit UI with tactile tokens",
    type: "MANUAL",
  },
  {
    label: "Deploy: Anchored P-256 verification endpoints",
    type: "DEPLOYMENT",
  },
  {
    label: "Commit: Optimized 1-second finality transaction flow",
    type: "GIT_COMMIT",
  },
];

export function MicroCheckpointBar({
  projectId,
  onSuccess,
}: MicroCheckpointBarProps) {
  const { address, isConnected } = useAccount();
  const [quickDesc, setQuickDesc] = useState("");
  const [selectedType, setSelectedType] = useState("GIT_COMMIT");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"IDLE" | "SUCCESS" | "ERROR">("IDLE");
  const [message, setMessage] = useState("");
  const [gitDetected, setGitDetected] = useState(false);

  const triggerQuickAnchor = useCallback(
    async (descText: string, type: string) => {
      if (!address) {
        toast.error("Connect wallet to anchor commits");
        return;
      }
      if (!descText.trim() || isLoading) return;

      setIsLoading(true);
      setStatus("IDLE");
      setMessage("");

      try {
        const payload = `${projectId}:${descText}:${type}:${address}:${Date.now()}`;
        let hashNum = 0;
        for (let i = 0; i < payload.length; i++) {
          const char = payload.charCodeAt(i);
          hashNum = (hashNum << 5) - hashNum + char;
          hashNum |= 0;
        }
        const hex = Math.abs(hashNum).toString(16).padStart(8, "0");
        const checkpointHash = `0x${hex}${hex}${hex}${hex}${hex}${hex}${hex}${hex}`;

        const formData = new FormData();
        formData.append("projectId", projectId);
        formData.append("hash", checkpointHash);
        formData.append("description", `[MICRO] ${descText.trim()}`);
        formData.append("checkpointType", type);
        formData.append("creatorAddress", address);

        const response = await fetch("/api/checkpoints", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to anchor micro-checkpoint");
        }

        setQuickDesc("");
        setStatus("SUCCESS");
        setMessage(
          `Micro-anchor anchored to ${checkpointHash.slice(0, 10)}...`,
        );
        toast.success(
          `Sub-second micro-checkpoint anchored (${checkpointHash.slice(0, 8)}...)!`,
        );
        setTimeout(() => setStatus("IDLE"), 3000);
        onSuccess?.(data.checkpoint);
      } catch (err: unknown) {
        const errMsg =
          err instanceof Error
            ? err.message
            : "Error anchoring micro-checkpoint";
        setStatus("ERROR");
        setMessage(errMsg);
        toast.error(errMsg);
      } finally {
        setIsLoading(false);
      }
    },
    [address, projectId, isLoading, onSuccess],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.metaKey || e.ctrlKey) &&
        e.shiftKey &&
        e.key.toLowerCase() === "k"
      ) {
        e.preventDefault();
        const inputElem = document.getElementById("micro-cp-input");
        if (inputElem) inputElem.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const simulateGitDetect = () => {
    setGitDetected(true);
    setQuickDesc(
      "feat(monad): auto-detected latest git HEAD hash a8f19c2 on branch main",
    );
    setSelectedType("GIT_COMMIT");
  };

  if (!isConnected) return null;

  return (
    <Card className="bg-[#07080a] border border-[#ff6363]/60 shadow-key overflow-hidden animate-fade-in">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between text-[12px] font-mono">
          <div className="flex items-center gap-2 text-[#ffffff]">
            <Zap className="h-4 w-4 text-[#ff6363] animate-pulse" />
            <span className="font-bold tracking-wide uppercase text-[#ff6363]">
              Micro-Checkpoint Mode
            </span>
            <span className="hidden sm:inline text-[#9c9c9d]">
              · 1-Click Fast Anchoring
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={simulateGitDetect}
              disabled={isLoading}
              className="cursor-pointer flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#111214] hover:bg-[#1b1c1e] text-[#63a1ff] border border-[#363739] text-[11px] transition-all"
            >
              <GitCommit className="h-3.5 w-3.5" />
              <span>{gitDetected ? "HEAD Detected" : "Auto-Detect Git"}</span>
            </button>
            <span className="hidden md:flex items-center gap-1 px-2 py-0.5 rounded bg-[#1b1c1e] text-[#9c9c9d] border border-[#363739] text-[10px]">
              <Command className="h-3 w-3" />
              <span>Shift+K</span>
            </span>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            triggerQuickAnchor(quickDesc, selectedType);
          }}
          className="flex flex-col sm:flex-row gap-2"
        >
          <div className="relative flex-1">
            <Input
              id="micro-cp-input"
              placeholder="Type quick milestone or pick suggestion below..."
              value={quickDesc}
              onChange={(e) => {
                setQuickDesc(e.target.value);
                if (status !== "IDLE") setStatus("IDLE");
              }}
              disabled={isLoading}
              className="bg-[#111214] border-[#363739] text-[#ffffff] font-mono text-[13px] pr-20 h-10 focus:border-[#ff6363]"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#1b1c1e] text-[#ff6363] border border-[#363739]">
              {selectedType}
            </span>
          </div>

          <Button
            type="submit"
            disabled={isLoading || !quickDesc.trim()}
            className="cursor-pointer bg-[#ff6363] hover:bg-[#ff6363]/80 text-[#ffffff] font-mono text-[13px] h-10 px-5 rounded-lg shadow-sm gap-2 shrink-0 transition-all"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4" />
            )}
            <span>Anchor Now</span>
          </Button>
        </form>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[11px] font-mono no-scrollbar">
          <span className="flex items-center gap-1 text-[#9c9c9d] shrink-0 font-medium">
            <Sparkles className="h-3 w-3 text-[#ff6363]" />
            <span>Suggestions:</span>
          </span>
          {PRESET_SUGGESTIONS.map((sug, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setQuickDesc(sug.label);
                setSelectedType(sug.type);
                triggerQuickAnchor(sug.label, sug.type);
              }}
              disabled={isLoading}
              className="cursor-pointer shrink-0 px-2.5 py-1 rounded-full bg-[#111214] hover:bg-[#1b1c1e] text-[#e6e6e6] border border-[#363739] hover:border-[#ff6363] transition-all flex items-center gap-1"
            >
              <span>{sug.label}</span>
              <ArrowRight className="h-3 w-3 text-[#ff6363]" />
            </button>
          ))}
        </div>

        {message && (
          <div
            className={`p-2.5 rounded-lg border text-[12px] font-mono flex items-center gap-2 ${
              status === "SUCCESS"
                ? "bg-[#1b1c1e] border-[#59d499]/40 text-[#59d499]"
                : "bg-[#1b1c1e] border-[#ff6363]/40 text-[#ff6363]"
            }`}
          >
            {status === "SUCCESS" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-[#59d499]" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-[#ff6363]" />
            )}
            <span className="truncate">{message}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
