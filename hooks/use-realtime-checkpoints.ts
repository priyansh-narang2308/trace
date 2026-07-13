"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface Checkpoint {
  id: string;
  projectId: string;
  checkpointHash: string;
  description: string;
  checkpointType: string;
  creatorAddress: string;
  screenshotUrl: string | null;
  collaborators: string[];
  timestamp: string;
  createdAt: string;
}

interface UseRealtimeCheckpointsOptions {
  projectId: string;
  enabled?: boolean;
  pollInterval?: number;
}

export function useRealtimeCheckpoints({
  projectId,
  enabled = true,
  pollInterval = 5000, // 5 seconds
}: UseRealtimeCheckpointsOptions) {
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled || !projectId) return;

    let lastCheckpointCount = 0;

    const fetchCheckpoints = async () => {
      try {
        const response = await fetch(`/api/checkpoints?projectId=${projectId}`);
        if (response.ok) {
          const data = await response.json();
          const newCheckpoints = data.checkpoints || [];

          // Only update if there are new checkpoints
          if (newCheckpoints.length !== lastCheckpointCount) {
            setCheckpoints(newCheckpoints);
            lastCheckpointCount = newCheckpoints.length;

            // Invalidate React Query cache
            queryClient.invalidateQueries({
              queryKey: ["checkpoints", projectId],
            });
          }

          setIsConnected(true);
        }
      } catch (error) {
        console.error("Failed to fetch checkpoints:", error);
        setIsConnected(false);
      }
    };

    // Initial fetch
    fetchCheckpoints();

    // Set up polling
    const intervalId = setInterval(fetchCheckpoints, pollInterval);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [projectId, enabled, pollInterval, queryClient]);

  return {
    checkpoints,
    isConnected,
    refetch: () => {
      queryClient.invalidateQueries({ queryKey: ["checkpoints", projectId] });
    },
  };
}
