"use client";

import { lazy, Suspense, type ComponentType, type ReactNode } from "react";
import { PageLoader, InlineSpinner } from "@/components/ui/loading-states";

interface LazyComponentProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function LazySection({ children, fallback }: LazyComponentProps) {
  return (
    <Suspense fallback={fallback || <PageLoader message="Loading enclave module..." />}>
      {children}
    </Suspense>
  );
}

export function LazyInline({ children, fallback }: LazyComponentProps) {
  return (
    <Suspense fallback={fallback || <InlineSpinner text="Loading..." />}>
      {children}
    </Suspense>
  );
}

export const LazySocialFeed = lazy(() =>
  import("@/components/feed/social-feed").then((mod) => ({ default: mod.SocialFeed }))
);

export const LazyAnalyticsDashboard = lazy(() =>
  import("@/components/analytics/analytics-dashboard").then((mod) => ({
    default: mod.AnalyticsDashboard,
  }))
);

export const LazyNftBadgeMatrix = lazy(() =>
  import("@/components/achievements/nft-badge-matrix").then((mod) => ({
    default: mod.NftBadgeMatrix,
  }))
);

export const LazyProjectComparison = lazy(() =>
  import("@/components/projects/project-comparison").then((mod) => ({
    default: mod.ProjectComparison,
  }))
);

export const LazyExportPanel = lazy(() =>
  import("@/components/projects/export-panel").then((mod) => ({
    default: mod.ExportPanel,
  }))
);

export const LazyLiveEvolutionView = lazy(() =>
  import("@/components/projects/live-evolution-view").then((mod) => ({
    default: mod.LiveEvolutionView,
  }))
);

export const LazyAICheckpointAssistant = lazy(() =>
  import("@/components/ai/ai-checkpoint-assistant").then((mod) => ({
    default: mod.AICheckpointAssistant,
  }))
);
