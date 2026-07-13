"use client";

import { Component, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Terminal, ShieldCheck } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackMessage?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error("TRACE ErrorBoundary caught:", error);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    toast.info("Retrying component render...");
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 rounded-xl bg-ink border border-coral-pulse/40 shadow-key space-y-4 text-center">
          <div className="flex items-center justify-center">
            <div className="h-14 w-14 rounded-xl bg-obsidian border border-border flex items-center justify-center">
              <AlertTriangle className="h-7 w-7 text-coral-pulse" />
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="text-[16px] font-medium text-pure-white font-sans">
              Enclave Rendering Error
            </h3>
            <p className="text-[13px] font-mono text-ash max-w-md mx-auto">
              {this.props.fallbackMessage ||
                "A component in this TRACE enclave encountered an unexpected state. This does not affect on-chain data integrity."}
            </p>
          </div>

          {this.state.error && (
            <div className="p-3 rounded-lg bg-obsidian border border-border text-left font-mono text-[12px] text-coral-pulse max-w-lg mx-auto overflow-auto">
              <div className="flex items-center gap-1.5 text-ash mb-1">
                <Terminal className="h-3 w-3" />
                <span>Error Trace:</span>
              </div>
              <code>{this.state.error.message}</code>
            </div>
          )}

          <Button
            type="button"
            onClick={this.handleRetry}
            className="cursor-pointer bg-graphite hover:bg-slate text-pure-white font-mono text-[13px] border border-border gap-2 px-5 h-10 rounded-xl"
          >
            <RefreshCw className="h-4 w-4 text-coral-pulse" />
            <span>Retry Render</span>
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  variant?: "inline" | "card";
}

export function ErrorMessage({
  title = "Enclave Error",
  message,
  onRetry,
  variant = "card",
}: ErrorMessageProps) {
  if (variant === "inline") {
    return (
      <div className="flex items-center gap-2 p-3 rounded-lg bg-obsidian border border-coral-pulse/40 text-[12px] font-mono">
        <AlertTriangle className="h-4 w-4 text-coral-pulse shrink-0" />
        <span className="text-coral-pulse">{message}</span>
        {onRetry && (
          <button
            type="button"
            onClick={() => {
              onRetry();
              toast.info("Retrying operation...");
            }}
            className="cursor-pointer ml-auto text-electric-sky hover:underline shrink-0"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 rounded-xl bg-ink border border-coral-pulse/40 shadow-key space-y-4 text-center">
      <AlertTriangle className="h-8 w-8 text-coral-pulse mx-auto" />
      <div className="space-y-1">
        <h3 className="text-[16px] font-medium text-pure-white font-sans">{title}</h3>
        <p className="text-[13px] font-mono text-ash max-w-md mx-auto">{message}</p>
      </div>
      {onRetry && (
        <Button
          type="button"
          onClick={() => {
            onRetry();
            toast.info("Retrying operation...");
          }}
          className="cursor-pointer bg-graphite hover:bg-slate text-pure-white font-mono text-[13px] border border-border gap-2 px-5 h-10 rounded-xl"
        >
          <RefreshCw className="h-4 w-4 text-coral-pulse" />
          <span>Retry</span>
        </Button>
      )}
    </div>
  );
}

interface RetryWrapperProps {
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  children: ReactNode;
  loadingMessage?: string;
}

export function RetryWrapper({
  isLoading,
  error,
  onRetry,
  children,
  loadingMessage,
}: RetryWrapperProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-ash font-mono text-[13px]">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full border-2 border-coral-pulse border-t-transparent animate-spin" />
          <span>{loadingMessage || "Syncing with Monad RPC..."}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={onRetry} />;
  }

  return <>{children}</>;
}
