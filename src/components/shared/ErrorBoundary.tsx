// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Component: ErrorBoundary
// Global error boundary for production resilience
// NEXUS-OMEGA M5 Sprint 9
// ═══════════════════════════════════════════════

"use client";

import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = { hasError: false, error: null };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("[ErrorBoundary]", error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            return (
                <div className="min-h-screen flex items-center justify-center bg-background p-4">
                    <div className="max-w-md w-full text-center space-y-6">
                        <div className="h-20 w-20 mx-auto rounded-2xl bg-red-500/10 flex items-center justify-center">
                            <AlertTriangle className="h-10 w-10 text-red-400" />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold">Erreur inattendue</h1>
                            <p className="text-sm text-muted-foreground">
                                Une erreur est survenue. Veuillez réessayer ou retourner à l&apos;accueil.
                            </p>
                            {process.env.NODE_ENV === "development" && this.state.error && (
                                <pre className="mt-4 p-3 rounded-lg bg-red-500/5 border border-red-500/10 text-xs text-left text-red-300 overflow-auto max-h-40">
                                    {this.state.error.message}
                                </pre>
                            )}
                        </div>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={this.handleReset}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm hover:bg-white/10 transition-colors"
                            >
                                <RefreshCcw className="h-4 w-4" />
                                Réessayer
                            </button>
                            <a
                                href="/"
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-500 text-white text-sm hover:from-violet-700 hover:to-indigo-600 transition-all"
                            >
                                <Home className="h-4 w-4" />
                                Accueil
                            </a>
                        </div>
                        <p className="text-[10px] text-muted-foreground/40">
                            DIGITALIUM.IO · NEOCORTEX OMEGA
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
