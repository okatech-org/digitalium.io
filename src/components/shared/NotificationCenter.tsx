"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — NotificationCenter
// In-app notification dropdown with unread badge
// Reads from alert_logs + audit_logs via Convex
// ═══════════════════════════════════════════════

import React, { useState, useRef, useEffect } from "react";
import {
    Bell,
    CheckCheck,
    Archive,
    FileText,
    PenTool,
    ShieldAlert,
    Loader2,
    Users,
    X,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useAuth } from "@/hooks/useAuth";
import { useConvexOrgId } from "@/hooks/useConvexOrgId";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ─── Icon map ──────────────────────────────────

const NOTIFICATION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
    "retention_alert": Archive,
    "document.submitted": FileText,
    "document.approved": FileText,
    "document.rejected": FileText,
    "archive.created": Archive,
    "archive.legal_hold_applied": ShieldAlert,
    "archive.destroyed": Archive,
    "signature.requested": PenTool,
    "signature.completed": PenTool,
    "lead.converted": Users,
};



// ─── Time formatter ────────────────────────────

function timeAgo(timestamp: number): string {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "À l'instant";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `il y a ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `il y a ${days}j`;
    return new Date(timestamp).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
    });
}

// ─── Component ─────────────────────────────────

export default function NotificationCenter() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { user } = useAuth();
    const { convexOrgId } = useConvexOrgId();
    const userId = user?.uid;

    // Queries
    const notifications = useQuery(
        api.notifications.listForUser,
        userId && convexOrgId
            ? { userId, organizationId: convexOrgId, limit: 30 }
            : "skip"
    );

    const unreadCount = useQuery(
        api.notifications.countUnread,
        userId && convexOrgId
            ? { userId, organizationId: convexOrgId }
            : "skip"
    );

    // Mutations
    const markAsRead = useMutation(api.notifications.markAsRead);
    const markAllAsRead = useMutation(api.notifications.markAllAsRead);

    // Close on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        if (isOpen) {
            document.addEventListener("mousedown", handleClick);
            return () => document.removeEventListener("mousedown", handleClick);
        }
    }, [isOpen]);

    const count = unreadCount?.count ?? 0;

    const handleMarkAllRead = async () => {
        if (userId && convexOrgId) {
            await markAllAsRead({ userId, organizationId: convexOrgId });
        }
    };

    const handleMarkRead = async (notification: { type: string; status: string; id: string }) => {
        if (notification.type === "retention_alert" && notification.status === "sent") {
            await markAsRead({ alertLogId: notification.id as Id<"alert_logs"> });
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-lg hover:bg-white/[0.06] transition-colors"
                aria-label="Notifications"
            >
                <Bell className="h-5 w-5 text-white/50" />
                {count > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
                        {count > 99 ? "99+" : count}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-[380px] max-h-[480px] rounded-xl border border-white/10 bg-[#0a0a0f]/95 backdrop-blur-xl shadow-2xl z-50 flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-white/80">
                                Notifications
                            </h3>
                            {count > 0 && (
                                <Badge className="bg-red-500/15 text-red-400 border-red-500/20 text-[10px] px-1.5 py-0 h-4">
                                    {count} non lue{count > 1 ? "s" : ""}
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            {count > 0 && (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={handleMarkAllRead}
                                    className="h-7 text-[11px] text-white/40 hover:text-white/70 gap-1"
                                >
                                    <CheckCheck className="h-3.5 w-3.5" />
                                    Tout lire
                                </Button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                title="Fermer les notifications"
                                className="p-1 rounded hover:bg-white/[0.06] text-white/50 hover:text-white/60"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto">
                        {notifications === undefined ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-5 w-5 animate-spin text-white/20" />
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center py-12 px-6 text-center">
                                <div className="h-12 w-12 rounded-xl bg-white/[0.04] flex items-center justify-center mb-3">
                                    <Bell className="h-6 w-6 text-white/20" />
                                </div>
                                <p className="text-sm text-white/40">
                                    Aucune notification
                                </p>
                                <p className="text-xs text-white/20 mt-1">
                                    Vous serez notifié des événements importants
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {notifications.map((notif) => {
                                    const Icon = notif.type === "retention_alert"
                                        ? Archive
                                        : NOTIFICATION_ICONS[notif.title] ?? Bell;
                                    const isUnread = notif.status === "sent";

                                    return (
                                        <button
                                            key={notif.id}
                                            onClick={() => handleMarkRead(notif)}
                                            className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors text-left ${
                                                isUnread ? "bg-violet-500/[0.03]" : ""
                                            }`}
                                        >
                                            <div className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${
                                                isUnread
                                                    ? "bg-violet-500/15"
                                                    : "bg-white/[0.04]"
                                            }`}>
                                                <Icon className={`h-4 w-4 ${
                                                    isUnread
                                                        ? "text-violet-400"
                                                        : "text-white/50"
                                                }`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm leading-tight ${
                                                    isUnread
                                                        ? "font-medium text-white/80"
                                                        : "text-white/50"
                                                }`}>
                                                    {notif.title}
                                                </p>
                                                <p className="text-xs text-white/50 mt-0.5 truncate">
                                                    {notif.description}
                                                </p>
                                                <p className="text-[10px] text-white/20 mt-1">
                                                    {timeAgo(notif.sentAt)}
                                                </p>
                                            </div>
                                            {isUnread && (
                                                <div className="mt-2 h-2 w-2 rounded-full bg-violet-400 shrink-0" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
