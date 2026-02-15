// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Nouvelle Organisation (Wizard 3 étapes)
// Phase 1: INSCRIRE — Profil → Modules → Déploiement
// Persistance directe dans Convex (pas de localStorage)
// ═══════════════════════════════════════════════

"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Package,
  Server,
  FileText,
  Archive,
  PenTool,
  Bot,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Cloud,
  HardDrive,
  Globe,
  Sparkles,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

/* ─── Animation ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

/* ─── Types ─── */
type OrgType = "enterprise" | "institution" | "government" | "organism";
type HostingChoice = "cloud" | "datacenter" | "local";

interface WizardData {
  // Step 1: Profil
  nom: string;
  type: OrgType;
  secteur: string;
  rccm: string;
  nif: string;
  contact: string;
  email: string;
  telephone: string;
  adresse: string;
  ville: string;
  // Step 2: Modules
  modules: Record<string, boolean>;
  // Step 3: Déploiement
  hosting: HostingChoice;
  domaine: string;
  pagePublique: boolean;
}

/* ─── Config ─── */
const ORG_TYPES: { value: OrgType; label: string; description: string }[] = [
  { value: "enterprise", label: "Entreprise", description: "PME, Grande entreprise" },
  { value: "institution", label: "Institution", description: "Hôpital, Université" },
  { value: "government", label: "Administration", description: "Ministère, Mairie" },
  { value: "organism", label: "Organisme", description: "CNSS, CNAMGS, Régulateur" },
];

const SECTORS = [
  "Énergie & Eau", "Mines & Pétrole", "Banque & Finance", "Télécommunications",
  "Transport & Logistique", "Santé", "Éducation", "Commerce & Distribution",
  "Construction & BTP", "Agriculture & Agroalimentaire", "Services & Consulting",
  "Industrie & Manufacture", "Technologie", "Administration publique", "Autre",
];

const MODULE_CARDS = [
  { key: "iDocument", label: "iDocument", description: "Édition collaborative, Dossiers partagés, Versionnage", icon: FileText, color: "from-blue-500 to-cyan-500" },
  { key: "iArchive", label: "iArchive", description: "Archivage légal, Coffre-fort numérique, Rétention OHADA", icon: Archive, color: "from-violet-500 to-purple-500" },
  { key: "iSignature", label: "iSignature", description: "Signature électronique, Circuits de validation, Parapheur", icon: PenTool, color: "from-emerald-500 to-green-500" },
  { key: "iAsted", label: "iAsted", description: "Assistant IA, Analyse de documents, Suggestions intelligentes", icon: Bot, color: "from-amber-500 to-orange-500" },
];

const HOSTING_OPTIONS: { value: HostingChoice; label: string; icon: typeof Cloud; description: string; recommended: string }[] = [
  { value: "cloud", label: "Cloud DIGITALIUM", icon: Cloud, description: "Infrastructure cloud sécurisée DIGITALIUM", recommended: "PME, startups, organisations distribuées" },
  { value: "datacenter", label: "Data Center LA POSTE Gabon", icon: HardDrive, description: "Centre de données souverain LA POSTE", recommended: "Entreprises, organismes publics" },
  { value: "local", label: "Local (On-Premise)", icon: Server, description: "Serveur chez le client", recommended: "Ministères, institutions sensibles" },
];

const STEPS = [
  { id: 1, label: "Profil", icon: Building2, question: "Qui est cette organisation ?" },
  { id: 2, label: "Modules", icon: Package, question: "Quels outils veut-on ?" },
  { id: 3, label: "Déploiement", icon: Server, question: "Où héberger les données ?" },
];

/* ═══════════════════════════════════════════════
   WIZARD INNER
   ═══════════════════════════════════════════════ */

function NewOrganizationWizardInner() {
  const router = useRouter();
  const createOrg = useMutation(api.organizations.createDraft);
  const createSite = useMutation(api.orgSites.create);

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [data, setData] = useState<WizardData>({
    nom: "", type: "enterprise", secteur: "", rccm: "", nif: "",
    contact: "", email: "", telephone: "", adresse: "", ville: "",
    modules: { iDocument: true, iArchive: true, iSignature: true, iAsted: false },
    hosting: "datacenter", domaine: "", pagePublique: false,
  });

  /* ─── Helpers ─── */
  const update = <K extends keyof WizardData>(key: K, value: WizardData[K]) =>
    setData((prev) => ({ ...prev, [key]: value }));

  const toggleModule = (key: string) =>
    setData((prev) => ({
      ...prev,
      modules: { ...prev.modules, [key]: !prev.modules[key] },
    }));

  const activeModules = useMemo(
    () => Object.entries(data.modules).filter(([, v]) => v).map(([k]) => k),
    [data.modules]
  );

  const isStep1Valid = data.nom.length > 0 && data.type;
  const isStep2Valid = activeModules.length > 0;

  /* ─── Submit ─── */
  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const orgId = await createOrg({
        name: data.nom,
        type: data.type,
        sector: data.secteur || undefined,
        ownerId: "admin_placeholder", // TODO: wire to real auth
        rccm: data.rccm || undefined,
        nif: data.nif || undefined,
        contact: data.contact || undefined,
        telephone: data.telephone || undefined,
        email: data.email || undefined,
        adresse: data.adresse || undefined,
        ville: data.ville || undefined,
        pays: "Gabon",
        modules: activeModules,
        hosting: {
          type: data.hosting,
          domain: data.domaine || undefined,
          pagePublique: data.pagePublique,
        },
      });

      // Create siège site
      if (data.ville || data.adresse) {
        await createSite({
          organizationId: orgId,
          nom: "Siège Social",
          type: "siege",
          adresse: data.adresse || "—",
          ville: data.ville || "Libreville",
          pays: "Gabon",
          telephone: data.telephone || undefined,
          email: data.email || undefined,
          estSiege: true,
        });
      }

      toast.success("Organisation créée avec succès", {
        description: `${data.nom} est maintenant en statut « Brouillon ». Configurez-la via sa fiche.`,
      });

      router.push(`/admin/organizations/${orgId}`);
    } catch (err) {
      toast.error("Erreur lors de la création", {
        description: err instanceof Error ? err.message : "Veuillez réessayer.",
      });
      setIsSubmitting(false);
    }
  };

  /* ─── Navigation ─── */
  const goNext = () => {
    if (step === 1 && !isStep1Valid) {
      toast.warning("Veuillez renseigner au minimum la raison sociale.");
      return;
    }
    if (step === 2 && !isStep2Valid) {
      toast.warning("Activez au moins un module.");
      return;
    }
    if (step < 3) setStep(step + 1);
  };

  const goBack = () => {
    if (step > 1) setStep(step - 1);
  };

  /* ═══════ RENDER ═══════ */
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">

        {/* ─── Header ─── */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-8">
          <button
            onClick={() => router.push("/admin/organizations")}
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Retour aux organisations
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Nouvelle Organisation
          </h1>
          <p className="text-zinc-400 mt-1">
            Inscription rapide en 3 étapes — l&apos;organisation sera créée en statut « Brouillon ».
          </p>
        </motion.div>

        {/* ─── Stepper ─── */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isActive = step === s.id;
              const isDone = step > s.id;
              return (
                <React.Fragment key={s.id}>
                  <button
                    onClick={() => {
                      if (isDone || isActive) setStep(s.id);
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                      ? "bg-white/10 border border-white/20 text-white"
                      : isDone
                        ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 cursor-pointer"
                        : "bg-white/5 border border-white/5 text-zinc-500"
                      }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDone ? "bg-emerald-500/20" : isActive ? "bg-white/10" : "bg-white/5"
                      }`}>
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                    </div>
                    <div className="text-left hidden md:block">
                      <div className="text-xs font-medium opacity-60">Étape {s.id}</div>
                      <div className="text-sm font-semibold">{s.label}</div>
                    </div>
                  </button>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-px mx-2 ${step > s.id ? "bg-emerald-500/40" : "bg-white/10"
                      }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </motion.div>

        {/* ─── Step Content ─── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-sm"
          >
            {/* Step question */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-violet-400" />
                {STEPS[step - 1].question}
              </h2>
              <p className="text-zinc-400 text-sm mt-1">
                Étape {step}/3 — {STEPS[step - 1].label}
              </p>
            </div>

            {/* ═══ Step 1: Profil ═══ */}
            {step === 1 && (
              <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6">
                {/* Identité */}
                <motion.div variants={fadeUp}>
                  <h3 className="text-sm font-semibold text-zinc-300 mb-3 uppercase tracking-wider">Identité</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="text-xs text-zinc-400 mb-1 block">Raison sociale *</label>
                      <Input
                        value={data.nom}
                        onChange={(e) => update("nom", e.target.value)}
                        placeholder="Ex: SEEG, CNAMGS, Ministère de la Santé..."
                        className="bg-white/5 border-white/10 text-white placeholder:text-zinc-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-400 mb-1 block">Type d&apos;organisation *</label>
                      <div className="grid grid-cols-2 gap-2">
                        {ORG_TYPES.map((t) => (
                          <button
                            key={t.value}
                            onClick={() => update("type", t.value)}
                            className={`p-3 rounded-xl border text-left transition-all ${data.type === t.value
                              ? "bg-violet-500/10 border-violet-500/30 text-violet-300"
                              : "bg-white/5 border-white/10 text-zinc-400 hover:border-white/20"
                              }`}
                          >
                            <div className="text-sm font-medium">{t.label}</div>
                            <div className="text-xs opacity-60">{t.description}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-zinc-400 mb-1 block">Secteur d&apos;activité</label>
                      <select
                        value={data.secteur}
                        onChange={(e) => update("secteur", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                      >
                        <option value="">— Sélectionner —</option>
                        {SECTORS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-zinc-400 mb-1 block">RCCM</label>
                      <Input
                        value={data.rccm}
                        onChange={(e) => update("rccm", e.target.value)}
                        placeholder="N° RCCM"
                        className="bg-white/5 border-white/10 text-white placeholder:text-zinc-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-400 mb-1 block">NIF</label>
                      <Input
                        value={data.nif}
                        onChange={(e) => update("nif", e.target.value)}
                        placeholder="N° Identification Fiscale"
                        className="bg-white/5 border-white/10 text-white placeholder:text-zinc-500"
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Coordonnées */}
                <motion.div variants={fadeUp}>
                  <h3 className="text-sm font-semibold text-zinc-300 mb-3 uppercase tracking-wider">Coordonnées</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-zinc-400 mb-1 block">Contact principal</label>
                      <Input
                        value={data.contact}
                        onChange={(e) => update("contact", e.target.value)}
                        placeholder="Nom du contact"
                        className="bg-white/5 border-white/10 text-white placeholder:text-zinc-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-400 mb-1 block">Email</label>
                      <Input
                        type="email"
                        value={data.email}
                        onChange={(e) => update("email", e.target.value)}
                        placeholder="contact@organisation.ga"
                        className="bg-white/5 border-white/10 text-white placeholder:text-zinc-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-400 mb-1 block">Téléphone</label>
                      <Input
                        value={data.telephone}
                        onChange={(e) => update("telephone", e.target.value)}
                        placeholder="+241 XX XX XX XX"
                        className="bg-white/5 border-white/10 text-white placeholder:text-zinc-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-400 mb-1 block">Ville</label>
                      <Input
                        value={data.ville}
                        onChange={(e) => update("ville", e.target.value)}
                        placeholder="Libreville"
                        className="bg-white/5 border-white/10 text-white placeholder:text-zinc-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs text-zinc-400 mb-1 block">Adresse</label>
                      <Input
                        value={data.adresse}
                        onChange={(e) => update("adresse", e.target.value)}
                        placeholder="Boulevard Léon Mba, Quartier Glass..."
                        className="bg-white/5 border-white/10 text-white placeholder:text-zinc-500"
                      />
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* ═══ Step 2: Modules ═══ */}
            {step === 2 && (
              <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6">
                <motion.div variants={fadeUp}>
                  <p className="text-sm text-zinc-400 mb-4">
                    Sélectionnez les modules à activer. Vous pourrez modifier ces choix plus tard.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {MODULE_CARDS.map((mod) => {
                      const Icon = mod.icon;
                      const isActive = data.modules[mod.key];
                      return (
                        <motion.button
                          key={mod.key}
                          variants={fadeUp}
                          onClick={() => toggleModule(mod.key)}
                          className={`relative p-5 rounded-xl border text-left transition-all group ${isActive
                            ? "bg-white/[0.06] border-white/20"
                            : "bg-white/[0.02] border-white/5 hover:border-white/10"
                            }`}
                        >
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${mod.color} flex items-center justify-center mb-3 ${isActive ? "opacity-100" : "opacity-40"
                            }`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <h4 className={`font-semibold mb-1 ${isActive ? "text-white" : "text-zinc-500"}`}>
                            {mod.label}
                          </h4>
                          <p className={`text-xs leading-relaxed ${isActive ? "text-zinc-400" : "text-zinc-600"}`}>
                            {mod.description}
                          </p>
                          <div className="absolute top-4 right-4">
                            <Badge
                              variant={isActive ? "default" : "outline"}
                              className={isActive
                                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                : "text-zinc-500 border-white/10"
                              }
                            >
                              {isActive ? "✓ Activé" : "Désactivé"}
                            </Badge>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
                <motion.div variants={fadeUp}>
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                    <Package className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
                    <p className="text-sm text-blue-300/80">
                      Les modules conditionnent les options de configuration disponibles dans la fiche organisation.
                      L&apos;abonnement et la facturation se gèrent séparément dans le volet Clients.
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* ═══ Step 3: Déploiement ═══ */}
            {step === 3 && (
              <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6">
                {/* Hosting */}
                <motion.div variants={fadeUp}>
                  <h3 className="text-sm font-semibold text-zinc-300 mb-3 uppercase tracking-wider">
                    Hébergement des données
                  </h3>
                  <div className="space-y-3">
                    {HOSTING_OPTIONS.map((opt) => {
                      const Icon = opt.icon;
                      const isSelected = data.hosting === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => update("hosting", opt.value)}
                          className={`w-full p-4 rounded-xl border text-left transition-all flex items-center gap-4 ${isSelected
                            ? "bg-violet-500/10 border-violet-500/30"
                            : "bg-white/[0.02] border-white/10 hover:border-white/20"
                            }`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSelected ? "bg-violet-500/20" : "bg-white/5"
                            }`}>
                            <Icon className={`w-5 h-5 ${isSelected ? "text-violet-400" : "text-zinc-500"}`} />
                          </div>
                          <div className="flex-1">
                            <div className={`font-medium ${isSelected ? "text-white" : "text-zinc-400"}`}>
                              {opt.label}
                            </div>
                            <div className="text-xs text-zinc-500">{opt.description}</div>
                          </div>
                          <div className="text-xs text-zinc-600">
                            Idéal pour : {opt.recommended}
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? "border-violet-500 bg-violet-500" : "border-white/20"
                            }`}>
                            {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>

                {/* Domain */}
                <motion.div variants={fadeUp}>
                  <h3 className="text-sm font-semibold text-zinc-300 mb-3 uppercase tracking-wider">
                    Personnalisation
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-zinc-400 mb-1 block">Sous-domaine</label>
                      <div className="flex items-center gap-0">
                        <Input
                          value={data.domaine}
                          onChange={(e) => update("domaine", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                          placeholder={data.nom.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || "organisation"}
                          className="bg-white/5 border-white/10 text-white rounded-r-none placeholder:text-zinc-600"
                        />
                        <div className="px-3 py-2 bg-white/5 border border-white/10 border-l-0 rounded-r-lg text-xs text-zinc-500 whitespace-nowrap">
                          .digitalium.io
                        </div>
                      </div>
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={() => update("pagePublique", !data.pagePublique)}
                        className={`w-full p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${data.pagePublique
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          : "bg-white/5 border-white/10 text-zinc-400"
                          }`}
                      >
                        <Globe className="w-4 h-4" />
                        <div>
                          <div className="text-sm font-medium">Page publique</div>
                          <div className="text-xs opacity-60">{data.pagePublique ? "Activée" : "Désactivée"}</div>
                        </div>
                      </button>
                    </div>
                  </div>
                </motion.div>

                {/* Récapitulatif */}
                <motion.div variants={fadeUp}>
                  <h3 className="text-sm font-semibold text-zinc-300 mb-3 uppercase tracking-wider">
                    Récapitulatif
                  </h3>
                  <div className="p-5 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-zinc-400">Organisation</span>
                      <span className="text-sm text-white font-medium">{data.nom || "—"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-zinc-400">Type</span>
                      <span className="text-sm text-white">
                        {ORG_TYPES.find((t) => t.value === data.type)?.label}
                      </span>
                    </div>
                    {data.secteur && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-zinc-400">Secteur</span>
                        <span className="text-sm text-white">{data.secteur}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-zinc-400">Modules</span>
                      <div className="flex gap-1.5">
                        {activeModules.map((m) => (
                          <Badge key={m} variant="outline" className="text-xs border-white/10 text-zinc-300">
                            {m}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-zinc-400">Hébergement</span>
                      <span className="text-sm text-white">
                        {HOSTING_OPTIONS.find((h) => h.value === data.hosting)?.label}
                      </span>
                    </div>
                    {data.ville && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-zinc-400">Siège</span>
                        <span className="text-sm text-white">{data.ville}</span>
                      </div>
                    )}
                    <div className="pt-3 mt-3 border-t border-white/5 flex justify-between items-center">
                      <span className="text-sm text-zinc-400">Statut après création</span>
                      <Badge className="bg-zinc-500/20 text-zinc-300 border-zinc-500/30">
                        Brouillon
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-500 mt-3">
                    ℹ️ L&apos;organisation sera créée en statut « Brouillon ».
                    Configurez-la ensuite via sa fiche avant de l&apos;activer.
                  </p>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* ─── Footer Navigation ─── */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mt-6 flex items-center justify-between"
        >
          <div>
            {step > 1 && (
              <Button
                variant="ghost"
                onClick={goBack}
                className="text-zinc-400 hover:text-white"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
            )}
          </div>
          <div>
            {step < 3 ? (
              <Button
                onClick={goNext}
                className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white px-6"
              >
                Suivant
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !isStep1Valid}
                className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white px-6"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Création en cours…
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Créer l&apos;organisation
                  </>
                )}
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   PAGE EXPORT
   ═══════════════════════════════════════════════ */

export default function NewOrganizationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-zinc-950">
          <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
        </div>
      }
    >
      <NewOrganizationWizardInner />
    </Suspense>
  );
}
