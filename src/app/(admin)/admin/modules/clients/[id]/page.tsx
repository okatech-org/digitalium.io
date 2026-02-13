// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Modules: Fiche Client
// Centre névralgique avec 7 onglets de configuration
// ═══════════════════════════════════════════════

"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
    Building,
    Save,
    Package,
    Workflow,
    Server,
    Globe,
    UserCircle,
    Users,
    Network,
    FileText,
    Archive,
    PenTool,
    CheckCircle2,
    ToggleLeft,
    ToggleRight,
    ArrowRight,
    Clock,
    Settings,
    Plus,
    MapPin,
    Phone,
    ChevronRight,
    Layers,
    Building2,
    Cloud,
    HardDrive,
    Cpu,
    MemoryStick,
    Eye,
    Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

/* ─── Types ──────────────────────────────── */

type ModuleTab = "idocument" | "iarchive" | "isignature";

interface ClientData {
    id: string;
    name: string;
    type: string;
    secteur: string;
    rccm: string;
    nif: string;
    contact: string;
    email: string;
    telephone: string;
    adresse: string;
    ville: string;
    plan: string;
    statut: "Actif" | "Config";
    modules: { idocument: boolean; iarchive: boolean; isignature: boolean };
    hebergement: "Local" | "Data Center" | "Cloud";
    pagePublique: boolean;
    domaine: string;
}

/* ─── Mock Client Data ───────────────────── */

const CLIENTS_DB: Record<string, ClientData> = {
    seeg: {
        id: "seeg", name: "SEEG", type: "Établissement public", secteur: "Énergie & Eau",
        rccm: "GA-LBV-2003-B-44521", nif: "20031234567A",
        contact: "M. Bivigou", email: "direction@seeg.ga", telephone: "+241 01 76 31 00",
        adresse: "Boulevard Léon Mba, Centre-ville", ville: "Libreville",
        plan: "Enterprise", statut: "Actif",
        modules: { idocument: true, iarchive: true, isignature: true },
        hebergement: "Data Center",
        pagePublique: true, domaine: "seeg.digitalium.io",
    },
    dgdi: {
        id: "dgdi", name: "DGDI", type: "Gouvernement", secteur: "Administration publique",
        rccm: "—", nif: "GOV-DGDI-001",
        contact: "M. Essono", email: "contact@dgdi.ga", telephone: "+241 01 72 10 00",
        adresse: "Boulevard Triomphal", ville: "Libreville",
        plan: "Pro", statut: "Actif",
        modules: { idocument: true, iarchive: true, isignature: false },
        hebergement: "Cloud",
        pagePublique: false, domaine: "",
    },
    minterieur: {
        id: "minterieur", name: "Min. Intérieur", type: "Gouvernement", secteur: "Administration publique",
        rccm: "—", nif: "GOV-MINT-001",
        contact: "Mme Akongo", email: "secgen@minterieur.ga", telephone: "+241 01 76 50 00",
        adresse: "Quartier Administratif", ville: "Libreville",
        plan: "Enterprise", statut: "Actif",
        modules: { idocument: true, iarchive: true, isignature: true },
        hebergement: "Local",
        pagePublique: true, domaine: "minterieur.digitalium.io",
    },
    gabtelecom: {
        id: "gabtelecom", name: "Gabon Télécom", type: "Entreprise", secteur: "Télécommunications",
        rccm: "GA-LBV-2001-B-33210", nif: "20011234567B",
        contact: "Mme Ndong", email: "admin@gabtelecom.ga", telephone: "+241 01 74 50 00",
        adresse: "Avenue du Général de Gaulle", ville: "Libreville",
        plan: "Pro", statut: "Config",
        modules: { idocument: true, iarchive: false, isignature: true },
        hebergement: "Cloud",
        pagePublique: false, domaine: "",
    },
    pgl: {
        id: "pgl", name: "Port-Gentil Logistique", type: "Entreprise", secteur: "Logistique & Transport",
        rccm: "GA-POG-2015-B-12345", nif: "20151234567C",
        contact: "M. Mba", email: "direction@pgl.ga", telephone: "+241 01 55 30 00",
        adresse: "Zone Portuaire", ville: "Port-Gentil",
        plan: "Starter", statut: "Config",
        modules: { idocument: true, iarchive: false, isignature: false },
        hebergement: "Cloud",
        pagePublique: false, domaine: "",
    },
};

/* ─── Module Features ────────────────────── */

const MODULE_FEATURES: Record<string, { label: string; features: { name: string; enabled: boolean }[] }> = {
    idocument: {
        label: "iDocument",
        features: [
            { name: "Dossiers & Fichiers", enabled: true },
            { name: "Templates de documents", enabled: true },
            { name: "Partage & Collaboration", enabled: true },
            { name: "Archivage automatique", enabled: false },
            { name: "Import en masse", enabled: true },
            { name: "Versionnage", enabled: false },
        ],
    },
    iarchive: {
        label: "iArchive",
        features: [
            { name: "Archivage légal", enabled: true },
            { name: "Coffre-fort numérique", enabled: true },
            { name: "Certificats d'archivage", enabled: true },
            { name: "Rétention automatique", enabled: true },
            { name: "OCR / Recherche plein texte", enabled: false },
            { name: "Catégories dynamiques", enabled: true },
        ],
    },
    isignature: {
        label: "iSignature",
        features: [
            { name: "Signature électronique", enabled: true },
            { name: "Multi-signataires", enabled: true },
            { name: "Délégation", enabled: false },
            { name: "Horodatage certifié", enabled: true },
            { name: "Audit trail complet", enabled: true },
            { name: "Signature avancée eIDAS", enabled: false },
        ],
    },
};

/* ─── Workflows Mock ─────────────────────── */

const WORKFLOW_DATA: Record<ModuleTab, { id: string; nom: string; etapes: string[]; actif: boolean; executions: number }[]> = {
    idocument: [
        { id: "d1", nom: "Validation Document Interne", etapes: ["Rédaction", "Relecture", "Validation Chef", "Approbation DG", "Publication"], actif: true, executions: 234 },
        { id: "d2", nom: "Création Facture", etapes: ["Saisie", "Vérification Comptable", "Approbation", "Envoi"], actif: true, executions: 156 },
    ],
    iarchive: [
        { id: "a1", nom: "Archivage Automatique", etapes: ["Détection", "Classification", "Indexation", "Stockage", "Confirmation"], actif: true, executions: 1024 },
    ],
    isignature: [
        { id: "s1", nom: "Signature Contrat", etapes: ["Préparation", "Signature Commercial", "Signature Client", "Contre-signature DG", "Finalisation"], actif: true, executions: 67 },
        { id: "s2", nom: "Validation PV Réunion", etapes: ["Rédaction PV", "Relecture", "Signature Participants", "Archivage"], actif: true, executions: 34 },
    ],
};

const TAB_COLORS: Record<ModuleTab, { text: string; stepBg: string }> = {
    idocument: { text: "text-blue-400", stepBg: "bg-blue-500/15" },
    iarchive: { text: "text-amber-400", stepBg: "bg-amber-500/15" },
    isignature: { text: "text-violet-400", stepBg: "bg-violet-500/15" },
};

/* ─── Personnel Mock ─────────────────────── */

const PERSONNEL = [
    { nom: "Pierre Nguema", poste: "Directeur Général", dept: "Direction", role: "org_admin", statut: "Actif" },
    { nom: "Éric Assoumou", poste: "Directeur Technique", dept: "Technique", role: "org_editor", statut: "Actif" },
    { nom: "Hélène Mboumba", poste: "DRH", dept: "Administratif", role: "org_editor", statut: "Actif" },
    { nom: "Jacques Mouele", poste: "Dir. Commercial", dept: "Commercial", role: "org_editor", statut: "Actif" },
    { nom: "Rose Mintsa", poste: "Juriste", dept: "Juridique", role: "org_viewer", statut: "Actif" },
];

/* ─── Structure Mock ─────────────────────── */

const DEPARTEMENTS = [
    { nom: "Direction Générale", responsable: "Pierre Nguema", membres: 5, sousServices: ["Secrétariat Général", "Communication"], couleur: "violet" },
    { nom: "Technique", responsable: "Éric Assoumou", membres: 18, sousServices: ["Production Électrique", "Distribution Eau", "Maintenance"], couleur: "blue" },
    { nom: "Commercial", responsable: "Jacques Mouele", membres: 12, sousServices: ["Ventes Entreprises", "Ventes Particuliers"], couleur: "emerald" },
    { nom: "Administratif", responsable: "Hélène Mboumba", membres: 8, sousServices: ["Ressources Humaines", "Comptabilité", "Logistique"], couleur: "amber" },
];

const BUREAUX = [
    { nom: "Siège Social", adresse: "Boulevard Léon Mba, Centre-ville", ville: "Libreville", employes: 32, telephone: "+241 01 76 31 00" },
    { nom: "Centre Technique", adresse: "Zone Industrielle d'Oloumi", ville: "Libreville", employes: 15, telephone: "+241 01 76 31 10" },
];

const DEPT_COLORS: Record<string, { bg: string; text: string; iconBg: string }> = {
    violet: { bg: "bg-violet-500/10", text: "text-violet-400", iconBg: "bg-violet-500/15" },
    blue: { bg: "bg-blue-500/10", text: "text-blue-400", iconBg: "bg-blue-500/15" },
    emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400", iconBg: "bg-emerald-500/15" },
    amber: { bg: "bg-amber-500/10", text: "text-amber-400", iconBg: "bg-amber-500/15" },
};

/* ═══════════════════════════════════════════ */

export default function ClientFichePage() {
    const params = useParams();
    const clientId = params.id as string;
    const client = CLIENTS_DB[clientId] || CLIENTS_DB.seeg;

    const [activeWfTab, setActiveWfTab] = useState<ModuleTab>("idocument");

    const handleSave = () => {
        toast.success("Client mis à jour", { description: `${client.name} sauvegardé avec succès` });
    };

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1200px] mx-auto">
            {/* Header */}
            <motion.div variants={fadeUp} className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Building className="h-6 w-6 text-violet-400" />
                        {client.name}
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-[9px] bg-white/5 border-0">{client.type}</Badge>
                        <Badge variant="secondary" className={`text-[9px] border-0 ${client.statut === "Actif" ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"}`}>
                            {client.statut}
                        </Badge>
                        <Badge variant="secondary" className="text-[9px] bg-violet-500/15 text-violet-300 border-0">{client.plan}</Badge>
                    </div>
                </div>
                <Button onClick={handleSave} className="bg-gradient-to-r from-violet-600 to-indigo-500 text-white hover:opacity-90 text-xs gap-2">
                    <Save className="h-3.5 w-3.5" />
                    Enregistrer
                </Button>
            </motion.div>

            {/* Tabs */}
            <motion.div variants={fadeUp}>
                <Tabs defaultValue="modules" className="w-full">
                    <TabsList className="bg-white/[0.02] border border-white/5 p-1 rounded-lg h-auto flex flex-wrap gap-0.5">
                        {[
                            { value: "modules", label: "Modules", icon: Package },
                            { value: "workflows", label: "Workflows", icon: Workflow },
                            { value: "hebergement", label: "Hébergement", icon: Server },
                            { value: "page-publique", label: "Page publique", icon: Globe },
                            { value: "profil", label: "Profil", icon: UserCircle },
                            { value: "personnel", label: "Personnel", icon: Users },
                            { value: "structure", label: "Structure", icon: Network },
                        ].map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <TabsTrigger key={tab.value} value={tab.value} className="text-xs gap-1.5 data-[state=active]:bg-violet-500/15 data-[state=active]:text-violet-300">
                                    <Icon className="h-3.5 w-3.5" />
                                    <span className="hidden sm:inline">{tab.label}</span>
                                </TabsTrigger>
                            );
                        })}
                    </TabsList>

                    {/* ─── Tab: Modules ─── */}
                    <TabsContent value="modules" className="mt-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {(["idocument", "iarchive", "isignature"] as const).map((mod) => {
                                const modConfig = MODULE_FEATURES[mod];
                                const isActive = client.modules[mod];
                                const colors = TAB_COLORS[mod];
                                const ModIcon = mod === "idocument" ? FileText : mod === "iarchive" ? Archive : PenTool;
                                return (
                                    <div key={mod} className={`glass-card rounded-2xl p-5 border ${isActive ? "border-white/10" : "border-white/5 opacity-50"}`}>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <ModIcon className={`h-5 w-5 ${colors.text}`} />
                                                <span className="text-sm font-semibold">{modConfig.label}</span>
                                            </div>
                                            {isActive ? (
                                                <ToggleRight className="h-6 w-6 text-emerald-400" />
                                            ) : (
                                                <ToggleLeft className="h-6 w-6 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            {modConfig.features.map((f) => (
                                                <div key={f.name} className="flex items-center justify-between">
                                                    <span className="text-[10px] text-muted-foreground">{f.name}</span>
                                                    {f.enabled ? (
                                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                                                    ) : (
                                                        <div className="h-3.5 w-3.5 rounded-full border border-white/10" />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </TabsContent>

                    {/* ─── Tab: Workflows ─── */}
                    <TabsContent value="workflows" className="mt-4 space-y-4">
                        {/* Module sub-tabs */}
                        <div className="flex items-center gap-2">
                            {(["idocument", "iarchive", "isignature"] as const).map((tab) => {
                                const Icon = tab === "idocument" ? FileText : tab === "iarchive" ? Archive : PenTool;
                                const isActive = activeWfTab === tab;
                                const colors = TAB_COLORS[tab];
                                return (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveWfTab(tab)}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                                            isActive ? `${colors.stepBg} ${colors.text} border-current/20` : "border-transparent text-muted-foreground hover:bg-white/5"
                                        }`}
                                    >
                                        <Icon className="h-3.5 w-3.5" />
                                        {tab === "idocument" ? "iDocument" : tab === "iarchive" ? "iArchive" : "iSignature"}
                                        <Badge variant="secondary" className="text-[9px] border-0 bg-white/5 ml-1">
                                            {WORKFLOW_DATA[tab].length}
                                        </Badge>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Workflow cards */}
                        <div className="space-y-3">
                            {WORKFLOW_DATA[activeWfTab].map((wf) => {
                                const colors = TAB_COLORS[activeWfTab];
                                return (
                                    <div key={wf.id} className="glass-card rounded-xl p-4 border border-white/5">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-semibold">{wf.nom}</p>
                                                <Badge variant="secondary" className={`text-[9px] border-0 ${wf.actif ? "bg-emerald-500/15 text-emerald-400" : "bg-zinc-500/15 text-zinc-400"}`}>
                                                    {wf.actif ? "Actif" : "Inactif"}
                                                </Badge>
                                            </div>
                                            {wf.actif ? <ToggleRight className="h-5 w-5 text-emerald-400" /> : <ToggleLeft className="h-5 w-5" />}
                                        </div>
                                        <div className="flex items-center gap-1 flex-wrap mb-3">
                                            {wf.etapes.map((etape, i) => (
                                                <React.Fragment key={etape}>
                                                    <div className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${colors.stepBg} ${colors.text}`}>
                                                        {etape}
                                                    </div>
                                                    {i < wf.etapes.length - 1 && <ArrowRight className="h-2.5 w-2.5 text-muted-foreground/40" />}
                                                </React.Fragment>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                                            <span className="flex items-center gap-1"><Settings className="h-3 w-3" />{wf.executions} exécutions</span>
                                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{wf.etapes.length} étapes</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <Button variant="outline" size="sm" className="text-xs gap-1.5 border-white/10">
                            <Plus className="h-3 w-3" /> Ajouter un workflow
                        </Button>
                    </TabsContent>

                    {/* ─── Tab: Hébergement ─── */}
                    <TabsContent value="hebergement" className="mt-4 space-y-4">
                        {/* Active model */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { id: "Local", icon: Server, desc: "Serveur sur site client", color: "blue" },
                                { id: "Data Center", icon: HardDrive, desc: "Hébergement en data center DIGITALIUM", color: "violet" },
                                { id: "Cloud", icon: Cloud, desc: "Infrastructure cloud (AWS/Azure)", color: "emerald" },
                            ].map((h) => {
                                const isActive = client.hebergement === h.id;
                                const Icon = h.icon;
                                return (
                                    <div key={h.id} className={`glass-card rounded-xl p-5 border cursor-pointer transition-all ${isActive ? "border-violet-500/30 bg-violet-500/5" : "border-white/5 hover:border-white/10"}`}>
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className={`h-10 w-10 rounded-lg bg-${h.color}-500/15 flex items-center justify-center`}>
                                                <Icon className={`h-5 w-5 text-${h.color}-400`} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold">{h.id}</p>
                                                <p className="text-[10px] text-muted-foreground">{h.desc}</p>
                                            </div>
                                        </div>
                                        {isActive && (
                                            <Badge variant="secondary" className="text-[9px] bg-violet-500/15 text-violet-400 border-0 mt-2">
                                                <CheckCircle2 className="h-2.5 w-2.5 mr-1" /> Modèle actif
                                            </Badge>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Resources */}
                        <div className="glass-card rounded-xl p-5 border border-white/5">
                            <h3 className="text-sm font-semibold mb-4">Ressources allouées</h3>
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { label: "CPU", value: "4 vCPU", usage: 45, icon: Cpu },
                                    { label: "RAM", value: "8 GB", usage: 62, icon: MemoryStick },
                                    { label: "Stockage", value: "45 / 100 GB", usage: 45, icon: HardDrive },
                                ].map((r) => {
                                    const Icon = r.icon;
                                    return (
                                        <div key={r.label}>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Icon className="h-4 w-4 text-violet-400" />
                                                <span className="text-xs font-medium">{r.label}</span>
                                            </div>
                                            <p className="text-sm font-bold mb-1">{r.value}</p>
                                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full" style={{ width: `${r.usage}%` }} />
                                            </div>
                                            <p className="text-[10px] text-muted-foreground mt-1">{r.usage}% utilisé</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </TabsContent>

                    {/* ─── Tab: Page publique ─── */}
                    <TabsContent value="page-publique" className="mt-4 space-y-4">
                        <div className="glass-card rounded-xl p-5 border border-white/5 space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-semibold">Page publique</h3>
                                    <p className="text-[10px] text-muted-foreground">Portail public accessible aux visiteurs</p>
                                </div>
                                {client.pagePublique ? (
                                    <ToggleRight className="h-6 w-6 text-emerald-400 cursor-pointer" />
                                ) : (
                                    <ToggleLeft className="h-6 w-6 text-muted-foreground cursor-pointer" />
                                )}
                            </div>

                            {client.pagePublique && (
                                <>
                                    <div>
                                        <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Domaine personnalisé</label>
                                        <div className="flex items-center gap-2">
                                            <Globe className="h-4 w-4 text-violet-400" />
                                            <Input value={client.domaine} readOnly className="h-8 text-xs bg-white/5 border-white/10 flex-1" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Thème</label>
                                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                                                <Palette className="h-3.5 w-3.5 text-violet-400" />
                                                <span className="text-xs">Défaut — Violet</span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Annuaire</label>
                                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                                                <Eye className="h-3.5 w-3.5 text-emerald-400" />
                                                <span className="text-xs">Public</span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </TabsContent>

                    {/* ─── Tab: Profil ─── */}
                    <TabsContent value="profil" className="mt-4 space-y-4">
                        {/* Plan strip */}
                        <div className="flex items-center gap-4">
                            <div className="glass-card rounded-xl p-3 px-5 border border-white/5 flex items-center gap-3">
                                <Badge className="bg-gradient-to-r from-violet-600 to-indigo-500 text-white border-0 text-xs">{client.plan}</Badge>
                                <span className="text-xs text-muted-foreground">Plan actif</span>
                            </div>
                        </div>

                        {/* Identity */}
                        <div className="glass-card rounded-xl p-5 border border-white/5">
                            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                                <Building className="h-4 w-4 text-violet-400" /> Identité
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { label: "Raison sociale", value: client.name },
                                    { label: "Secteur", value: client.secteur },
                                    { label: "RCCM", value: client.rccm },
                                    { label: "NIF", value: client.nif },
                                ].map((f) => (
                                    <div key={f.label}>
                                        <label className="text-xs font-medium mb-1.5 block text-muted-foreground">{f.label}</label>
                                        <Input value={f.value} readOnly className="h-9 text-xs bg-white/5 border-white/10" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Contact */}
                        <div className="glass-card rounded-xl p-5 border border-white/5">
                            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                                <UserCircle className="h-4 w-4 text-violet-400" /> Coordonnées
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { label: "Contact principal", value: client.contact },
                                    { label: "Email", value: client.email },
                                    { label: "Téléphone", value: client.telephone },
                                    { label: "Adresse", value: `${client.adresse}, ${client.ville}` },
                                ].map((f) => (
                                    <div key={f.label}>
                                        <label className="text-xs font-medium mb-1.5 block text-muted-foreground">{f.label}</label>
                                        <Input value={f.value} readOnly className="h-9 text-xs bg-white/5 border-white/10" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </TabsContent>

                    {/* ─── Tab: Personnel ─── */}
                    <TabsContent value="personnel" className="mt-4 space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { label: "Total", value: PERSONNEL.length, color: "violet" },
                                { label: "Actifs", value: PERSONNEL.filter((p) => p.statut === "Actif").length, color: "emerald" },
                                { label: "Départements", value: new Set(PERSONNEL.map((p) => p.dept)).size, color: "blue" },
                            ].map((kpi) => (
                                <div key={kpi.label} className="glass-card rounded-xl p-4 border border-white/5">
                                    <p className="text-xl font-bold">{kpi.value}</p>
                                    <p className="text-[10px] text-muted-foreground">{kpi.label}</p>
                                </div>
                            ))}
                        </div>
                        <div className="glass-card rounded-xl p-5 border border-white/5 overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="border-b border-white/5 text-muted-foreground">
                                        <th className="text-left py-2 px-2">Nom</th>
                                        <th className="text-left py-2 px-2">Poste</th>
                                        <th className="text-left py-2 px-2 hidden md:table-cell">Département</th>
                                        <th className="text-left py-2 px-2 hidden sm:table-cell">Rôle</th>
                                        <th className="text-center py-2 px-2">Statut</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {PERSONNEL.map((p) => (
                                        <tr key={p.nom} className="border-b border-white/5 hover:bg-white/[0.02]">
                                            <td className="py-2.5 px-2 font-medium">{p.nom}</td>
                                            <td className="py-2.5 px-2 text-muted-foreground">{p.poste}</td>
                                            <td className="py-2.5 px-2 text-muted-foreground hidden md:table-cell">{p.dept}</td>
                                            <td className="py-2.5 px-2 hidden sm:table-cell">
                                                <Badge variant="secondary" className="text-[9px] bg-white/5 border-0">{p.role}</Badge>
                                            </td>
                                            <td className="py-2.5 px-2 text-center">
                                                <Badge variant="secondary" className="text-[9px] bg-emerald-500/15 text-emerald-400 border-0">{p.statut}</Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </TabsContent>

                    {/* ─── Tab: Structure ─── */}
                    <TabsContent value="structure" className="mt-4 space-y-4">
                        <p className="text-xs font-medium text-muted-foreground/70 uppercase tracking-widest px-1">Départements</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {DEPARTEMENTS.map((dept) => {
                                const colors = DEPT_COLORS[dept.couleur] || DEPT_COLORS.violet;
                                return (
                                    <div key={dept.nom} className="glass-card rounded-xl p-5 border border-white/5">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`h-9 w-9 rounded-lg ${colors.iconBg} flex items-center justify-center`}>
                                                    <Layers className={`h-4 w-4 ${colors.text}`} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold">{dept.nom}</p>
                                                    <p className="text-[10px] text-muted-foreground">Resp: {dept.responsable}</p>
                                                </div>
                                            </div>
                                            <Badge variant="secondary" className={`text-[9px] border-0 ${colors.bg} ${colors.text}`}>
                                                {dept.membres} membres
                                            </Badge>
                                        </div>
                                        <div className="space-y-1 pt-2 border-t border-white/5">
                                            {dept.sousServices.map((ss) => (
                                                <div key={ss} className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                                    <ChevronRight className="h-2.5 w-2.5 shrink-0" />
                                                    <span>{ss}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <p className="text-xs font-medium text-muted-foreground/70 uppercase tracking-widest px-1 pt-2">Bureaux</p>
                        <div className="glass-card rounded-xl border border-white/5 overflow-hidden">
                            <div className="divide-y divide-white/5">
                                {BUREAUX.map((bureau) => (
                                    <div key={bureau.nom} className="flex items-center justify-between px-5 py-4 hover:bg-white/[0.02]">
                                        <div className="flex items-center gap-4">
                                            <div className="h-9 w-9 rounded-lg bg-violet-500/10 flex items-center justify-center">
                                                <Building2 className="h-4 w-4 text-violet-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{bureau.nom}</p>
                                                <div className="flex items-center gap-3 mt-0.5">
                                                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                        <MapPin className="h-2.5 w-2.5" />{bureau.adresse}, {bureau.ville}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                        <Phone className="h-2.5 w-2.5" />{bureau.telephone}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <Badge variant="secondary" className="text-[9px] border-0 bg-emerald-500/15 text-emerald-400">
                                            <Users className="h-2.5 w-2.5 mr-1" /> {bureau.employes}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </motion.div>
        </motion.div>
    );
}
