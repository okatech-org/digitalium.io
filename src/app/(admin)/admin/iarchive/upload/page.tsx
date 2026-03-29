"use client";
import React from "react";

export default function AdminArchiveUploadPage() {
    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-500 flex items-center justify-center">
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                </div>
                <div>
                    <h1 className="text-xl font-bold">Import en Masse</h1>
                    <p className="text-xs text-muted-foreground">Téléverser et archiver plusieurs documents simultanément</p>
                </div>
            </div>
            <div className="p-8 rounded-xl bg-white/[0.02] border border-white/5 border-dashed text-center">
                <p className="text-sm text-zinc-400">Zone de dépôt — Glissez vos documents ici</p>
            </div>
        </div>
    );
}
