"use client";

// ═══════════════════════════════════════════════════════════════
// DIGITALIUM.IO — AuthLoader
// Elegant loading animation during auth resolution
// ═══════════════════════════════════════════════════════════════

import React from "react";

interface AuthLoaderProps {
    message?: string;
}

export function AuthLoader({
    message = "Vérification des accès…",
}: AuthLoaderProps) {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gradient-bg">
            {/* Animated rings */}
            <div className="relative w-20 h-20 mb-6">
                <div
                    className="absolute inset-0 rounded-full border-2 border-transparent"
                    style={{
                        borderTopColor: "var(--accent-primary, #6C63FF)",
                        animation: "spin 1s linear infinite",
                    }}
                />
                <div
                    className="absolute inset-2 rounded-full border-2 border-transparent"
                    style={{
                        borderTopColor: "var(--accent-secondary, #00D9FF)",
                        animation: "spin 1.5s linear infinite reverse",
                    }}
                />
                <div
                    className="absolute inset-4 rounded-full border-2 border-transparent"
                    style={{
                        borderTopColor: "var(--accent-tertiary, #FF6B6B)",
                        animation: "spin 2s linear infinite",
                    }}
                />
                {/* Center dot */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div
                        className="w-2 h-2 rounded-full"
                        style={{
                            background:
                                "linear-gradient(135deg, #6C63FF, #00D9FF)",
                            animation: "pulse 1.5s ease-in-out infinite",
                        }}
                    />
                </div>
            </div>

            {/* Logo text */}
            <h2
                className="text-xl font-bold tracking-wider mb-2"
                style={{
                    background:
                        "linear-gradient(135deg, #6C63FF, #00D9FF)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                }}
            >
                DIGITALIUM
            </h2>

            {/* Message */}
            <p className="text-sm text-white/50">{message}</p>

            {/* Inline keyframes */}
            <style jsx>{`
                @keyframes spin {
                    to {
                        transform: rotate(360deg);
                    }
                }
                @keyframes pulse {
                    0%,
                    100% {
                        opacity: 0.4;
                        transform: scale(1);
                    }
                    50% {
                        opacity: 1;
                        transform: scale(1.5);
                    }
                }
            `}</style>
        </div>
    );
}
