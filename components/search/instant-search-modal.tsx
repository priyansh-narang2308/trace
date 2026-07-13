"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Search,
  Command,
  Terminal,
  FolderKanban,
  ShieldCheck,
  ArrowRight,
  X,
  Loader2,
  Copy,
  Sparkles,
  GitCommit,
} from "lucide-react";

interface SearchResultProject {
  id: string;
  name: string;
  description: string | null;
  updatedAt: string;
}

interface SearchResultCheckpoint {
  id: string;
  checkpointHash: string;
  description: string;
  checkpointType: string;
  creatorAddress: string;
  timestamp: string;
  projectId: string;
  project?: {
    name: string;
    id: string;
  };
}

export function InstantSearchModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState<SearchResultProject[]>([]);
  const [checkpoints, setCheckpoints] = useState<SearchResultCheckpoint[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => {
          const next = !prev;
          if (next) {
            setTimeout(() => inputRef.current?.focus(), 50);
          }
          return next;
        });
      } else if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const performSearch = useCallback(
    async (searchQuery: string, searchFilter: string) => {
      if (!searchQuery.trim()) {
        setProjects([]);
        setCheckpoints([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(searchQuery)}&filter=${searchFilter}`,
        );
        if (res.ok) {
          const data = await res.json();
          setProjects(data.projects || []);
          setCheckpoints(data.checkpoints || []);
        }
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isOpen) {
        performSearch(query, filter);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [query, filter, isOpen, performSearch]);

  const navigateTo = (path: string, label: string) => {
    setIsOpen(false);
    toast.success(`Opening ${label}...`);
    router.push(path);
  };

  const copyHash = (e: React.MouseEvent, hash: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hash);
    toast.success("Cryptographic hash copied to clipboard!");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIsOpen(true);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
        className="cursor-pointer flex items-center justify-between gap-3 px-3 py-1.5 rounded-lg bg-obsidian hover:bg-graphite border border-border text-ash hover:text-pure-white transition-all font-mono text-[12px] w-full max-w-[240px] shadow-sm group"
      >
        <span className="flex items-center gap-2 truncate">
          <Search className="h-3.5 w-3.5 text-coral-pulse shrink-0" />
          <span>Search Enclaves...</span>
        </span>
        <kbd className="px-1.5 py-0.5 rounded bg-graphite border border-border text-[10px] text-mist flex items-center gap-0.5 font-bold shrink-0 group-hover:border-coral-pulse/50 transition-colors">
          <Command className="h-2.5 w-2.5" />
          <span>K</span>
        </kbd>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-void-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-[700px] rounded-[18px] bg-ink border border-border shadow-2xl overflow-hidden flex flex-col max-h-[75vh]">
            <div className="p-4 border-b border-border flex items-center gap-3 bg-obsidian/60">
              <Search className="h-5 w-5 text-coral-pulse shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Type to search Monad projects, checkpoint hashes, addresses..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-pure-white font-mono text-[14px] placeholder:text-ash"
              />
              {isLoading && (
                <Loader2 className="h-4 w-4 animate-spin text-electric-sky shrink-0" />
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="cursor-pointer p-1.5 rounded-lg hover:bg-graphite text-ash hover:text-pure-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-void-black text-[12px] font-mono overflow-x-auto">
              {[
                { id: "ALL", label: "All Records" },
                { id: "PROJECTS", label: "Monad Enclaves" },
                { id: "CHECKPOINTS", label: "Milestone Proofs" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilter(tab.id)}
                  className={`cursor-pointer px-3 py-1 rounded transition-all shrink-0 ${
                    filter === tab.id
                      ? "bg-graphite text-pure-white border border-coral-pulse/50 font-medium"
                      : "text-ash hover:text-pure-white hover:bg-obsidian"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-4 overflow-y-auto space-y-4 flex-1 font-mono">
              {!query.trim() ? (
                <div className="py-12 text-center space-y-3">
                  <Terminal className="h-10 w-10 text-ash/40 mx-auto" />
                  <p className="text-[14px] font-medium text-pure-white font-sans">
                    Raycast Instant Checkpoint Search
                  </p>
                  <p className="text-[12px] text-ash max-w-sm mx-auto leading-relaxed">
                    Query any Monad project, cryptographic anchor (`0x...`), or
                    collaborator wallet address instantly across the index.
                  </p>
                </div>
              ) : projects.length === 0 &&
                checkpoints.length === 0 &&
                !isLoading ? (
                <div className="py-12 text-center text-ash text-[13px]">
                  No verifiable Monad records found for `{query}`.
                </div>
              ) : (
                <>
                  {projects.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-[11px] text-ash uppercase tracking-wider font-bold px-2">
                        Monad Enclave Projects (`{projects.length}`)
                      </div>
                      <div className="space-y-1.5">
                        {projects.map((p) => (
                          <div
                            key={p.id}
                            onClick={() =>
                              navigateTo(`/projects/${p.id}`, p.name)
                            }
                            className="cursor-pointer p-3 rounded-xl bg-obsidian hover:bg-graphite border border-border hover:border-smoke transition-all flex items-center justify-between group"
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <FolderKanban className="h-4 w-4 text-coral-pulse shrink-0" />
                              <div className="overflow-hidden">
                                <div className="font-sans font-medium text-[14px] text-pure-white truncate group-hover:text-coral-pulse transition-colors">
                                  {p.name}
                                </div>
                                <div className="text-[12px] text-ash truncate">
                                  {p.description ||
                                    `Project Enclave ID: ${p.id}`}
                                </div>
                              </div>
                            </div>
                            <ArrowRight className="h-4 w-4 text-ash group-hover:text-pure-white group-hover:translate-x-1 transition-all shrink-0" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {checkpoints.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <div className="text-[11px] text-ash uppercase tracking-wider font-bold px-2">
                        Cryptographic Checkpoints (`{checkpoints.length}`)
                      </div>
                      <div className="space-y-1.5">
                        {checkpoints.map((c) => (
                          <div
                            key={c.id}
                            onClick={() =>
                              navigateTo(
                                `/projects/${c.projectId}/checkpoints/${encodeURIComponent(c.checkpointHash)}`,
                                `Checkpoint ${c.checkpointHash.slice(0, 8)}...`,
                              )
                            }
                            className="cursor-pointer p-3 rounded-xl bg-obsidian hover:bg-graphite border border-border hover:border-smoke transition-all flex items-center justify-between gap-3 group"
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <Terminal className="h-4 w-4 text-emerald-verify shrink-0" />
                              <div className="overflow-hidden">
                                <div className="text-[13px] text-mist truncate font-sans">
                                  {c.description}
                                </div>
                                <div className="flex items-center gap-2 text-[11px] text-ash">
                                  <span>{c.project?.name || c.projectId}</span>
                                  <span>•</span>
                                  <span className="text-electric-sky truncate">
                                    `{c.checkpointHash.slice(0, 10)}...
                                    {c.checkpointHash.slice(-8)}`
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={(e) => copyHash(e, c.checkpointHash)}
                                className="cursor-pointer p-1.5 rounded hover:bg-obsidian text-ash hover:text-pure-white transition-colors"
                                title="Copy Hash"
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </button>
                              <ArrowRight className="h-4 w-4 text-ash group-hover:text-pure-white group-hover:translate-x-1 transition-all" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="p-3 border-t border-border bg-obsidian/80 flex items-center justify-between text-[11px] font-mono text-ash">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-verify" />
                <span>Indexed on Monad Testnet (`secp256r1`)</span>
              </span>
              <span className="flex items-center gap-2">
                <span>Press</span>
                <kbd className="px-1.5 py-0.5 rounded bg-graphite border border-border text-[10px] text-pure-white">
                  ESC
                </kbd>
                <span>to exit</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
