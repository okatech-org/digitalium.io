"use client";

import { useEffect } from "react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Detect ChunkLoadError (stale deployment chunks)
        const isChunkError =
            error.name === "ChunkLoadError" ||
            error.message?.includes("Loading chunk") ||
            error.message?.includes("Failed to fetch dynamically imported module") ||
            error.message?.includes("Importing a module script failed");

        if (isChunkError) {
            // Use sessionStorage to prevent infinite reload loops
            const reloadKey = `chunk-reload-${error.message?.slice(0, 50)}`;
            const hasReloaded = sessionStorage.getItem(reloadKey);

            if (!hasReloaded) {
                sessionStorage.setItem(reloadKey, "true");
                // Hard reload to fetch fresh chunks
                window.location.reload();
                return;
            }
        }
    }, [error]);

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "100vh",
                padding: "2rem",
                fontFamily: "Inter, sans-serif",
                background: "linear-gradient(135deg, #0f0f23 0%, #1a1a3e 100%)",
                color: "#e0e0e0",
            }}
        >
            <div
                style={{
                    maxWidth: "480px",
                    textAlign: "center",
                    padding: "3rem",
                    borderRadius: "1.5rem",
                    background: "rgba(255, 255, 255, 0.05)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                }}
            >
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚡</div>
                <h2
                    style={{
                        fontSize: "1.5rem",
                        fontWeight: 700,
                        marginBottom: "0.75rem",
                        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                    }}
                >
                    Mise à jour disponible
                </h2>
                <p
                    style={{
                        fontSize: "0.95rem",
                        lineHeight: 1.6,
                        color: "#a0a0b8",
                        marginBottom: "2rem",
                    }}
                >
                    Une nouvelle version de l&apos;application a été déployée. Veuillez
                    rafraîchir la page pour continuer.
                </p>
                <button
                    onClick={() => window.location.reload()}
                    style={{
                        padding: "0.75rem 2rem",
                        borderRadius: "0.75rem",
                        border: "none",
                        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                        color: "white",
                        fontSize: "1rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        boxShadow: "0 4px 15px rgba(99, 102, 241, 0.4)",
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow =
                            "0 6px 20px rgba(99, 102, 241, 0.6)";
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow =
                            "0 4px 15px rgba(99, 102, 241, 0.4)";
                    }}
                >
                    Rafraîchir la page
                </button>
                <button
                    onClick={reset}
                    style={{
                        display: "block",
                        margin: "1rem auto 0",
                        padding: "0.5rem 1rem",
                        borderRadius: "0.5rem",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        background: "transparent",
                        color: "#a0a0b8",
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)";
                        e.currentTarget.style.color = "#e0e0e0";
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
                        e.currentTarget.style.color = "#a0a0b8";
                    }}
                >
                    Réessayer sans rafraîchir
                </button>
            </div>
        </div>
    );
}
