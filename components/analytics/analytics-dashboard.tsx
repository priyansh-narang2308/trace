"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  Users,
  ShieldCheck,
  Terminal,
  Clock,
  CheckCircle2,
  GitCommit,
  Flame,
  Sparkles,
  Layers,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Loader2,
} from "lucide-react";

interface AnalyticsData {
  totalProjects: number;
  totalCheckpoints: number;
  totalCollaborators: number;
  verifiedAnchors: number;
  verificationRate: number;
  avgCheckpointsPerProject: number;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    projectName: string;
  }>;
  checkpointsByType: Array<{
    type: string;
    count: number;
    color: string;
  }>;
  weeklyTrend: number[];
}

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState("7D");

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/analytics");
        if (res.ok) {
          const result = await res.json();
          setData(result);
        }
      } catch {
        toast.error("Failed to load analytics data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-coral-pulse" />
          <span className="text-[13px] font-mono text-ash">
            Loading Monad enclave metrics...
          </span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20 text-ash font-mono text-[14px]">
        Failed to load analytics data.
      </div>
    );
  }

  const statCards = [
    {
      label: "Active Enclaves",
      value: data.totalProjects,
      icon: Layers,
      iconColor: "text-coral-pulse",
      change: `+${data.totalProjects}`,
      changeUp: true,
    },
    {
      label: "Total Checkpoints",
      value: data.totalCheckpoints,
      icon: GitCommit,
      iconColor: "text-electric-sky",
      change: `+${data.totalCheckpoints}`,
      changeUp: true,
    },
    {
      label: "Verified On-Chain",
      value: data.verifiedAnchors,
      icon: ShieldCheck,
      iconColor: "text-emerald-verify",
      change: `${data.verificationRate.toFixed(1)}%`,
      changeUp: data.verificationRate > 50,
    },
    {
      label: "Team Signers",
      value: data.totalCollaborators,
      icon: Users,
      iconColor: "text-purple-400",
      change: `+${data.totalCollaborators}`,
      changeUp: true,
    },
  ];

  const maxTypeCount = Math.max(
    ...data.checkpointsByType.map((t) => t.count),
    1,
  );
  const maxWeekly = Math.max(...data.weeklyTrend, 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[24px] font-medium tracking-tight text-pure-white font-sans">
            Monad Enclave Analytics
          </h2>
          <p className="text-[13px] font-mono text-ash mt-1">
            Real-time verification metrics across all TRACE project enclaves
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-obsidian rounded-xl border border-border p-1 font-mono text-[12px]">
          {["24H", "7D", "30D", "ALL"].map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => {
                setSelectedTimeframe(tf);
                toast.info(`Analytics timeframe: ${tf}`);
              }}
              className={`cursor-pointer px-3 py-1.5 rounded-lg transition-all ${
                selectedTimeframe === tf
                  ? "bg-graphite text-pure-white border border-coral-pulse/50 font-bold"
                  : "text-ash hover:text-pure-white"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card
            key={stat.label}
            className="bg-ink border border-border shadow-key"
          >
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-[11px] font-mono text-ash uppercase tracking-wider">
                  {stat.label}
                </div>
                <div className="text-[28px] font-medium text-pure-white leading-none">
                  {stat.value.toLocaleString()}
                </div>
                <div className="flex items-center gap-1 text-[12px] font-mono text-emerald-verify">
                  <ArrowUpRight className="h-3 w-3" />
                  <span>{stat.change}</span>
                </div>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.iconColor} opacity-70`} />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-ink border border-border shadow-key">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-[14px] font-medium text-pure-white flex items-center gap-2 font-sans">
              <Activity className="h-4 w-4 text-coral-pulse" />
              <span>Weekly Checkpoint Velocity</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 font-mono">
            <div className="flex items-end justify-between gap-2 h-32">
              {data.weeklyTrend.map((val, idx) => {
                const height = (val / maxWeekly) * 100;
                const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
                return (
                  <div
                    key={idx}
                    className="flex flex-col items-center gap-1.5 flex-1"
                  >
                    <span className="text-[10px] text-ash">{val}</span>
                    <div
                      className="w-full rounded-t-md bg-coral-pulse/80 hover:bg-coral-pulse transition-colors cursor-pointer"
                      style={{ height: `${height}%`, minHeight: "4px" }}
                      onClick={() =>
                        toast.info(`${days[idx]}: ${val} checkpoints anchored`)
                      }
                    />
                    <span className="text-[10px] text-ash">{days[idx]}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-ink border border-border shadow-key">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-[14px] font-medium text-pure-white flex items-center gap-2 font-sans">
              <BarChart3 className="h-4 w-4 text-electric-sky" />
              <span>Checkpoints by Type</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3 font-mono">
            {data.checkpointsByType.map((item) => (
              <div key={item.type} className="space-y-1.5">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-mist font-medium">{item.type}</span>
                  <span className="text-pure-white font-bold">
                    {item.count}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-graphite overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all duration-500`}
                    style={{ width: `${(item.count / maxTypeCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {data.checkpointsByType.length === 0 && (
              <div className="text-center py-6 text-ash text-[12px]">
                No checkpoints created yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-ink border border-border shadow-key">
        <CardHeader className="pb-3 border-b border-border">
          <CardTitle className="text-[14px] font-medium text-pure-white flex items-center gap-2 font-sans">
            <Clock className="h-4 w-4 text-emerald-verify" />
            <span>Recent Monad Testnet Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 font-mono">
          {data.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {data.recentActivity.slice(0, 8).map((act) => (
                <div
                  key={act.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-obsidian border border-border hover:border-smoke transition-colors"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="h-8 w-8 rounded-lg bg-graphite border border-border flex items-center justify-center shrink-0">
                      {act.type === "DEPLOYMENT" && (
                        <Zap className="h-4 w-4 text-emerald-verify" />
                      )}
                      {act.type === "MILESTONE" && (
                        <Sparkles className="h-4 w-4 text-coral-pulse" />
                      )}
                      {act.type === "GIT_COMMIT" && (
                        <GitCommit className="h-4 w-4 text-electric-sky" />
                      )}
                      {act.type === "REVIEW" && (
                        <ShieldCheck className="h-4 w-4 text-purple-400" />
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-[13px] text-pure-white truncate font-sans font-medium">
                        {act.description}
                      </div>
                      <div className="text-[11px] text-ash flex items-center gap-2">
                        <span>{act.projectName}</span>
                        <span>·</span>
                        <span>
                          {new Date(act.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-graphite text-electric-sky border border-border shrink-0">
                    {act.type}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-ash text-[12px]">
              No recent activity to display
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
