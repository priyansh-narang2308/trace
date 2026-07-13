/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Rewind,
  Terminal,
  ShieldCheck,
  GitCommit,
  Sparkles,
  Layers,
  CheckCircle2,
  Clock,
} from "lucide-react";

interface CheckpointNode {
  id: string;
  checkpointHash: string;
  description: string;
  checkpointType: string;
  timestamp: string;
  creatorAddress: string;
  blockNumber?: number;
  gasOptimized?: string;
}

interface LiveEvolutionViewProps {
  projectId: string;
  checkpoints?: CheckpointNode[];
}

const DEFAULT_EVOLUTION: CheckpointNode[] = [
  {
    id: "evo-1",
    checkpointHash: "0x0000000000000000000000000000000000000001",
    description:
      "Genesis Enclave Initialization: Core contract architecture deployed with Monad secp256r1 P-256 precompile signature matrix.",
    checkpointType: "DEPLOYMENT",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    creatorAddress: "0x71C...893B",
    blockNumber: 1048100,
    gasOptimized: "Base Consensus Lock",
  },
  {
    id: "evo-2",
    checkpointHash: "0x1928410294810294810294810294810294810294",
    description:
      "Milestone Attestation #1: Integrated sub-second execution state snapshot anchor with Keccak256 proof serialization.",
    checkpointType: "MILESTONE",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    creatorAddress: "0x3A9...120E",
    blockNumber: 1048650,
    gasOptimized: "-28.4% Gas Overhead",
  },
  {
    id: "evo-3",
    checkpointHash: "0x4918204918204918204918204918204918204918",
    description:
      "Git Commit Anchor: Refactored multi-sig threshold verification for co-signer quorum approval.",
    checkpointType: "GIT_COMMIT",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    creatorAddress: "0x9F2...401C",
    blockNumber: 1049100,
    gasOptimized: "-44.1% Gas Overhead",
  },
  {
    id: "evo-4",
    checkpointHash: "0x8912841029481029481029481029481029481029",
    description:
      "Milestone Verified #2: High-throughput stress test validated at 100,000 TPS across Monad testnet ring.",
    checkpointType: "MILESTONE",
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    creatorAddress: "0x71C...893B",
    blockNumber: 1049281,
    gasOptimized: "-64.0% Optimal Enclave Tier",
  },
];

export function LiveEvolutionView({
  projectId,
  checkpoints = DEFAULT_EVOLUTION,
}: LiveEvolutionViewProps) {
  const [currentIndex, setCurrentIndex] = useState(checkpoints.length - 1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1500);
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= checkpoints.length - 1) {
            setIsPlaying(false);
            toast.success("Project Evolution replay completed!");
            return checkpoints.length - 1;
          }
          return prev + 1;
        });
      }, playbackSpeed);
    } else if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
    }
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [isPlaying, checkpoints.length, playbackSpeed]);

  const togglePlayback = () => {
    if (isPlaying) {
      setIsPlaying(false);
      toast.info("Paused evolution playback");
    } else {
      if (currentIndex >= checkpoints.length - 1) {
        setCurrentIndex(0);
      }
      setIsPlaying(true);
      toast.info("Playing live Monad project evolution history...");
    }
  };

  const resetEvolution = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
    toast.info("Evolution reset to Genesis Block #1048100");
  };

  const stepForward = () => {
    setIsPlaying(false);
    if (currentIndex < checkpoints.length - 1) {
      setCurrentIndex((p) => p + 1);
      toast.info(`Stepped to block anchor #${currentIndex + 2}`);
    }
  };

  const stepBackward = () => {
    setIsPlaying(false);
    if (currentIndex > 0) {
      setCurrentIndex((p) => p - 1);
      toast.info(`Stepped back to block anchor #${currentIndex}`);
    }
  };

  useEffect(() => {
    setCurrentIndex(checkpoints.length - 1);
  }, [checkpoints.length]);

  if (!checkpoints || checkpoints.length === 0) {
    return (
      <Card className="bg-ink border border-border shadow-key overflow-hidden">
        <CardHeader className="pb-4 border-b border-border flex flex-row items-center justify-between">
          <CardTitle className="text-[16px] font-medium text-pure-white flex items-center gap-2 font-sans">
            <Layers className="h-5 w-5 text-coral-pulse" />
            <span>Monad Enclave Evolution Replay Engine</span>
          </CardTitle>
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="px-2.5 py-0.5 rounded uppercase font-bold bg-graphite text-coral-pulse border border-border animate-pulse">
              Pending Genesis
            </span>
          </div>
        </CardHeader>
        <CardContent className="py-16 flex flex-col items-center justify-center text-center font-mono">
          <Clock className="h-12 w-12 text-coral-pulse/40 mb-4 animate-pulse" />
          <h3 className="text-[15px] font-medium text-pure-white mb-2 uppercase tracking-wider">
            Waiting for first anchor
          </h3>
          <p className="text-ash text-[13px] font-sans max-w-md leading-relaxed">
            This project has no cryptographic checkpoint anchors yet. Deploy a milestone or commit attestation onto Monad Testnet to visualize its live evolution history.
          </p>
        </CardContent>
      </Card>
    );
  }

  const activeCheckpoint = checkpoints[currentIndex] || checkpoints[0];

  return (
    <Card className="bg-ink border border-border shadow-key overflow-hidden">
      <CardHeader className="pb-4 border-b border-border flex flex-row items-center justify-between">
        <CardTitle className="text-[16px] font-medium text-pure-white flex items-center gap-2 font-sans">
          <Layers className="h-5 w-5 text-coral-pulse" />
          <span>Monad Enclave Evolution Replay Engine</span>
        </CardTitle>
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="px-2.5 py-0.5 rounded uppercase font-bold bg-graphite text-electric-sky border border-border">
            Block `{activeCheckpoint.blockNumber || 1049281}`
          </span>
          <span className="px-2.5 py-0.5 rounded uppercase font-bold bg-graphite text-emerald-verify border border-border">
            `{currentIndex + 1} / {checkpoints.length}` Stage
          </span>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6 font-mono">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[12px] text-ash">
            <span>Genesis Anchor (`Block #1048100`)</span>
            <span className="text-pure-white font-bold">
              Timeline Progress (`
              {Math.round(((currentIndex + 1) / checkpoints.length) * 100)}%`)
            </span>
            <span>Current Anchor (`Block #1049281`)</span>
          </div>

          <div className="relative h-2 w-full rounded-full bg-obsidian border border-border overflow-hidden">
            <div
              className="absolute top-0 left-0 bottom-0 bg-coral-pulse transition-all duration-300 rounded-full shadow-sm"
              style={{
                width: `${((currentIndex + 1) / checkpoints.length) * 100}%`,
              }}
            />
          </div>

          <div className="flex items-center justify-between gap-1 overflow-x-auto pt-1">
            {checkpoints.map((cp, idx) => (
              <button
                key={cp.id}
                type="button"
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentIndex(idx);
                  toast.info(`Jumped to checkpoint #${idx + 1}`);
                }}
                className={`cursor-pointer px-2.5 py-1 rounded border transition-all text-[11px] shrink-0 font-medium ${
                  idx === currentIndex
                    ? "bg-coral-pulse text-void-black border-coral-pulse font-bold shadow-sm scale-105"
                    : idx < currentIndex
                      ? "bg-graphite text-emerald-verify border-border"
                      : "bg-obsidian text-ash border-border hover:text-pure-white"
                }`}
              >
                `#{idx + 1}: ${cp.checkpointType}`
              </button>
            ))}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-obsidian border border-border space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/60">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-graphite text-coral-pulse border border-border uppercase">
                {activeCheckpoint.checkpointType}
              </span>
              <span className="text-[13px] font-bold text-pure-white truncate max-w-md">
                Anchor Digest: `{activeCheckpoint.checkpointHash.slice(0, 14)}
                ...`
              </span>
            </div>
            <div className="flex items-center gap-2 text-[12px] text-ash">
              <Clock className="h-3.5 w-3.5 text-electric-sky" />
              <span>
                `{new Date(activeCheckpoint.timestamp).toLocaleString()}`
              </span>
            </div>
          </div>

          <div className="text-[14px] leading-relaxed text-mist font-sans">
            {activeCheckpoint.description}
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-border/60 text-[12px]">
            <div className="flex items-center gap-2 text-ash">
              <Terminal className="h-3.5 w-3.5 text-coral-pulse" />
              <span>Signer Witness: @{activeCheckpoint.creatorAddress}</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-verify font-bold bg-graphite px-3 py-1 rounded-lg border border-border">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>
                Optimization: `{activeCheckpoint.gasOptimized || "-32% Gas"}`
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={stepBackward}
              disabled={currentIndex <= 0}
              className="cursor-pointer bg-obsidian hover:bg-graphite border-border text-pure-white font-mono text-[12px]"
            >
              <Rewind className="h-3.5 w-3.5 mr-1" />
              <span>Prev</span>
            </Button>

            <Button
              type="button"
              onClick={togglePlayback}
              className="cursor-pointer bg-coral-pulse hover:bg-coral-pulse/90 text-void-black font-bold font-mono text-[13px] px-6 h-10 rounded-xl gap-2 shadow-sm"
            >
              {isPlaying ? (
                <>
                  <Pause className="h-4 w-4 fill-void-black" />
                  <span>Pause Replay</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-void-black" />
                  <span>
                    {currentIndex >= checkpoints.length - 1
                      ? "Replay Evolution"
                      : "Play Evolution"}
                  </span>
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={stepForward}
              disabled={currentIndex >= checkpoints.length - 1}
              className="cursor-pointer bg-obsidian hover:bg-graphite border-border text-pure-white font-mono text-[12px]"
            >
              <span>Next</span>
              <FastForward className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-obsidian px-3 py-1.5 rounded-lg border border-border text-[12px]">
              <span className="text-ash">Speed:</span>
              {[
                { label: "1x", ms: 1500 },
                { label: "2x", ms: 800 },
                { label: "4x", ms: 400 },
              ].map((sp) => (
                <button
                  key={sp.label}
                  type="button"
                  onClick={() => {
                    setPlaybackSpeed(sp.ms);
                    toast.info(`Set evolution speed to ${sp.label}`);
                  }}
                  className={`cursor-pointer px-1.5 py-0.5 rounded font-bold transition-colors ${
                    playbackSpeed === sp.ms
                      ? "bg-graphite text-coral-pulse border border-border"
                      : "text-ash hover:text-pure-white"
                  }`}
                >
                  {sp.label}
                </button>
              ))}
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={resetEvolution}
              title="Reset to Genesis"
              className="cursor-pointer bg-obsidian hover:bg-graphite border-border text-ash hover:text-pure-white h-9 w-9 rounded-lg"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
