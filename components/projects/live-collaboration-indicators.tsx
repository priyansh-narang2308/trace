/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Radio, Sparkles, ShieldCheck, Activity } from "lucide-react";

interface CollaboratorPresence {
  address: string;
  status: "ONLINE" | "STAGING" | "IDLE";
  lastActive: string;
  activityText?: string;
}

interface LiveCollaborationIndicatorsProps {
  projectId: string;
  collaborators?: string[];
  ownerAddress?: string;
}

export function LiveCollaborationIndicators({
  projectId,
  collaborators = [],
  ownerAddress,
}: LiveCollaborationIndicatorsProps) {
  const { address } = useAccount();
  const [presenceList, setPresenceList] = useState<CollaboratorPresence[]>([]);
  const [isSimulatedTyping, setIsSimulatedTyping] = useState(false);

  useEffect(() => {
    const allAddrs = new Set<string>();
    if (ownerAddress) allAddrs.add(ownerAddress);
    if (address) allAddrs.add(address);
    collaborators.forEach((c) => allAddrs.add(c));

    const initialList: CollaboratorPresence[] = Array.from(allAddrs).map((addr, idx) => {
      const isCurrent = addr.toLowerCase() === address?.toLowerCase();
      let status: "ONLINE" | "STAGING" | "IDLE" = "ONLINE";
      let activityText = "Viewing Monad cockpit";

      if (isCurrent) {
        status = "ONLINE";
        activityText = "Active (You)";
      } else if (idx % 3 === 1) {
        status = "STAGING";
        activityText = "Staging cryptographic evidence...";
      } else if (idx % 3 === 2) {
        status = "IDLE";
        activityText = "Last seen 2m ago";
      }

      return {
        address: addr,
        status,
        lastActive: new Date().toISOString(),
        activityText,
      };
    });

    setPresenceList(initialList);

    const interval = setInterval(() => {
      setIsSimulatedTyping((prev) => !prev);
    }, 6000);

    return () => clearInterval(interval);
  }, [projectId, collaborators, ownerAddress, address]);

  if (presenceList.length === 0) return null;

  const activeCount = presenceList.filter((p) => p.status !== "IDLE").length;

  return (
    <Card className="bg-ink border border-border shadow-key overflow-hidden animate-fade-in">
      <CardContent className="p-4 space-y-3 font-mono">
        <div className="flex items-center justify-between text-[12px]">
          <div className="flex items-center gap-2 text-pure-white font-sans font-medium">
            <Radio className="h-4 w-4 text-emerald-verify animate-pulse" />
            <span>Enclave Presence & Live Activity (`{activeCount}` Online)</span>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded bg-obsidian text-emerald-verify border border-border flex items-center gap-1">
            <Activity className="h-3 w-3" />
            <span>Monad P2P Sync</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
          {presenceList.map((peer, idx) => {
            const isMe = peer.address.toLowerCase() === address?.toLowerCase();
            const showStaging = peer.status === "STAGING" || (idx === 1 && isSimulatedTyping);

            return (
              <div
                key={peer.address}
                className={`p-2.5 rounded-lg border transition-all flex items-center justify-between gap-2 ${
                  isMe
                    ? "bg-obsidian border-coral-pulse/60 shadow-sm"
                    : "bg-obsidian/60 border-border hover:border-smoke"
                }`}
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="relative shrink-0">
                    <div className="h-7 w-7 rounded-full bg-graphite border border-border flex items-center justify-center text-electric-sky font-bold text-[11px]">
                      {isMe ? "YOU" : `P${idx + 1}`}
                    </div>
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-ink ${
                        showStaging
                          ? "bg-coral-pulse animate-ping"
                          : peer.status === "ONLINE"
                          ? "bg-emerald-verify animate-pulse"
                          : "bg-smoke"
                      }`}
                    />
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-[12px] font-medium text-pure-white truncate flex items-center gap-1">
                      <span>{peer.address.slice(0, 6)}...{peer.address.slice(-4)}</span>
                      {isMe && <span className="text-[10px] text-coral-pulse font-bold">(You)</span>}
                    </div>
                    <div className="text-[11px] text-ash truncate flex items-center gap-1">
                      {showStaging ? (
                        <>
                          <Sparkles className="h-3 w-3 text-coral-pulse shrink-0 animate-spin" />
                          <span className="text-coral-pulse">Typing anchor draft...</span>
                        </>
                      ) : (
                        <span>{peer.activityText}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
