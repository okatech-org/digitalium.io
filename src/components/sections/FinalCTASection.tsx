"use client";

import { motion } from "framer-motion";
import { ArrowRight, Phone, Zap, Smartphone, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function FinalCTASection() {
    return (
        <section className="py-24 px-6 relative">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="glass-card rounded-2xl p-12 md:p-16 relative overflow-hidden text-center"
                >
                    {/* Background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-digitalium-blue/15 via-digitalium-violet/10 to-transparent pointer-events-none" />
                    {/* Grain texture */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJmIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1IiBudW1PY3RhdmVzPSI0IiBzZWVkPSIyIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI2YpIiBvcGFjaXR5PSIuNCIvPjwvc3ZnPg==')]" />

                    <div className="relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                        >
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                                Prêt à{" "}
                                <span className="text-gradient">Transformer</span>
                                <br />
                                Votre Gestion Documentaire ?
                            </h2>
                        </motion.div>

                        <motion.p
                            className="text-muted-foreground mb-8 max-w-lg mx-auto text-lg"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                        >
                            Rejoignez les organisations gabonaises qui ont choisi l&apos;archivage
                            intelligent. Essai gratuit 14 jours — Aucune carte bancaire
                            requise.
                        </motion.p>

                        <motion.div
                            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                        >
                            <Link href="/register">
                                <Button
                                    size="lg"
                                    className="bg-gradient-to-r from-digitalium-blue to-digitalium-violet hover:opacity-90 transition-opacity text-lg px-10 h-14 shadow-lg shadow-digitalium-blue/20"
                                >
                                    🚀 Configurer Mon Écosystème
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                            <Button
                                size="lg"
                                variant="outline"
                                className="text-lg px-10 h-14 border-white/10"
                            >
                                <Phone className="mr-2 h-5 w-5" />
                                Planifier une Démo
                            </Button>
                        </motion.div>

                        <motion.div
                            className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.5 }}
                        >
                            <span className="flex items-center gap-1">
                                <Zap className="h-3.5 w-3.5 text-amber-400" />
                                Mise en place en 30 minutes
                            </span>
                            <span className="flex items-center gap-1">
                                <Smartphone className="h-3.5 w-3.5 text-emerald-400" />
                                Mobile Money accepté
                            </span>
                            <span className="flex items-center gap-1">
                                <Lock className="h-3.5 w-3.5 text-blue-400" />
                                14 jours gratuits
                            </span>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
