/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useCallback } from "react";

export interface RealtimeCheckpoint {
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
  createdAt?: string;
}

export type ConnectionState = "CONNECTING" | "CONNECTED" | "DISCONNECTED" | "ERROR";

export function useRealtimeTimeline(projectId: string) {
  const [checkpoints, setCheckpoints] = useState<RealtimeCheckpoint[]>([]);
  const [connectionState, setConnectionState] = useState<ConnectionState>("CONNECTING");
  const [lastPing, setLastPing] = useState<string | null>(null);

  const addLocalCheckpoint = useCallback((newCp: RealtimeCheckpoint) => {
    setCheckpoints((prev) => {
      const exists = prev.some((p) => p.checkpointHash === newCp.checkpointHash);
      if (exists) return prev;
      return [newCp, ...prev];
    });
  }, []);

  useEffect(() => {
    if (!projectId) return;

    setConnectionState("CONNECTING");
    const eventSource = new EventSource(`/api/ws/checkpoints?projectId=${encodeURIComponent(projectId)}`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "INIT_TIMELINE") {
          setCheckpoints(data.checkpoints || []);
          setConnectionState("CONNECTED");
        } else if (data.type === "NEW_CHECKPOINTS") {
          const incoming: RealtimeCheckpoint[] = data.checkpoints || [];
          setCheckpoints((prev) => {
            const existingHashes = new Set(prev.map((p) => p.checkpointHash));
            const uniqueIncoming = incoming.filter((p) => !existingHashes.has(p.checkpointHash));
            if (uniqueIncoming.length === 0) return prev;
            return [...uniqueIncoming, ...prev];
          });
          setConnectionState("CONNECTED");
        } else if (data.type === "PING") {
          setLastPing(data.timestamp);
          setConnectionState("CONNECTED");
        }
      } catch (err) {
        console.error("Failed to parse realtime message:", err);
      }
    };

    eventSource.onerror = () => {
      setConnectionState("ERROR");
    };

    return () => {
      eventSource.close();
      setConnectionState("DISCONNECTED");
    };
  }, [projectId]);

  return { checkpoints, connectionState, lastPing, addLocalCheckpoint, setCheckpoints };
}
