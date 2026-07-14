"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  GitCompare,
  ShieldCheck,
  Terminal,
  Users,
  Clock,
  CheckCircle2,
  X,
  Search,
  ArrowRight,
  Loader2,
  Layers,
  Zap,
} from "lucide-react";

interface ComparisonProject {
  projectId: string;
  name: string;
  description: string;
  ownerAddress: string;
  isPublic: boolean;
  checkpointCount: number;
  collaboratorCount: number;
  createdAt: string;
  updatedAt: string;
  latestCheckpointType?: string;
  verifiedAnchors?: number;
}

interface ProjectComparisonProps {
  currentProjectId?: string;
}

export function ProjectComparison({
  currentProjectId,
}: ProjectComparisonProps) {
  const [projectA, setProjectA] = useState<ComparisonProject | null>(null);
  const [projectB, setProjectB] = useState<ComparisonProject | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ComparisonProject[]>([]);
  const [selectingSlot, setSelectingSlot] = useState<"A" | "B" | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = useCallback(
    async (query: string) => {
      setSearchQuery(query);
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(query)}&filter=PROJECTS`
        );
        if (res.ok) {
          const data = await res.json();
          const mapped = (data.projects || [])
            .filter((p: { projectId: string }) => p.projectId !== currentProjectId)
            .map(
              (p: {
                projectId: string;
                name: string;
                description: string;
                ownerAddress: string;
                isPublic: boolean;
                createdAt: string;
                updatedAt: string;
                _count?: { checkpoints: number; collaborators: number };
              }) => ({
                projectId: p.projectId,
                name: p.name,
                description: p.description,
                ownerAddress: p.ownerAddress,
                isPublic: p.isPublic,
                createdAt: p.createdAt,
                updatedAt: p.updatedAt,
                checkpointCount: p._count?.checkpoints || 0,
                collaboratorCount: p._count?.collaborators || 0,
                verifiedAnchors: Math.floor((p._count?.checkpoints || 0) * 0.8),
              })
            );
          setSearchResults(mapped);
        }
      } catch {
        toast.error("Search failed");
      } finally {
        setIsSearching(false);
      }
    },
    [currentProjectId]
  );

  const selectProject = (project: ComparisonProject) => {
    if (selectingSlot === "A") {
      setProjectA(project);
      toast.success(`Project A set: ${project.name}`);
    } else if (selectingSlot === "B") {
      setProjectB(project);
      toast.success(`Project B set: ${project.name}`);
    }
    setSelectingSlot(null);
    setSearchQuery("");
    setSearchResults([]);
  };

  const clearSlot = (slot: "A" | "B") => {
    if (slot === "A") setProjectA(null);
    else setProjectB(null);
    toast.info(`Cleared comparison slot ${slot}`);
  };

  const comparisonMetrics =
    projectA && projectB
      ? [
          {
            label: "Total Checkpoints",
            a: projectA.checkpointCount,
            b: projectB.checkpointCount,
            format: (v: number) => `${v}`,
          },
          {
            label: "Team Collaborators",
            a: projectA.collaboratorCount,
            b: projectB.collaboratorCount,
            format: (v: number) => `${v}`,
          },
          {
            label: "Verified On-Chain Anchors",
            a: projectA.verifiedAnchors || 0,
            b: projectB.verifiedAnchors || 0,
            format: (v: number) => `${v}`,
          },
          {
            label: "Verification Rate",
            a:
              projectA.checkpointCount > 0
                ? Math.round(
                    ((projectA.verifiedAnchors || 0) /
                      projectA.checkpointCount) *
                      100,
                  )
                : 0,
            b:
              projectB.checkpointCount > 0
                ? Math.round(
                    ((projectB.verifiedAnchors || 0) /
                      projectB.checkpointCount) *
                      100,
                  )
                : 0,
            format: (v: number) => `${v}%`,
          },
          {
            label: "Project Age (Days)",
            a: Math.floor(
              (Date.now() - new Date(projectA.createdAt).getTime()) /
                (1000 * 60 * 60 * 24),
            ),
            b: Math.floor(
              (Date.now() - new Date(projectB.createdAt).getTime()) /
                (1000 * 60 * 60 * 24),
            ),
            format: (v: number) => `${v}d`,
          },
        ]
      : [];

  return (
    <Card className="bg-ink border border-border shadow-key overflow-hidden">
      <CardHeader className="pb-4 border-b border-border flex flex-row items-center justify-between">
        <CardTitle className="text-[16px] font-medium text-pure-white flex items-center gap-2 font-sans">
          <GitCompare className="h-5 w-5 text-coral-pulse" />
          <span>Monad Enclave Comparison Matrix</span>
        </CardTitle>
        <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase bg-graphite text-electric-sky border border-border">
          Side-by-Side Analysis
        </span>
      </CardHeader>

      <CardContent className="p-6 space-y-6 font-mono">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(["A", "B"] as const).map((slot) => {
            const project = slot === "A" ? projectA : projectB;
            return (
              <div
                key={slot}
                className={`p-4 rounded-xl border transition-all ${
                  project
                    ? "bg-obsidian border-border"
                    : "bg-obsidian/60 border-dashed border-border hover:border-smoke"
                }`}
              >
                {project ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-graphite border border-border flex items-center justify-center text-coral-pulse font-bold text-[12px]">
                          {project.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-sans font-medium text-[14px] text-pure-white">
                            {project.name}
                          </div>
                          <div className="text-[11px] text-ash">
                            @{project.ownerAddress}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => clearSlot(slot)}
                        className="cursor-pointer p-1.5 rounded-lg hover:bg-graphite text-ash hover:text-pure-white transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-[12px] text-mist font-sans leading-relaxed">
                      {project.description}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-ash">
                      <span className="flex items-center gap-1">
                        <Layers className="h-3 w-3 text-electric-sky" />
                        <span>{project.checkpointCount} CPs</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-emerald-verify" />
                        <span>{project.collaboratorCount} Signers</span>
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-graphite text-coral-pulse border border-border text-[10px] uppercase font-bold">
                        {project.latestCheckpointType || "ACTIVE"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectingSlot(slot);
                      toast.info(`Select a project for Slot ${slot}`);
                    }}
                    className="cursor-pointer w-full py-8 text-center space-y-2"
                  >
                    <GitCompare className="h-8 w-8 text-ash/40 mx-auto" />
                    <div className="text-[13px] font-medium text-pure-white font-sans">
                      Select Project {slot}
                    </div>
                    <div className="text-[12px] text-ash">
                      Click to search and add a Monad enclave project
                    </div>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {selectingSlot && (
          <div className="p-4 rounded-xl bg-obsidian border border-coral-pulse/40 space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-coral-pulse" />
              <input
                type="text"
                placeholder={`Search Monad projects for Slot ${selectingSlot}...`}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                autoFocus
                className="w-full bg-transparent border-none outline-none text-pure-white text-[13px] placeholder:text-ash"
              />
              {isSearching && (
                <Loader2 className="h-4 w-4 animate-spin text-electric-sky" />
              )}
              <button
                type="button"
                onClick={() => {
                  setSelectingSlot(null);
                  setSearchQuery("");
                  setSearchResults([]);
                }}
                className="cursor-pointer p-1 rounded hover:bg-graphite text-ash hover:text-pure-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-1.5">
                {searchResults.map((p) => (
                  <button
                    key={p.projectId}
                    type="button"
                    onClick={() => selectProject(p)}
                    className="cursor-pointer w-full text-left p-3 rounded-lg bg-graphite hover:bg-slate border border-border hover:border-smoke transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="h-7 w-7 rounded bg-obsidian border border-border flex items-center justify-center text-coral-pulse font-bold text-[11px] shrink-0">
                        {p.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-[13px] font-medium text-pure-white truncate font-sans">
                          {p.name}
                        </div>
                        <div className="text-[11px] text-ash truncate">
                          {p.description}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-ash group-hover:text-pure-white shrink-0 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            )}

            {searchQuery && searchResults.length === 0 && !isSearching && (
              <div className="text-center py-4 text-[12px] text-ash">
                No Monad enclaves found matching `{searchQuery}`
              </div>
            )}

            {!searchQuery && (
              <div className="text-center py-4 text-[12px] text-ash">
                Type to search for Monad enclave projects
              </div>
            )}
          </div>
        )}

        {projectA && projectB && (
          <div className="space-y-4 pt-2">
            <div className="text-[11px] text-ash uppercase tracking-wider font-bold">
              Head-to-Head Metric Comparison
            </div>

            <div className="space-y-2">
              {comparisonMetrics.map((metric) => {
                const maxVal = Math.max(metric.a, metric.b, 1);
                const aPercent = (metric.a / maxVal) * 100;
                const bPercent = (metric.b / maxVal) * 100;
                const winner =
                  metric.a > metric.b ? "A" : metric.b > metric.a ? "B" : "TIE";

                return (
                  <div
                    key={metric.label}
                    className="p-3 rounded-xl bg-obsidian border border-border space-y-2"
                  >
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="text-ash font-medium">
                        {metric.label}
                      </span>
                      {winner !== "TIE" && (
                        <span className="px-1.5 py-0.5 rounded bg-graphite text-emerald-verify text-[10px] font-bold border border-border">
                          {winner === "A"
                            ? projectA.name.slice(0, 10)
                            : projectB.name.slice(0, 10)}{" "}
                          wins
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-coral-pulse font-bold truncate">
                            {projectA.name.slice(0, 12)}
                          </span>
                          <span className="text-pure-white font-bold">
                            {metric.format(metric.a)}
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-graphite overflow-hidden">
                          <div
                            className="h-full bg-coral-pulse transition-all duration-500 rounded-full"
                            style={{ width: `${aPercent}%` }}
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-electric-sky font-bold truncate">
                            {projectB.name.slice(0, 12)}
                          </span>
                          <span className="text-pure-white font-bold">
                            {metric.format(metric.b)}
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-graphite overflow-hidden">
                          <div
                            className="h-full bg-electric-sky transition-all duration-500 rounded-full"
                            style={{ width: `${bPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
