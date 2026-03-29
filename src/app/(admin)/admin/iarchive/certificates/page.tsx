"use client";
import React from "react";

export default function AdminCertificatesPage() {
    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-500 flex items-center justify-center">
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                </div>
                <div>
                    <h1 className="text-xl font-bold">Certificats d'Intégrité</h1>
                    <p className="text-xs text-muted-foreground">Vérification SHA-256 de tous les documents archivés</p>
                </div>
            </div>
            <div className="p-8 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                <p className="text-sm text-zinc-400">Registre des certificats d'intégrité</p>
            </div>
        </div>
    );
}
