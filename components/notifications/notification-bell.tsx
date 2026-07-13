/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bell, CheckCircle2, ShieldCheck, Users, Zap, X, ArrowRight, Check } from "lucide-react";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: "CHECKPOINT" | "COLLABORATION" | "FINALITY" | "ALERT";
  read: boolean;
  link?: string;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const mockNotes: NotificationItem[] = [
      {
        id: "note-1",
        title: "Sub-Second Finality Anchor",
        message: "Checkpoint 0xa8f19... verified on Monad Testnet block #1049281 with 21,000 gas.",
        timestamp: "Just now",
        type: "FINALITY",
        read: false,
        link: "/projects",
      },
      {
        id: "note-2",
        title: "New Co-Signer Invited",
        message: "Collaborator @0x71...88ab joined your Cryptographic Enclave matrix.",
        timestamp: "5m ago",
        type: "COLLABORATION",
        read: false,
      },
      {
        id: "note-3",
        title: "Micro-Checkpoint Staged",
        message: "Commit 'Optimized 1-second finality flow' anchored to immutable ledger.",
        timestamp: "12m ago",
        type: "CHECKPOINT",
        read: true,
      },
    ];
    setNotifications(mockNotes);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <div className="relative font-mono">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open notifications drawer"
        className="cursor-pointer relative p-2 rounded-lg bg-obsidian hover:bg-graphite border border-border text-pure-white transition-all shadow-sm flex items-center justify-center"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg-coral-pulse text-pure-white font-bold text-[10px] flex items-center justify-center animate-pulse border border-ink">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-[360px] sm:w-[400px] rounded-xl bg-ink border border-border shadow-key z-50 animate-fade-in overflow-hidden">
          <div className="p-3.5 bg-obsidian border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-coral-pulse" />
              <span className="text-[13px] font-sans font-medium text-pure-white">
                Cryptographic Enclave Alerts (`{unreadCount}` Unread)
              </span>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="cursor-pointer text-[11px] text-electric-sky hover:underline flex items-center gap-1"
                >
                  <Check className="h-3 w-3" />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="cursor-pointer p-1 text-ash hover:text-pure-white rounded hover:bg-graphite"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="max-h-[380px] overflow-y-auto divide-y divide-border/60">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-ash text-[12px] space-y-1">
                <div>No telemetry notifications recorded.</div>
              </div>
            ) : (
              notifications.map((note) => (
                <div
                  key={note.id}
                  onClick={() => markRead(note.id)}
                  className={`cursor-pointer p-3.5 transition-colors flex items-start gap-3 ${
                    !note.read ? "bg-obsidian/80 hover:bg-obsidian" : "hover:bg-obsidian/40"
                  }`}
                >
                  <div className="mt-0.5 h-7 w-7 rounded-full bg-graphite border border-border flex items-center justify-center shrink-0">
                    {note.type === "FINALITY" ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-verify" />
                    ) : note.type === "COLLABORATION" ? (
                      <Users className="h-3.5 w-3.5 text-electric-sky" />
                    ) : (
                      <Zap className="h-3.5 w-3.5 text-coral-pulse" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1 overflow-hidden">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[13px] font-sans font-medium text-pure-white truncate">
                        {note.title}
                      </span>
                      <span className="text-[10px] text-ash shrink-0">{note.timestamp}</span>
                    </div>
                    <p className="text-[12px] text-ash leading-[1.5] font-sans break-words">
                      {note.message}
                    </p>
                    {note.link && (
                      <Link
                        href={note.link}
                        onClick={() => setIsOpen(false)}
                        className="cursor-pointer inline-flex items-center gap-1 text-[11px] text-electric-sky hover:underline pt-1"
                      >
                        <span>View Ledger Anchor</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                  {!note.read && (
                    <span className="mt-1 h-2 w-2 rounded-full bg-coral-pulse shrink-0" />
                  )}
                </div>
              ))
            )}
          </div>

          <div className="p-2.5 bg-obsidian border-t border-border text-center text-[11px] text-ash flex items-center justify-center gap-1">
            <ShieldCheck className="h-3 w-3 text-emerald-verify" />
            <span>Monad P-256 Event Telemetry Active</span>
          </div>
        </div>
      )}
    </div>
  );
}
