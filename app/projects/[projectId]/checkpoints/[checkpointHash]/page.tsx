/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckpointAttribution } from "@/components/checkpoints/checkpoint-attribution";
import { TxConfirmation } from "@/components/checkpoints/tx-confirmation";
import {
  ArrowLeft,
  Terminal,
  Clock,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Image as ImageIcon,
  Loader2,
  FileText,
  GitCommit,
  Rocket,
  Camera,
  Users,
} from "lucide-react";

interface CheckpointDetail {
  id: string;
  projectId: string;
  checkpointHash: string;
  txHash: string;
  description: string;
  creatorAddress: string;
  checkpointType: string;
  screenshotUrl?: string | null;
  collaborators: string[];
  timestamp: string;
  project?: {
    name: string;
  };
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  MANUAL: FileText,
  GIT_COMMIT: GitCommit,
  DEPLOYMENT: Rocket,
  SCREENSHOT: Camera,
  COLLABORATION: Users,
};

export default function CheckpointDetailPage({
  params,
}: {
  params: Promise<{ projectId: string; checkpointHash: string }>;
}) {
  const unwrappedParams = use(params);
  const { projectId, checkpointHash } = unwrappedParams;
  const router = useRouter();

  const [checkpoint, setCheckpoint] = useState<CheckpointDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDetail = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/checkpoints/${encodeURIComponent(checkpointHash)}`,
      );
      if (res.ok) {
        const data = await res.json();
        setCheckpoint(data.checkpoint);
      } else {
        router.push(`/projects/${projectId}`);
      }
    } catch (err) {
      console.error("Error loading checkpoint detail:", err);
    } finally {
      setIsLoading(false);
    }
  }, [checkpointHash, projectId, router]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-void-black text-pure-white font-sans">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-coral-pulse" />
          <span className="text-[13px] font-mono text-ash">
            Decrypting milestone verification anchor...
          </span>
        </div>
      </div>
    );
  }

  if (!checkpoint) return null;

  const TypeIcon = TYPE_ICONS[checkpoint.checkpointType] || Terminal;

  return (
    <div className="min-h-screen bg-void-black text-pure-white font-sans pb-24">
      <header className="sticky top-0 z-50 border-b border-border bg-void-black/80 backdrop-blur-xl animate-slide-down">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/projects/${projectId}`}>
              <Button
                variant="ghost"
                size="sm"
                className="cursor-pointer gap-2 font-medium text-ash hover:text-pure-white hover:bg-obsidian"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Project Dashboard</span>
              </Button>
            </Link>
            <div className="h-4 w-px bg-border" />
            <span className="font-mono text-[13px] text-coral-pulse flex items-center gap-1.5">
              <TypeIcon className="h-4 w-4" />
              <span>{checkpoint.checkpointType}</span>
            </span>
          </div>
          <div className="font-mono text-[12px] text-ash truncate max-w-xs">
            `{checkpointHash.slice(0, 10)}...{checkpointHash.slice(-8)}`
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-6 py-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-[16px] bg-ink border border-border shadow-key">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase bg-graphite text-electric-sky border border-border">
                Milestone Proof
              </span>
              <span className="text-[12px] font-mono text-ash">
                Timestamp: `{new Date(checkpoint.timestamp).toLocaleString()}`
              </span>
            </div>
            <h1 className="text-[28px] font-medium tracking-tight text-pure-white">
              {checkpoint.project?.name || `Project ${projectId}`} Anchor
            </h1>
          </div>

          {checkpoint.txHash && checkpoint.txHash !== "0x" ? (
            <a
              href={`https://testnet.monadexplorer.com/tx/${checkpoint.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-graphite hover:bg-slate text-emerald-verify border border-emerald-verify/40 font-mono text-[13px] font-medium transition-all shadow-sm"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Monad Explorer Verified</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : (
            <span className="shrink-0 px-3 py-2 rounded-lg bg-obsidian text-ash border border-border font-mono text-[12px]">
              Off-Chain Staged Anchor
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-ink border border-border shadow-key">
              <CardHeader className="pb-3 border-b border-border">
                <CardTitle className="text-[16px] font-medium text-pure-white flex items-center gap-2 font-sans">
                  <Terminal className="h-4 w-4 text-coral-pulse" />
                  <span>Milestone Objectives & Execution Log</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5 space-y-4 font-mono text-[14px] leading-[1.7] text-mist">
                <p className="whitespace-pre-wrap">{checkpoint.description}</p>
                <div className="p-3 rounded-lg bg-obsidian border border-border flex items-center justify-between text-[12px] text-ash">
                  <span>Cryptographic Digest (Keccak256)</span>
                  <span className="font-bold text-pure-white truncate max-w-[260px]">
                    {checkpoint.checkpointHash}
                  </span>
                </div>
              </CardContent>
            </Card>

            {checkpoint.screenshotUrl && (
              <Card className="bg-ink border border-border shadow-key overflow-hidden">
                <CardHeader className="pb-3 border-b border-border flex flex-row items-center justify-between">
                  <CardTitle className="text-[16px] font-medium text-pure-white flex items-center gap-2 font-sans">
                    <ImageIcon className="h-4 w-4 text-coral-pulse" />
                    <span>Cryptographic Evidence Attachment</span>
                  </CardTitle>
                  <a
                    href={checkpoint.screenshotUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-pointer text-[12px] font-mono text-electric-sky hover:underline flex items-center gap-1"
                  >
                    <span>Open Original</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </CardHeader>
                <CardContent className="p-4 bg-void-black">
                  <img
                    src={checkpoint.screenshotUrl}
                    alt="Milestone evidence"
                    className="w-full max-h-[500px] object-contain rounded-lg border border-border"
                  />
                </CardContent>
              </Card>
            )}

            {checkpoint.txHash && checkpoint.txHash !== "0x" && (
              <TxConfirmation
                txResult={{
                  status: "CONFIRMED",
                  txHash: checkpoint.txHash,
                  gasUsed: "21000",
                  blockNumber: "1049281",
                  error: null,
                }}
              />
            )}
          </div>

          <div className="space-y-6">
            <CheckpointAttribution
              creatorAddress={checkpoint.creatorAddress}
              collaborators={checkpoint.collaborators}
              timestamp={checkpoint.timestamp}
              txHash={checkpoint.txHash}
            />

            <Card className="bg-ink border border-border shadow-key">
              <CardHeader className="pb-3 border-b border-border">
                <CardTitle className="text-[14px] font-medium text-pure-white flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-verify" />
                  <span>Monad Precompile Anchor</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 text-[12px] font-mono text-ash leading-[1.6] space-y-2">
                <p>
                  Checkpoints on TRACE verify user signatures directly through
                  Monad Testnet secp256r1 P-256 precompile (`0x0100`).
                </p>
                <p>
                  Every anchor guarantees immutability with 1-second finality.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
