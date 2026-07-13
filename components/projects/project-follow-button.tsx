/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck, Loader2, Users } from "lucide-react";

interface ProjectFollowButtonProps {
  projectId: string;
  initialFollowers?: number;
}

export function ProjectFollowButton({
  projectId,
  initialFollowers = 12,
}: ProjectFollowButtonProps) {
  const { address, isConnected } = useAccount();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(initialFollowers);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!projectId || !address) return;
    const storageKey = `trace_following_${projectId}_${address}`;
    const saved = localStorage.getItem(storageKey);
    if (saved === "true") {
      setIsFollowing(true);
    }
  }, [projectId, address]);

  const toggleFollow = async () => {
    if (!isConnected || !address || isLoading) return;

    setIsLoading(true);
    const nextState = !isFollowing;

    try {
      await fetch(`/api/projects/${encodeURIComponent(projectId)}/follow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          action: nextState ? "FOLLOW" : "UNFOLLOW",
        }),
      });

      setIsFollowing(nextState);
      setFollowerCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));

      const storageKey = `trace_following_${projectId}_${address}`;
      localStorage.setItem(storageKey, nextState ? "true" : "false");
    } catch (err) {
      console.error("Failed to toggle follow status:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={toggleFollow}
      disabled={isLoading || !isConnected}
      className={`cursor-pointer h-9 px-4 rounded-lg font-mono text-[13px] font-medium transition-all shadow-sm flex items-center gap-2 border ${
        isFollowing
          ? "bg-obsidian hover:bg-graphite text-emerald-verify border-emerald-verify/40"
          : "bg-mist hover:bg-pure-white text-void-black border-border shadow-md"
      }`}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin shrink-0" />
      ) : isFollowing ? (
        <BookmarkCheck className="h-4 w-4 shrink-0 text-emerald-verify" />
      ) : (
        <Bookmark className="h-4 w-4 shrink-0" />
      )}
      <span>{isFollowing ? "Following Enclave" : "Follow Enclave"}</span>
      <span
        className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
          isFollowing
            ? "bg-ink text-emerald-verify border border-border"
            : "bg-obsidian text-pure-white"
        }`}
      >
        {followerCount}
      </span>
    </Button>
  );
}
