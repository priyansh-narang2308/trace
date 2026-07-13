/* eslint-disable react-hooks/purity */
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRealtimeTimeline } from "@/hooks/use-realtime-timeline";
import { CheckpointAttribution } from "@/components/checkpoints/checkpoint-attribution";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Clock,
  Radio,
  ArrowRight,
  FileText,
  GitCommit,
  Rocket,
  Camera,
  Users,
  Filter,
  CheckCircle2,
} from "lucide-react";

interface RealtimeTimelineProps {
  projectId: string;
}

const TYPE_ICONS: Record<
  string,
  { icon: React.ElementType; color: string; label: string }
> = {
  MANUAL: { icon: FileText, color: "#e6e6e6", label: "Manual" },
  GIT_COMMIT: { icon: GitCommit, color: "#63a1ff", label: "Git Commit" },
  DEPLOYMENT: { icon: Rocket, color: "#59d499", label: "Deploy" },
  SCREENSHOT: { icon: Camera, color: "#ff6363", label: "Screenshot" },
  COLLABORATION: { icon: Users, color: "#63a1ff", label: "Collab" },
};

export function RealtimeTimeline({ projectId }: RealtimeTimelineProps) {
  const { checkpoints, connectionState, lastPing } =
    useRealtimeTimeline(projectId);
  const [filterType, setFilterType] = useState<string | null>(null);

  const filteredCheckpoints = filterType
    ? checkpoints.filter((cp) => cp.checkpointType === filterType)
    : checkpoints;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#07080a] border border-[#363739] shadow-key">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center h-8 w-8 rounded-full bg-[#111214] border border-[#363739]">
            <Radio
              className={`h-4 w-4 ${
                connectionState === "CONNECTED"
                  ? "text-[#59d499] animate-pulse"
                  : connectionState === "CONNECTING"
                    ? "text-[#63a1ff] animate-spin"
                    : "text-[#ff6363]"
              }`}
            />
          </div>
          <div>
            <div className="text-[14px] font-medium text-[#ffffff] flex items-center gap-2">
              <span>Real-Time Cryptographic Timeline</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#1b1c1e] text-[#59d499] border border-[#363739]">
                Live Stream
              </span>
            </div>
            <div className="text-[12px] font-mono text-[#9c9c9d]">
              Status: `{connectionState}` · Anchors: `{checkpoints.length}`
              {lastPing &&
                ` · Sync: ${new Date(lastPing).toLocaleTimeString()}`}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <Filter className="h-3.5 w-3.5 text-[#9c9c9d] mr-1" />
          <button
            type="button"
            onClick={() => setFilterType(null)}
            className={`cursor-pointer px-2.5 py-1 rounded text-[11px] font-mono transition-all ${
              !filterType
                ? "bg-[#1b1c1e] text-[#ffffff] border border-[#ff6363]"
                : "bg-[#111214] text-[#9c9c9d] border border-[#363739] hover:text-[#ffffff]"
            }`}
          >
            All (`{checkpoints.length}`)
          </button>
          {Object.entries(TYPE_ICONS).map(([type, config]) => {
            const count = checkpoints.filter(
              (c) => c.checkpointType === type,
            ).length;
            if (count === 0 && filterType !== type) return null;
            return (
              <button
                key={type}
                type="button"
                onClick={() => setFilterType(type)}
                className={`cursor-pointer px-2.5 py-1 rounded text-[11px] font-mono transition-all flex items-center gap-1 ${
                  filterType === type
                    ? "bg-[#1b1c1e] text-[#ffffff] border border-[#ff6363]"
                    : "bg-[#111214] text-[#9c9c9d] border border-[#363739] hover:text-[#ffffff]"
                }`}
              >
                <span>{config.label}</span>
                <span>(`{count}`)</span>
              </button>
            );
          })}
        </div>
      </div>

      {filteredCheckpoints.length === 0 ? (
        <Card className="bg-[#07080a] border border-dashed border-[#363739]">
          <CardContent className="py-16 text-center space-y-3">
            <Clock className="h-12 w-12 text-[#9c9c9d]/40 mx-auto" />
            <h4 className="text-[18px] font-medium text-[#ffffff]">
              No live milestones discovered
            </h4>
            <p className="text-[14px] text-[#9c9c9d] max-w-md mx-auto leading-[1.6]">
              Anchor a new checkpoint above or trigger a micro-checkpoint to see
              sub-second finality updates populate instantly in real time.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="relative pl-6 border-l-2 border-[#363739]/60 space-y-6 ml-4">
          {filteredCheckpoints.map((cp, index) => {
            const typeConfig =
              TYPE_ICONS[cp.checkpointType] || TYPE_ICONS.MANUAL;
            const Icon = typeConfig.icon;
            const isFirst = index === 0;

            return (
              <div
                key={cp.id || cp.checkpointHash}
                className="relative animate-fade-in group"
              >
                <div
                  className="absolute -left-[33px] top-4 h-6 w-6 rounded-full bg-[#07080a] border-2 flex items-center justify-center transition-all group-hover:scale-110 shadow-sm"
                  style={{ borderColor: typeConfig.color }}
                >
                  <Icon
                    className="h-3 w-3"
                    style={{ color: typeConfig.color }}
                  />
                </div>

                <Card
                  className={`bg-[#07080a] border transition-all hover:border-[#6a6b6c] shadow-key ${
                    isFirst
                      ? "border-[#ff6363]/40 shadow-md"
                      : "border-[#363739]"
                  }`}
                >
                  <CardHeader className="pb-3 border-b border-[#363739]/50">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase bg-[#1b1c1e] text-[#ffffff] border border-[#363739]">
                          {typeConfig.label}
                        </span>
                        {isFirst && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#111214] text-[#59d499] border border-[#59d499]/40 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Latest Anchor</span>
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[12px] font-mono text-[#9c9c9d]">
                          {new Date(
                            cp.timestamp || cp.createdAt || Date.now(),
                          ).toLocaleTimeString()}
                        </span>
                        <Link
                          href={`/projects/${projectId}/checkpoints/${encodeURIComponent(cp.checkpointHash)}`}
                          className="cursor-pointer flex items-center gap-1 text-[12px] font-mono text-[#63a1ff] hover:underline"
                        >
                          <span>Inspect</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    <p className="text-[14px] text-[#ffffff] leading-[1.6] font-sans font-normal">
                      {cp.description}
                    </p>

                    {cp.screenshotUrl && (
                      <div className="rounded-lg overflow-hidden border border-[#363739] bg-[#040506] max-h-52 flex items-center justify-center">
                        <img
                          src={cp.screenshotUrl}
                          alt="Checkpoint screenshot"
                          className="max-h-52 object-contain"
                        />
                      </div>
                    )}

                    <CheckpointAttribution
                      creatorAddress={cp.creatorAddress}
                      collaborators={cp.collaborators}
                      timestamp={
                        cp.timestamp || cp.createdAt || new Date().toISOString()
                      }
                      txHash={cp.txHash}
                      compact={true}
                    />
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
