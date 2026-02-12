// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Page: Intégrations API
// ═══════════════════════════════════════════════

"use client";

import React from "react";
import { motion } from "framer-motion";
import { Plug, Search, Plus, Filter, Download, ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export default function IntégrationsAPIPage() {
    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center">
                        <Plug className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">Connexions et API</h1>
                        <p className="text-xs text-muted-foreground">Connectez vos outils et gérez vos clés API.</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="text-xs border-white/10">
                        <Filter className="h-3.5 w-3.5 mr-1.5" />Filtrer
                    </Button>
                    <Button size="sm" className="text-xs bg-gradient-to-r from-violet-600 to-indigo-500 hover:from-violet-700 hover:to-indigo-600">
                        <Plus className="h-3.5 w-3.5 mr-1.5" />Nouveau
                    </Button>
                </div>
            </motion.div>

            {/* Search */}
            <Card className="glass border-white/5">
                <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <Input placeholder="Rechercher…" className="h-8 pl-8 text-xs bg-white/5 border-white/10 focus-visible:ring-violet-500/30" />
                        </div>
                        <Button variant="outline" size="sm" className="text-xs border-white/10 h-8">
                            <Download className="h-3.5 w-3.5 mr-1.5" />Exporter
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Content */}
            <Card className="glass border-white/5">
                <CardHeader>
                    <CardTitle className="text-base">Contenu</CardTitle>
                    <CardDescription className="text-xs">
                        Les données apparaîtront ici une fois connectées à Convex.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <React.Fragment key={i}>
                                <div className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-white/3 transition-colors cursor-pointer group">
                                    <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                                        <Plug className="h-4 w-4 text-violet-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate group-hover:text-violet-300 transition-colors">
                                            Élément {i} — Intégrations API
                                        </p>
                                        <p className="text-[11px] text-muted-foreground">
                                            Dernière modification il y a {i}h
                                        </p>
                                    </div>
                                    <Badge variant="secondary" className="text-[10px] h-5 bg-violet-500/15 text-violet-300 border-0">
                                        Actif
                                    </Badge>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
                                </div>
                                {i < 5 && <Separator className="bg-white/3" />}
                            </React.Fragment>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
