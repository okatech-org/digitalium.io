// DIGITALIUM.IO — SubAdmin: Abonnement & Facturation
"use client";

import React, { useCallback } from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  CheckCircle2,
  Download,
  ArrowUpRight,
  HardDrive,
  FileText,
  PenTool,
  Calendar,
  Crown,
  Receipt,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

/* ─── Animations ─────────────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

/* ─── Config ─────────────────────────────────────── */

const MODULES = [
  { nom: "iDocument", actif: true },
  { nom: "iArchive", actif: true },
  { nom: "iSignature", actif: true },
  { nom: "iAsted", actif: true },
];

interface UsageGauge {
  label: string;
  icon: React.ElementType;
  used: number;
  total: number;
  unit: string;
  color: string;
}

const USAGE_GAUGES: UsageGauge[] = [
  { label: "Stockage", icon: HardDrive, used: 2.4, total: 10, unit: "GB", color: "bg-violet-500" },
  { label: "Documents", icon: FileText, used: 156, total: 500, unit: "", color: "bg-cyan-500" },
  { label: "Signatures", icon: PenTool, used: 23, total: 100, unit: "", color: "bg-amber-500" },
];

type InvoiceStatus = "payée" | "en attente";

interface Invoice {
  numero: string;
  date: string;
  montant: string;
  status: InvoiceStatus;
}

const INVOICES: Invoice[] = [
  { numero: "FAC-2026-006", date: "01/02/2026", montant: "150 000 XAF", status: "en attente" },
  { numero: "FAC-2026-005", date: "01/01/2026", montant: "150 000 XAF", status: "payée" },
  { numero: "FAC-2025-004", date: "01/12/2025", montant: "150 000 XAF", status: "payée" },
  { numero: "FAC-2025-003", date: "01/11/2025", montant: "150 000 XAF", status: "payée" },
  { numero: "FAC-2025-002", date: "01/10/2025", montant: "150 000 XAF", status: "payée" },
  { numero: "FAC-2025-001", date: "01/09/2025", montant: "150 000 XAF", status: "payée" },
];

const STATUS_COLOR: Record<InvoiceStatus, string> = {
  "payée": "bg-emerald-500/15 text-emerald-400",
  "en attente": "bg-amber-500/15 text-amber-400",
};

/* ═══════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════ */

export default function SubAdminSubscriptionsPage() {
  const handleDownloadInvoice = useCallback((invoice: Invoice) => {
    toast.info("Téléchargement", { description: `Facture ${invoice.numero} en cours de téléchargement...` });
  }, []);

  const handleRequestUpgrade = useCallback(() => {
    toast.info("Demande envoyée", { description: "Votre demande d'upgrade a été transmise à l'équipe commerciale" });
  }, []);

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-violet-400" />
          Abonnement & Facturation
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Consultez votre plan, votre consommation et vos factures</p>
      </motion.div>

      {/* Plan Card */}
      <motion.div variants={fadeUp} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 h-32 w-32 bg-gradient-to-br from-violet-600/10 to-indigo-500/10 rounded-full -translate-y-1/3 translate-x-1/3" />
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center">
                <Crown className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Plan Professional</h2>
                <p className="text-xs text-muted-foreground">Abonnement mensuel</p>
              </div>
            </div>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-bold">150 000</span>
              <span className="text-sm text-muted-foreground">XAF/mois</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
              <Calendar className="h-3.5 w-3.5" />
              Renouvellement : 15/03/2026
            </div>
            <div className="flex flex-wrap gap-2">
              {MODULES.map((mod) => (
                <Badge
                  key={mod.nom}
                  variant="secondary"
                  className={`text-[10px] border-0 gap-1 ${
                    mod.actif ? "bg-emerald-500/15 text-emerald-400" : "bg-white/5 text-muted-foreground"
                  }`}
                >
                  <CheckCircle2 className="h-3 w-3" />
                  {mod.nom}
                </Badge>
              ))}
            </div>
          </div>
          <Button
            onClick={handleRequestUpgrade}
            variant="outline"
            className="text-xs gap-1.5 border-violet-500/30 text-violet-400 hover:bg-violet-500/10 h-8"
          >
            <ArrowUpRight className="h-3.5 w-3.5" />
            Demander un upgrade
          </Button>
        </div>
      </motion.div>

      {/* Usage Gauges */}
      <motion.div variants={fadeUp} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <HardDrive className="h-4 w-4 text-violet-400" />
          Consommation
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {USAGE_GAUGES.map((gauge) => {
            const Icon = gauge.icon;
            const percent = Math.round((gauge.used / gauge.total) * 100);
            return (
              <div key={gauge.label} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-medium">{gauge.label}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {gauge.used}{gauge.unit && ` ${gauge.unit}`} / {gauge.total}{gauge.unit && ` ${gauge.unit}`}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                    className={`h-full rounded-full ${gauge.color}`}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground text-right">{percent}%</p>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Invoice History */}
      <motion.div variants={fadeUp} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Receipt className="h-4 w-4 text-violet-400" />
          Historique des factures
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/5 text-muted-foreground">
                <th className="text-left py-2 px-2 font-medium">N° facture</th>
                <th className="text-left py-2 px-2 font-medium">Date</th>
                <th className="text-right py-2 px-2 font-medium">Montant</th>
                <th className="text-center py-2 px-2 font-medium">Statut</th>
                <th className="text-center py-2 px-2 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {INVOICES.map((invoice) => (
                <tr key={invoice.numero} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="py-2.5 px-2 font-mono font-medium">{invoice.numero}</td>
                  <td className="py-2.5 px-2 text-muted-foreground">{invoice.date}</td>
                  <td className="py-2.5 px-2 text-right font-semibold">{invoice.montant}</td>
                  <td className="py-2.5 px-2 text-center">
                    <Badge variant="secondary" className={`text-[9px] border-0 ${STATUS_COLOR[invoice.status]}`}>
                      {invoice.status === "payée" ? "Payée" : "En attente"}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-violet-400"
                      onClick={() => handleDownloadInvoice(invoice)}
                    >
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
