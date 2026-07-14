"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Terminal,
  ShieldCheck,
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
  ExternalLink,
  Flame,
  Clock,
  CheckCircle2,
  Filter,
  ArrowRight,
  GitCommit,
  Zap,
} from "lucide-react";

interface FeedItem {
  id: string;
  projectId: string;
  projectName: string;
  checkpointHash: string;
  description: string;
  checkpointType: string;
  creatorAddress: string;
  timestamp: string;
  txHash?: string | null;
  likes: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
}

export function SocialFeed() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);

  const fetchFeed = useCallback(async (reset?: boolean) => {
    if (reset) {
      setIsLoading(true);
      setOffset(0);
    }
    const currentOffset = reset ? 0 : offset;
    try {
      const res = await fetch(
        `/api/feed?offset=${currentOffset}&limit=20`
      );
      if (res.ok) {
        const data = await res.json();
        if (reset) {
          setItems(data.feed || []);
        } else {
          setItems((prev) => [...prev, ...(data.feed || [])]);
        }
        setTotal(data.total || 0);
        setOffset(currentOffset + (data.feed?.length || 0));
      }
    } catch {
      toast.error("Failed to load feed");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [offset]);

  useEffect(() => {
    fetchFeed(true);
  }, []);

  const toggleLike = (id: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextLiked = !item.isLiked;
          if (nextLiked) toast.success("Milestone Proof endorsed!");
          return {
            ...item,
            isLiked: nextLiked,
            likes: nextLiked ? item.likes + 1 : item.likes - 1,
          };
        }
        return item;
      })
    );
  };

  const toggleBookmark = (id: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextBookmarked = !item.isBookmarked;
          toast.success(
            nextBookmarked
              ? "Saved to your Monad Watchlist!"
              : "Removed from Watchlist"
          );
          return {
            ...item,
            isBookmarked: nextBookmarked,
          };
        }
        return item;
      })
    );
  };

  const copyDigest = (hash: string) => {
    navigator.clipboard.writeText(hash);
    toast.success("Cryptographic checkpoint digest copied to clipboard!");
  };

  const shareItem = (projectName: string) => {
    navigator.clipboard.writeText(window.location.origin + "/feed");
    toast.success(`Share link for ${projectName} copied!`);
  };

  const loadMore = () => {
    setIsLoadingMore(true);
    fetchFeed();
  };

  const filteredItems = items.filter((item) => {
    if (activeFilter === "ALL") return true;
    if (activeFilter === "VERIFIED") return item.txHash && item.txHash !== "0x";
    if (activeFilter === "DEPLOYMENTS") return item.checkpointType === "DEPLOYMENT";
    if (activeFilter === "COMMITS") return item.checkpointType === "GIT_COMMIT";
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-[16px] bg-ink border border-border">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
          {[
            { id: "ALL", label: "Live Feed (`Monad Testnet`)" },
            { id: "VERIFIED", label: "On-Chain Verified (`0x0100`)" },
            { id: "DEPLOYMENTS", label: "Deployments" },
            { id: "COMMITS", label: "Git Anchors" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveFilter(tab.id);
                toast.info(`Filtered feed by: ${tab.label.replace(/`|\(|\)/g, "")}`);
              }}
              className={`cursor-pointer px-3 py-1.5 rounded-lg text-[13px] font-mono transition-all shrink-0 border ${
                activeFilter === tab.id
                  ? "bg-graphite text-pure-white border-coral-pulse/60 font-medium shadow-sm"
                  : "bg-obsidian text-ash border-border hover:text-pure-white hover:border-smoke"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-[12px] font-mono text-emerald-verify px-3 py-1.5 rounded-lg bg-obsidian border border-border self-end sm:self-auto">
          <span className="h-2 w-2 rounded-full bg-emerald-verify animate-pulse" />
          <span>Sub-Second Finality Sync</span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 rounded-full border-2 border-coral-pulse border-t-transparent animate-spin" />
            <span className="text-[13px] font-mono text-ash">Loading Monad Testnet feed...</span>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <Card key={item.id} className="bg-ink border border-border shadow-key hover:border-smoke transition-all duration-200">
              <CardContent className="p-6 space-y-4 font-mono">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-graphite border border-border flex items-center justify-center text-coral-pulse shrink-0 font-bold text-[14px]">
                      {item.projectName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <Link
                        href={`/projects/${item.projectId}`}
                        className="cursor-pointer font-sans text-[16px] font-medium text-pure-white hover:text-coral-pulse transition-colors flex items-center gap-1.5"
                      >
                        <span>{item.projectName}</span>
                        <ArrowRight className="h-3.5 w-3.5 opacity-60" />
                      </Link>
                      <div className="flex items-center gap-2 text-[12px] text-ash">
                        <span>Signer: @{item.creatorAddress}</span>
                        <span>•</span>
                        <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <span className="px-2.5 py-1 rounded text-[11px] uppercase tracking-wider bg-graphite text-electric-sky border border-border">
                      {item.checkpointType}
                    </span>
                    {item.txHash && item.txHash !== "0x" ? (
                      <a
                        href={`https://testnet.monadexplorer.com/tx/${item.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cursor-pointer flex items-center gap-1 px-2.5 py-1 rounded bg-graphite text-emerald-verify border border-emerald-verify/40 text-[11px] hover:bg-slate transition-colors"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Verified (`0x0100`)</span>
                      </a>
                    ) : (
                      <span className="px-2.5 py-1 rounded bg-obsidian text-ash border border-border text-[11px]">
                        Staged Off-Chain
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-[14px] leading-[1.7] text-mist font-sans">
                  <p>{item.description}</p>
                </div>

                <div className="p-3 rounded-lg bg-obsidian border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[12px] text-ash">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Terminal className="h-4 w-4 text-coral-pulse shrink-0" />
                    <span className="truncate text-pure-white">
                      Digest: `{item.checkpointHash.slice(0, 14)}...{item.checkpointHash.slice(-10)}`
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyDigest(item.checkpointHash)}
                    className="cursor-pointer text-electric-sky hover:underline shrink-0 self-start sm:self-auto"
                  >
                    Copy Keccak256
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border text-[13px]">
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => toggleLike(item.id)}
                      className={`cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
                        item.isLiked
                          ? "bg-coral-pulse/10 border-coral-pulse text-coral-pulse font-medium"
                          : "bg-obsidian border-border text-ash hover:text-pure-white hover:border-smoke"
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${item.isLiked ? "fill-coral-pulse" : ""}`} />
                      <span>{item.likes} Endorsements</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => shareItem(item.projectName)}
                      className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-obsidian border border-border text-ash hover:text-pure-white hover:border-smoke transition-all"
                    >
                      <Share2 className="h-4 w-4" />
                      <span>Share Proof</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleBookmark(item.id)}
                    className={`cursor-pointer p-2 rounded-lg border transition-all ${
                      item.isBookmarked
                        ? "bg-electric-sky/10 border-electric-sky text-electric-sky"
                        : "bg-obsidian border-border text-ash hover:text-pure-white hover:border-smoke"
                    }`}
                    title="Save to Watchlist"
                  >
                    <Bookmark className={`h-4 w-4 ${item.isBookmarked ? "fill-electric-sky" : ""}`} />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredItems.length === 0 && (
            <div className="text-center py-16 text-ash text-[14px] font-mono">
              <p>No checkpoints found</p>
              <p className="text-[12px] mt-2">Create a checkpoint to see it appear in the feed.</p>
            </div>
          )}
        </div>
      )}

      {items.length < total && !isLoading && (
        <div className="flex justify-center pt-4">
          <Button
            type="button"
            onClick={loadMore}
            disabled={isLoadingMore}
            className="cursor-pointer bg-graphite hover:bg-slate text-pure-white border border-border px-6 py-2.5 rounded-xl font-mono text-[13px] gap-2 shadow-key"
          >
            {isLoadingMore ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-coral-pulse border-t-transparent animate-spin" />
                <span>Querying Monad RPC Ring...</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-coral-pulse" />
                <span>Load Live Milestones</span>
              </span>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
