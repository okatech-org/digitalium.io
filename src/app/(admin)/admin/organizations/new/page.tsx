// ===============================================
// DIGITALIUM.IO — Business: Nouvelle Organisation (Wizard 8 étapes)
// Profil -> Modules -> Écosystème -> Personnel -> Dossiers -> Configuration -> Automatisation -> Déploiement
// Avec brouillon persistant (localStorage) et navigation libre
// ===============================================

"use client";

import React, { useState, useMemo, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Building2,
  Package,
  Network,
  Users,
  FolderTree,
  Settings,
  Zap,
  Server,
  FileText,
  Archive,
  PenTool,
  Bell,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Cloud,
  HardDrive,
  Globe,
  Eye,
  Plus,
  Star,
  Trash2,
  Edit3,
  Landmark,
  Users2,
  Scale,
  Briefcase,
  Wrench,
  Lock,
  ArrowRight,
  X,
  AlertTriangle,
  Save,
  Clock,
  Upload,
  ImageIcon,
  Bot,
  MessageSquare,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

/* ---- Animation variants ---- */
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

/* ================= INTERFACES ================= */

type SiteType = "siege" | "filiale" | "agence" | "bureau_regional" | "antenne";

interface Site {
  id: string;
  nom: string;
  adresse: string;
  ville: string;
  pays: string;
  telephone: string;
  email: string;
  estSiege: boolean;
  type: SiteType;
}

type OrgUnitType =
  | "direction_generale" | "direction" | "sous_direction"
  | "departement" | "service" | "bureau" | "unite" | "cellule";

interface OrgUnit {
  id: string;
  nom: string;
  type: OrgUnitType;
  parentId: string | null;
  siteId: string;
  responsable: string;
  couleur: string;
  description: string;
  ordre: number;
}

interface PersonnelMember {
  id: string;
  nom: string;
  email: string;
  poste: string;
  orgUnitId: string;
  role: "org_admin" | "org_manager" | "org_editor" | "org_member" | "org_viewer";
}

interface DefaultFolder {
  id: string;
  nom: string;
  categorie: string;
  couleur: string;
  icone: string;
  sousDossiers: string[];
  tags: string[];
  orgUnitIds: string[];
  moduleAssociation?: "idocument" | "iarchive" | "isignature";
}

interface TagCategory {
  id: string;
  nom: string;
  tags: string[];
  obligatoire: boolean;
  couleur: string;
}

interface ClassificationRule {
  id: string;
  nom: string;
  condition: { type: "tag" | "nom_contient" | "departement"; valeur: string };
  action: { dossierId: string; tagsAjoutes: string[] };
  actif: boolean;
}

interface IDocumentConfig {
  versioningActif: boolean;
  maxVersions: number;
  autoClassification: boolean;
  champsObligatoires: string[];
  categoriesTags: TagCategory[];
  reglesClassement: ClassificationRule[];
}

type TriggerDateType = "date_creation" | "date_depot" | "date_tag" | "date_gel";

type AlerteUnite = "ans" | "mois" | "semaines" | "jours" | "heures";

interface AlerteConfig {
  id: string;
  delai: number;
  unite: AlerteUnite;
  destinataires: string[];
  message: string;
  actif: boolean;
}

interface RetentionPolicy {
  id: string;
  categorieSlug: string;
  categorieLabel: string;
  dureeAns: number;
  triggerDate: TriggerDateType;
  description: string;
  referenceOHADA: string;
  transitions: {
    activeToSemiActive: number;
    semiActiveToArchived: number;
    expiringThresholdMois: number;
  };
  alertesAvantArchivage: AlerteConfig[];
  alertesAvantSuppression: AlerteConfig[];
}

interface ArchiveCategory {
  slug: string;
  nom: string;
  couleur: string;
  icone: string;
  retentionAns: number;
  confidentialite: string;
  estFixe: boolean;
}

interface IArchiveConfig {
  retentionPolicies: RetentionPolicy[];
  triggerDateDefaut: TriggerDateType;
  autoArchiveActif: boolean;
  confirmationManuelle: boolean;
  categories: ArchiveCategory[];
}

interface SignatureChainStep {
  ordre: number;
  type: "visa" | "approbation" | "signature" | "contre_signature";
  signataire: { mode: "personne" | "role" | "departement"; valeur: string };
  obligatoire: boolean;
}

interface SignatureChain {
  id: string;
  nom: string;
  description: string;
  etapes: SignatureChainStep[];
  estModele: boolean;
}

interface ISignatureConfig {
  parametres: {
    signatureAvancee: boolean;
    horodatageCertifie: boolean;
    delaiDefautJours: number;
    relanceAutoJours: number;
    contreSignatureObligatoire: boolean;
  };
  chainesSignature: SignatureChain[];
  delegations: { delegant: string; delegataire: string; dateDebut: string; dateFin: string; types: string[]; motif: string }[];
}

type TriggerType =
  | "document_cree" | "document_tag" | "document_approuve"
  | "archive_depose" | "archive_status_change" | "retention_expiring"
  | "signature_completee" | "date_echeance";

type ActionType =
  | "envoyer_signature" | "archiver_document" | "classer_dossier"
  | "notifier_personnes" | "changer_statut" | "generer_certificat"
  | "planifier_destruction";

interface AutomationRule {
  id: string;
  nom: string;
  description: string;
  module: "idocument" | "iarchive" | "isignature";
  actif: boolean;
  declencheur: {
    type: TriggerType;
    conditions: { champ: string; operateur: "contient" | "egal"; valeur: string }[];
  };
  actions: { type: ActionType; parametres: Record<string, string>; ordre: number }[];
}

/* ================= CONSTANTS / MOCK DATA ================= */

const SITE_TYPE_CONFIG: Record<SiteType, { label: string; color: string }> = {
  siege: { label: "Siège social", color: "blue" },
  filiale: { label: "Filiale", color: "violet" },
  agence: { label: "Agence", color: "emerald" },
  bureau_regional: { label: "Bureau régional", color: "amber" },
  antenne: { label: "Antenne", color: "cyan" },
};

const ORG_UNIT_TYPE_CONFIG: Record<OrgUnitType, { label: string; level: number; color: string }> = {
  direction_generale: { label: "Direction Générale", level: 0, color: "blue" },
  direction: { label: "Direction", level: 1, color: "violet" },
  sous_direction: { label: "Sous-Direction", level: 2, color: "indigo" },
  departement: { label: "Département", level: 2, color: "emerald" },
  service: { label: "Service", level: 3, color: "cyan" },
  bureau: { label: "Bureau", level: 4, color: "amber" },
  unite: { label: "Unité", level: 4, color: "rose" },
  cellule: { label: "Cellule", level: 5, color: "zinc" },
};

const ALLOWED_CHILDREN: Record<OrgUnitType, OrgUnitType[]> = {
  direction_generale: ["direction", "sous_direction", "departement", "service", "cellule"],
  direction: ["sous_direction", "departement", "service", "bureau", "cellule"],
  sous_direction: ["service", "bureau", "unite", "cellule"],
  departement: ["service", "bureau", "unite", "cellule"],
  service: ["bureau", "unite", "cellule"],
  bureau: ["unite", "cellule"],
  unite: ["cellule"],
  cellule: [],
};

const ORG_UNIT_COLORS = ["blue", "violet", "emerald", "cyan", "amber", "rose", "indigo"];

/* ---- Org Templates ---- */

function getEnterpriseTemplate(siteId: string): OrgUnit[] {
  const dg = uid(), daf = uid(), dt = uid(), dj = uid(), compta = uid(), rh = uid(), prod = uid(), comm = uid();
  return [
    { id: dg, nom: "Direction Générale", type: "direction_generale", parentId: null, siteId, responsable: "", couleur: "blue", description: "", ordre: 0 },
    { id: daf, nom: "Direction Administrative et Financière", type: "direction", parentId: dg, siteId, responsable: "", couleur: "violet", description: "", ordre: 1 },
    { id: compta, nom: "Service Comptabilité", type: "service", parentId: daf, siteId, responsable: "", couleur: "cyan", description: "", ordre: 2 },
    { id: rh, nom: "Service Ressources Humaines", type: "service", parentId: daf, siteId, responsable: "", couleur: "emerald", description: "", ordre: 3 },
    { id: dt, nom: "Direction Technique", type: "direction", parentId: dg, siteId, responsable: "", couleur: "indigo", description: "", ordre: 4 },
    { id: prod, nom: "Service Production", type: "service", parentId: dt, siteId, responsable: "", couleur: "amber", description: "", ordre: 5 },
    { id: comm, nom: "Service Commercial", type: "service", parentId: dt, siteId, responsable: "", couleur: "rose", description: "", ordre: 6 },
    { id: dj, nom: "Direction Juridique", type: "direction", parentId: dg, siteId, responsable: "", couleur: "emerald", description: "", ordre: 7 },
  ];
}

function getGovernmentTemplate(siteId: string): OrgUnit[] {
  const cab = uid(), sg = uid(), dgs = uid(), da = uid(), pers = uid(), budg = uid(), dtec = uid();
  return [
    { id: cab, nom: "Cabinet", type: "direction_generale", parentId: null, siteId, responsable: "", couleur: "blue", description: "", ordre: 0 },
    { id: sg, nom: "Secrétariat Général", type: "direction", parentId: cab, siteId, responsable: "", couleur: "violet", description: "", ordre: 1 },
    { id: dgs, nom: "Direction Générale des Services", type: "direction", parentId: cab, siteId, responsable: "", couleur: "indigo", description: "", ordre: 2 },
    { id: da, nom: "Direction Administrative", type: "sous_direction", parentId: dgs, siteId, responsable: "", couleur: "emerald", description: "", ordre: 3 },
    { id: pers, nom: "Service du Personnel", type: "service", parentId: da, siteId, responsable: "", couleur: "cyan", description: "", ordre: 4 },
    { id: budg, nom: "Service Budget", type: "service", parentId: da, siteId, responsable: "", couleur: "amber", description: "", ordre: 5 },
    { id: dtec, nom: "Direction Technique", type: "direction", parentId: cab, siteId, responsable: "", couleur: "rose", description: "", ordre: 6 },
  ];
}

function getNGOTemplate(siteId: string): OrgUnit[] {
  const de = uid(), prog = uid(), daf = uid(), com = uid();
  return [
    { id: de, nom: "Direction Exécutive", type: "direction_generale", parentId: null, siteId, responsable: "", couleur: "blue", description: "", ordre: 0 },
    { id: prog, nom: "Département Programmes", type: "departement", parentId: de, siteId, responsable: "", couleur: "emerald", description: "", ordre: 1 },
    { id: daf, nom: "Administration et Finances", type: "departement", parentId: de, siteId, responsable: "", couleur: "violet", description: "", ordre: 2 },
    { id: com, nom: "Communication", type: "departement", parentId: de, siteId, responsable: "", couleur: "cyan", description: "", ordre: 3 },
  ];
}

const ROLE_CONFIG: Record<string, { label: string; color: string }> = {
  org_admin: { label: "Admin", color: "red" },
  org_manager: { label: "Responsable", color: "blue" },
  org_editor: { label: "Editeur", color: "emerald" },
  org_member: { label: "Membre", color: "zinc" },
  org_viewer: { label: "Lecteur", color: "gray" },
};

const FOLDER_TEMPLATES: Record<string, { id: string; nom: string; description: string; recommended: string }> = {
  entreprise: { id: "tpl_entreprise", nom: "Structure Standard Entreprise (Gabon)", description: "6 dossiers : Fiscal, RH, Juridique, Commercial, Technique, Coffre-Fort", recommended: "Entreprise" },
  gouvernement: { id: "tpl_gouv", nom: "Structure Administration Publique", description: "Dossiers administratifs, finances publiques, RH fonction publique", recommended: "Gouvernement" },
  etablissement: { id: "tpl_etab", nom: "Structure Etablissement Public", description: "Structure mixte administration et gestion commerciale", recommended: "Établissement public" },
  ong: { id: "tpl_ong", nom: "Structure Minimale", description: "Dossiers essentiels pour ONG et associations", recommended: "ONG" },
};

const DEFAULT_FOLDERS_ENTREPRISE: DefaultFolder[] = [
  { id: "f1", nom: "Documents Fiscaux", categorie: "fiscal", couleur: "amber", icone: "Landmark", sousDossiers: ["Déclarations TVA", "Bilans Annuels", "Liasses Fiscales"], tags: ["fiscal", "ohada"], orgUnitIds: [], moduleAssociation: "iarchive" },
  { id: "f2", nom: "Documents RH", categorie: "social", couleur: "blue", icone: "Users2", sousDossiers: ["Contrats de Travail", "Bulletins de Paie", "Congés"], tags: ["rh", "social"], orgUnitIds: [], moduleAssociation: "idocument" },
  { id: "f3", nom: "Contrats & Juridique", categorie: "juridique", couleur: "emerald", icone: "Scale", sousDossiers: ["Contrats Fournisseurs", "PV Assemblée", "Statuts"], tags: ["juridique", "contrats"], orgUnitIds: [], moduleAssociation: "isignature" },
  { id: "f4", nom: "Documents Commerciaux", categorie: "client", couleur: "violet", icone: "Briefcase", sousDossiers: ["Factures Clients", "Devis", "Bons de Commande"], tags: ["commercial", "client"], orgUnitIds: [], moduleAssociation: "idocument" },
  { id: "f5", nom: "Documents Techniques", categorie: "technique", couleur: "cyan", icone: "Wrench", sousDossiers: ["Plans", "Rapports Maintenance", "Normes"], tags: ["technique"], orgUnitIds: [], moduleAssociation: "idocument" },
  { id: "f6", nom: "Coffre-Fort Numérique", categorie: "coffre", couleur: "rose", icone: "Lock", sousDossiers: ["Titres de Propriété", "Actes Notariés", "Brevets"], tags: ["coffre-fort", "sécurisé"], orgUnitIds: [], moduleAssociation: "iarchive" },
];

const TRIGGER_LABELS: Record<string, string> = {
  document_cree: "Document créé",
  document_tag: "Tag ajouté",
  document_approuve: "Document approuvé",
  archive_depose: "Archive déposée",
  archive_status_change: "Statut archive changé",
  retention_expiring: "Rétention expirante",
  signature_completee: "Signature complétée",
  date_echeance: "Date échéance atteinte",
};

const ACTION_LABELS: Record<string, string> = {
  envoyer_signature: "Envoyer en signature",
  archiver_document: "Archiver le document",
  classer_dossier: "Classer dans dossier",
  notifier_personnes: "Notifier les personnes",
  changer_statut: "Changer le statut",
  generer_certificat: "Générer certificat",
  planifier_destruction: "Planifier destruction",
};

const AUTOMATION_TEMPLATES: AutomationRule[] = [
  {
    id: "at1", nom: "Auto-archivage documents approuvés", description: "Archive automatiquement les documents validés", module: "idocument", actif: false,
    declencheur: { type: "document_approuve", conditions: [{ champ: "statut", operateur: "egal", valeur: "approuvé" }] },
    actions: [{ type: "archiver_document", parametres: { destination: "archive_principale" }, ordre: 1 }, { type: "notifier_personnes", parametres: { role: "org_manager" }, ordre: 2 }],
  },
  {
    id: "at2", nom: "Signature obligatoire contrats", description: "Envoie en signature tout nouveau contrat", module: "idocument", actif: false,
    declencheur: { type: "document_tag", conditions: [{ champ: "tag", operateur: "contient", valeur: "contrat" }] },
    actions: [{ type: "envoyer_signature", parametres: { chaine: "default" }, ordre: 1 }],
  },
  {
    id: "at3", nom: "Alertes expiration archives", description: "Notifie 6 mois avant expiration de rétention", module: "iarchive", actif: false,
    declencheur: { type: "retention_expiring", conditions: [{ champ: "delai_mois", operateur: "egal", valeur: "6" }] },
    actions: [{ type: "notifier_personnes", parametres: { role: "org_admin" }, ordre: 1 }],
  },
  {
    id: "at4", nom: "Classement auto PV signés", description: "Classe les PV signés dans le dossier juridique", module: "isignature", actif: false,
    declencheur: { type: "signature_completee", conditions: [{ champ: "tag", operateur: "contient", valeur: "pv" }] },
    actions: [{ type: "classer_dossier", parametres: { dossier: "Contrats & Juridique" }, ordre: 1 }, { type: "archiver_document", parametres: { categorie: "juridique" }, ordre: 2 }],
  },
  {
    id: "at5", nom: "Purge archives expirées", description: "Planifie la destruction des archives expirées", module: "iarchive", actif: false,
    declencheur: { type: "archive_status_change", conditions: [{ champ: "statut", operateur: "egal", valeur: "expiré" }] },
    actions: [{ type: "planifier_destruction", parametres: { delai_jours: "30" }, ordre: 1 }, { type: "generer_certificat", parametres: { type: "destruction" }, ordre: 2 }],
  },
];

const LIFECYCLE_NODES = [
  { label: "Création", color: "zinc" },
  { label: "Actif", color: "emerald" },
  { label: "Semi-actif", color: "blue" },
  { label: "Archivé", color: "violet" },
  { label: "Gel juridique", color: "amber" },
  { label: "Expiration proche", color: "orange" },
  { label: "Expiré", color: "red" },
  { label: "Détruit", color: "zinc" },
];

const ALERTE_PRESETS: { delai: number; unite: AlerteUnite; label: string }[] = [
  { delai: 1, unite: "ans", label: "1 an" },
  { delai: 6, unite: "mois", label: "6 mois" },
  { delai: 3, unite: "mois", label: "3 mois" },
  { delai: 15, unite: "jours", label: "15 jours" },
  { delai: 1, unite: "semaines", label: "1 semaine" },
  { delai: 3, unite: "jours", label: "3 jours" },
  { delai: 1, unite: "jours", label: "1 jour" },
  { delai: 1, unite: "heures", label: "1 heure" },
];

const ALERTE_SUPPRESSION_PRESETS: { delai: number; unite: AlerteUnite; label: string }[] = [
  { delai: 6, unite: "mois", label: "6 mois" },
  { delai: 3, unite: "mois", label: "3 mois" },
  { delai: 1, unite: "mois", label: "1 mois" },
  { delai: 15, unite: "jours", label: "15 jours" },
  { delai: 1, unite: "semaines", label: "1 semaine" },
  { delai: 1, unite: "jours", label: "1 jour" },
  { delai: 1, unite: "heures", label: "1 heure" },
];

const UNITE_OPTIONS: { value: AlerteUnite; label: string }[] = [
  { value: "ans", label: "An(s)" },
  { value: "mois", label: "Mois" },
  { value: "semaines", label: "Semaine(s)" },
  { value: "jours", label: "Jour(s)" },
  { value: "heures", label: "Heure(s)" },
];

const OHADA_REFERENCES: Record<string, { dureeAns: number; article: string; description: string }> = {
  fiscal: { dureeAns: 10, article: "Acte Uniforme Comptable Art. 24", description: "10 ans à compter de la clôture de l'exercice fiscal" },
  social: { dureeAns: 5, article: "Code du Travail Gabonais Art. 178", description: "5 ans après la fin du contrat de travail" },
  juridique: { dureeAns: 30, article: "Acte Uniforme Droit des Sociétés Art. 36", description: "30 ans à compter du dépôt au greffe" },
  client: { dureeAns: 5, article: "Acte Uniforme Droit Commercial Art. 18", description: "5 ans après la dernière opération" },
  coffre: { dureeAns: 99, article: "Conservation perpétuelle", description: "Titres de propriété, actes notariés — conservation illimitée" },
};

function alerteLabel(a: AlerteConfig): string {
  if (a.unite === "ans") return `${a.delai} an${a.delai > 1 ? "s" : ""}`;
  if (a.unite === "mois") return `${a.delai} mois`;
  if (a.unite === "semaines") return `${a.delai} semaine${a.delai > 1 ? "s" : ""}`;
  if (a.unite === "heures") return `${a.delai} heure${a.delai > 1 ? "s" : ""}`;
  return `${a.delai} jour${a.delai > 1 ? "s" : ""}`;
}

/* ---- Helpers ---- */

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function getFolderIcon(icone: string) {
  switch (icone) {
    case "Landmark": return Landmark;
    case "Users2": return Users2;
    case "Scale": return Scale;
    case "Briefcase": return Briefcase;
    case "Wrench": return Wrench;
    case "Lock": return Lock;
    default: return FolderTree;
  }
}

/* ================= MAIN COMPONENT ================= */

/* ─── Draft helpers ─── */
const DRAFT_PREFIX = "digitalium-org-draft-";

function getDraftKeys(): string[] {
  if (typeof window === "undefined") return [];
  return Object.keys(localStorage).filter((k) => k.startsWith(DRAFT_PREFIX));
}

function formatTimeAgo(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return "à l'instant";
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`;
  return `il y a ${Math.floor(diff / 86400)}j`;
}

function NewOrganizationWizardInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);

  // Step 1: Profil
  const [profil, setProfil] = useState({
    nom: "", secteur: "", type: "Entreprise", rccm: "", nif: "",
    contact: "", email: "", telephone: "", adresse: "", ville: "",
    logo: "",
  });

  // Step 2: Modules
  const [modules, setModules] = useState({ idocument: true, iarchive: false, isignature: false, iasted: false, ipublic: false, ieditor: false, ichat: false, ianalytics: false });

  // Step 3: Ecosysteme
  const [sites, setSites] = useState<Site[]>([]);
  const [orgUnits, setOrgUnits] = useState<OrgUnit[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [showSiteForm, setShowSiteForm] = useState(false);
  const [newSite, setNewSite] = useState<Omit<Site, "id">>({ nom: "", adresse: "", ville: "", pays: "Gabon", telephone: "", email: "", estSiege: false, type: "siege" });
  const [showAddUnitForm, setShowAddUnitForm] = useState<string | null>(null); // parentId or "root"
  const [newUnit, setNewUnit] = useState<Omit<OrgUnit, "id">>({ nom: "", type: "direction", parentId: null, siteId: "", responsable: "", couleur: "blue", description: "", ordre: 0 });
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);

  // Step 4: Personnel
  const [personnel, setPersonnel] = useState<PersonnelMember[]>([]);
  const [showPersonnelForm, setShowPersonnelForm] = useState(false);
  const [newMember, setNewMember] = useState<Omit<PersonnelMember, "id">>({ nom: "", email: "", poste: "", orgUnitId: "", role: "org_member" });

  // Step 5: Dossiers
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [dossiers, setDossiers] = useState<DefaultFolder[]>([]);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState("");

  // Step 6: Configuration
  const [docConfig, setDocConfig] = useState<IDocumentConfig>({
    versioningActif: true, maxVersions: 10, autoClassification: true,
    champsObligatoires: ["tags", "unite_org"],
    categoriesTags: [
      { id: "tc1", nom: "Nature du document", tags: ["facture", "contrat", "rapport", "pv"], obligatoire: true, couleur: "blue" },
      { id: "tc2", nom: "Confidentialité", tags: ["public", "interne", "confidentiel", "secret"], obligatoire: false, couleur: "amber" },
    ],
    reglesClassement: [
      { id: "rc1", nom: "Factures vers Dossier Fiscal", condition: { type: "tag", valeur: "facture" }, action: { dossierId: "f1", tagsAjoutes: ["fiscal"] }, actif: true },
      { id: "rc2", nom: "Contrats vers Juridique", condition: { type: "tag", valeur: "contrat" }, action: { dossierId: "f3", tagsAjoutes: ["juridique"] }, actif: true },
      { id: "rc3", nom: "Paie vers RH", condition: { type: "nom_contient", valeur: "bulletin" }, action: { dossierId: "f2", tagsAjoutes: ["paie"] }, actif: false },
    ],
  });

  const [archiveConfig, setArchiveConfig] = useState<IArchiveConfig>({
    retentionPolicies: [
      {
        id: "rp1", categorieSlug: "fiscal", categorieLabel: "Documents Fiscaux", dureeAns: 10, triggerDate: "date_tag",
        description: "10 ans à compter de la clôture exercice fiscal", referenceOHADA: "Acte Uniforme Comptable Art. 24",
        transitions: { activeToSemiActive: 5, semiActiveToArchived: 3, expiringThresholdMois: 12 },
        alertesAvantArchivage: [
          { id: "a1f", delai: 1, unite: "ans", destinataires: ["org_admin", "org_manager"], message: "Archive {nom} sera archivée dans {delai}", actif: true },
          { id: "a2f", delai: 6, unite: "mois", destinataires: ["org_admin", "org_manager"], message: "Archive {nom} sera archivée dans {delai}", actif: true },
          { id: "a3f", delai: 3, unite: "mois", destinataires: ["org_admin"], message: "Archive {nom} sera archivée dans {delai}", actif: true },
          { id: "a4f", delai: 15, unite: "jours", destinataires: ["org_admin"], message: "Archive {nom} sera archivée dans {delai}", actif: true },
          { id: "a5f", delai: 1, unite: "semaines", destinataires: ["org_admin"], message: "ATTENTION: Archive {nom} sera archivée dans {delai}", actif: true },
          { id: "a6f", delai: 3, unite: "jours", destinataires: ["org_admin"], message: "ATTENTION: Archive {nom} sera archivée dans {delai}", actif: true },
          { id: "a7f", delai: 1, unite: "jours", destinataires: ["org_admin"], message: "URGENT: Archive {nom} sera archivée demain", actif: true },
          { id: "a8f", delai: 1, unite: "heures", destinataires: ["org_admin"], message: "CRITIQUE: Archive {nom} sera archivée dans 1 heure", actif: true },
        ],
        alertesAvantSuppression: [
          { id: "s1f", delai: 1, unite: "mois", destinataires: ["org_admin"], message: "Archive {nom} sera supprimée dans {delai}", actif: true },
          { id: "s2f", delai: 1, unite: "semaines", destinataires: ["org_admin"], message: "URGENT: Suppression de {nom} dans {delai}", actif: true },
          { id: "s3f", delai: 1, unite: "jours", destinataires: ["org_admin"], message: "CRITIQUE: Suppression de {nom} demain", actif: true },
        ],
      },
      {
        id: "rp2", categorieSlug: "social", categorieLabel: "Documents Sociaux", dureeAns: 5, triggerDate: "date_creation",
        description: "5 ans après création du document", referenceOHADA: "Code du Travail Gabonais Art. 178",
        transitions: { activeToSemiActive: 2, semiActiveToArchived: 2, expiringThresholdMois: 6 },
        alertesAvantArchivage: [
          { id: "a1s", delai: 6, unite: "mois", destinataires: ["org_admin", "org_manager"], message: "Archive {nom} sera archivée dans {delai}", actif: true },
          { id: "a2s", delai: 3, unite: "mois", destinataires: ["org_admin"], message: "Archive {nom} sera archivée dans {delai}", actif: true },
          { id: "a3s", delai: 1, unite: "semaines", destinataires: ["org_admin"], message: "ATTENTION: Archive {nom} sera archivée dans {delai}", actif: true },
          { id: "a4s", delai: 1, unite: "jours", destinataires: ["org_admin"], message: "URGENT: Archive {nom} sera archivée demain", actif: true },
          { id: "a5s", delai: 1, unite: "heures", destinataires: ["org_admin"], message: "CRITIQUE: Archive {nom} sera archivée dans 1 heure", actif: true },
        ],
        alertesAvantSuppression: [
          { id: "s1s", delai: 15, unite: "jours", destinataires: ["org_admin"], message: "Archive {nom} sera supprimée dans {delai}", actif: true },
        ],
      },
      {
        id: "rp3", categorieSlug: "juridique", categorieLabel: "Documents Juridiques", dureeAns: 30, triggerDate: "date_depot",
        description: "30 ans à compter du dépôt", referenceOHADA: "Acte Uniforme Droit Sociétés Art. 36",
        transitions: { activeToSemiActive: 10, semiActiveToArchived: 10, expiringThresholdMois: 24 },
        alertesAvantArchivage: [
          { id: "a1j", delai: 1, unite: "ans", destinataires: ["org_admin", "org_manager"], message: "Archive {nom} sera archivée dans {delai}", actif: true },
          { id: "a2j", delai: 3, unite: "mois", destinataires: ["org_admin"], message: "Archive {nom} sera archivée dans {delai}", actif: true },
          { id: "a3j", delai: 1, unite: "semaines", destinataires: ["org_admin"], message: "ATTENTION: Archive {nom} sera archivée dans {delai}", actif: true },
          { id: "a4j", delai: 1, unite: "jours", destinataires: ["org_admin"], message: "URGENT: Archive {nom} sera archivée demain", actif: true },
        ],
        alertesAvantSuppression: [
          { id: "s1j", delai: 3, unite: "mois", destinataires: ["org_admin"], message: "Archive {nom} sera supprimée dans {delai}", actif: true },
          { id: "s2j", delai: 1, unite: "semaines", destinataires: ["org_admin"], message: "URGENT: Suppression de {nom} dans {delai}", actif: true },
        ],
      },
      {
        id: "rp4", categorieSlug: "client", categorieLabel: "Documents Clients", dureeAns: 5, triggerDate: "date_creation",
        description: "5 ans après création", referenceOHADA: "Acte Uniforme Droit Commercial Art. 18",
        transitions: { activeToSemiActive: 2, semiActiveToArchived: 2, expiringThresholdMois: 6 },
        alertesAvantArchivage: [
          { id: "a1c", delai: 3, unite: "mois", destinataires: ["org_admin"], message: "Archive {nom} sera archivée dans {delai}", actif: true },
          { id: "a2c", delai: 1, unite: "jours", destinataires: ["org_admin"], message: "URGENT: Archive {nom} sera archivée demain", actif: true },
        ],
        alertesAvantSuppression: [
          { id: "s1c", delai: 1, unite: "semaines", destinataires: ["org_admin"], message: "Archive {nom} sera supprimée dans {delai}", actif: true },
        ],
      },
      {
        id: "rp5", categorieSlug: "coffre", categorieLabel: "Coffre-Fort", dureeAns: 99, triggerDate: "date_gel",
        description: "Conservation perpétuelle", referenceOHADA: "Conservation perpétuelle",
        transitions: { activeToSemiActive: 50, semiActiveToArchived: 30, expiringThresholdMois: 60 },
        alertesAvantArchivage: [],
        alertesAvantSuppression: [],
      },
    ],
    triggerDateDefaut: "date_creation",
    autoArchiveActif: true,
    confirmationManuelle: true,
    categories: [
      { slug: "fiscal", nom: "Fiscal", couleur: "amber", icone: "Landmark", retentionAns: 10, confidentialite: "confidentiel", estFixe: false },
      { slug: "social", nom: "Social", couleur: "blue", icone: "Users2", retentionAns: 5, confidentialite: "interne", estFixe: false },
      { slug: "juridique", nom: "Juridique", couleur: "emerald", icone: "Scale", retentionAns: 30, confidentialite: "confidentiel", estFixe: false },
      { slug: "client", nom: "Client", couleur: "violet", icone: "Briefcase", retentionAns: 5, confidentialite: "interne", estFixe: false },
      { slug: "coffre", nom: "Coffre-Fort", couleur: "rose", icone: "Lock", retentionAns: 99, confidentialite: "secret", estFixe: true },
    ],
  });

  const [signatureConfig, setSignatureConfig] = useState<ISignatureConfig>({
    parametres: { signatureAvancee: true, horodatageCertifie: true, delaiDefautJours: 7, relanceAutoJours: 3, contreSignatureObligatoire: false },
    chainesSignature: [
      {
        id: "cs1", nom: "Validation Contrat Client", description: "Circuit standard pour contrats clients", estModele: true, etapes: [
          { ordre: 1, type: "visa", signataire: { mode: "role", valeur: "org_manager" }, obligatoire: true },
          { ordre: 2, type: "signature", signataire: { mode: "personne", valeur: "Directeur Général" }, obligatoire: true },
          { ordre: 3, type: "contre_signature", signataire: { mode: "role", valeur: "org_admin" }, obligatoire: false },
        ]
      },
      {
        id: "cs2", nom: "Approbation Document Interne", description: "Validation rapide pour documents internes", estModele: true, etapes: [
          { ordre: 1, type: "approbation", signataire: { mode: "departement", valeur: "Direction Générale" }, obligatoire: true },
          { ordre: 2, type: "signature", signataire: { mode: "role", valeur: "org_manager" }, obligatoire: true },
        ]
      },
    ],
    delegations: [
      { delegant: "Pierre Nguema", delegataire: "Éric Assoumou", dateDebut: "2025-07-01", dateFin: "2025-07-31", types: ["contrat", "facture"], motif: "Congés annuels DG" },
    ],
  });

  // Step 7: Automatisation
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);

  // Step 8: Deploiement
  const [hebergement, setHebergement] = useState<"Local" | "Data_Center" | "Cloud">("Cloud");
  const [pagePublique, setPagePublique] = useState(false);
  const [domaine, setDomaine] = useState("");
  const [theme, setTheme] = useState("violet");
  const [annuaire, setAnnuaire] = useState<"public" | "prive">("prive");

  // Draft state
  const [draftId, setDraftId] = useState<string>("");
  const [visitedSteps, setVisitedSteps] = useState<Set<number>>(new Set([1]));
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  const [draftLoaded, setDraftLoaded] = useState(false);

  /* ---- Computed ---- */
  const hasModules = modules.idocument || modules.iarchive || modules.isignature || modules.iasted || modules.ieditor;

  const visibleSteps = useMemo(() => {
    const base = [
      { id: 1, label: "Profil", icon: Building2 },
      { id: 2, label: "Modules", icon: Package },
      { id: 3, label: "Écosystème", icon: Network },
      { id: 4, label: "Personnel", icon: Users },
      { id: 5, label: "Dossiers", icon: FolderTree },
    ];
    if (hasModules) {
      base.push({ id: 6, label: "Configuration", icon: Settings });
      base.push({ id: 7, label: "Automatisation", icon: Zap });
    }
    base.push({ id: hasModules ? 8 : 6, label: "Déploiement", icon: Server });
    return base;
  }, [hasModules]);

  const maxStep = visibleSteps[visibleSteps.length - 1].id;
  const currentStepIndex = visibleSteps.findIndex((s) => s.id === step);

  /* ---- Step validation (non-blocking) ---- */
  const isStepValid = useCallback((stepId: number): boolean => {
    if (stepId === 1) return profil.nom.length > 0;
    if (stepId === 3) return sites.length > 0;
    if (stepId === 4) return personnel.some((p) => p.role === "org_admin");
    if (stepId === 5) return dossiers.length > 0;
    return true;
  }, [profil.nom, sites.length, personnel, dossiers.length]);

  /* ---- Draft save/load ---- */
  const saveDraft = useCallback(() => {
    if (!draftId) return;
    const draft = {
      draftId, step, visitedSteps: Array.from(visitedSteps),
      profil, modules, sites, orgUnits, personnel, dossiers,
      selectedTemplate, docConfig, archiveConfig, signatureConfig,
      automationRules, hebergement, pagePublique, domaine, theme, annuaire,
      updatedAt: Date.now(),
    };
    localStorage.setItem(DRAFT_PREFIX + draftId, JSON.stringify(draft));
    setLastSaved(Date.now());
  }, [draftId, step, visitedSteps, profil, modules, sites, orgUnits, personnel, dossiers, selectedTemplate, docConfig, archiveConfig, signatureConfig, automationRules, hebergement, pagePublique, domaine, theme, annuaire]);

  const deleteDraft = useCallback(() => {
    if (draftId) localStorage.removeItem(DRAFT_PREFIX + draftId);
    toast.info("Brouillon supprimé");
    router.push("/admin/organizations");
  }, [draftId, router]);

  // Init draft on mount
  useEffect(() => {
    if (draftLoaded) return;
    const paramDraft = searchParams.get("draft");
    if (paramDraft) {
      const stored = localStorage.getItem(DRAFT_PREFIX + paramDraft);
      if (stored) {
        try {
          const d = JSON.parse(stored);
          setDraftId(paramDraft);
          setStep(d.step || 1);
          setVisitedSteps(new Set(d.visitedSteps || [1]));
          setProfil(d.profil || profil);
          setModules(d.modules || modules);
          setSites(d.sites || []);
          setOrgUnits(d.orgUnits || []);
          setPersonnel(d.personnel || []);
          setDossiers(d.dossiers || []);
          setSelectedTemplate(d.selectedTemplate || null);
          setDocConfig(d.docConfig || docConfig);
          setArchiveConfig(d.archiveConfig || archiveConfig);
          setSignatureConfig(d.signatureConfig || signatureConfig);
          setAutomationRules(d.automationRules || []);
          setHebergement(d.hebergement || "Cloud");
          setPagePublique(d.pagePublique || false);
          setDomaine(d.domaine || "");
          setTheme(d.theme || "violet");
          setAnnuaire(d.annuaire || "prive");
          setLastSaved(d.updatedAt || null);
          toast.success("Brouillon chargé");
        } catch { /* ignore corrupt */ }
      }
    } else {
      setDraftId(uid());
    }
    setDraftLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save on step change
  useEffect(() => {
    if (draftLoaded && draftId) saveDraft();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, draftLoaded]);

  /* ---- Pre-fill site from profil ---- */
  const ensureDefaultSite = () => {
    if (sites.length === 0 && (profil.adresse || profil.ville)) {
      setSites([{
        id: uid(), nom: "Siège Social",
        adresse: profil.adresse || "Boulevard Léon Mba",
        ville: profil.ville || "Libreville",
        pays: "Gabon",
        telephone: profil.telephone || "",
        email: profil.email || "",
        estSiege: true, type: "siege",
      }]);
    }
  };

  /* ---- Org tree helpers ---- */
  const getOrgUnitOptions = (): { id: string; label: string }[] => {
    const result: { id: string; label: string }[] = [];
    const buildList = (parentId: string | null, depth: number) => {
      orgUnits
        .filter((u) => u.parentId === parentId)
        .sort((a, b) => a.ordre - b.ordre)
        .forEach((u) => {
          result.push({ id: u.id, label: "\u00A0\u00A0".repeat(depth) + (depth > 0 ? "└ " : "") + u.nom });
          buildList(u.id, depth + 1);
        });
    };
    buildList(null, 0);
    return result;
  };

  const getMaxDepth = (): number => {
    const depth = (id: string | null, d: number): number => {
      const children = orgUnits.filter((u) => u.parentId === id);
      if (children.length === 0) return d;
      return Math.max(...children.map((c) => depth(c.id, d + 1)));
    };
    return depth(null, 0);
  };

  const deleteUnitAndChildren = (unitId: string) => {
    const toDelete = new Set<string>();
    const collect = (id: string) => {
      toDelete.add(id);
      orgUnits.filter((u) => u.parentId === id).forEach((u) => collect(u.id));
    };
    collect(unitId);
    setOrgUnits((prev) => prev.filter((u) => !toDelete.has(u.id)));
  };

  const applyTemplate = (tplKey: string) => {
    const siteId = sites.length > 0 ? sites[0].id : "";
    let units: OrgUnit[] = [];
    if (tplKey === "entreprise") units = getEnterpriseTemplate(siteId);
    else if (tplKey === "gouvernement") units = getGovernmentTemplate(siteId);
    else if (tplKey === "ong") units = getNGOTemplate(siteId);
    setOrgUnits(units);
    setExpandedNodes(new Set(units.map((u) => u.id)));
    toast.success("Template appliqué", { description: `Structure ${tplKey} chargée` });
  };

  /* ---- Recursive tree node renderer ---- */
  const OrgTreeNodeRender = ({ unitId, depth }: { unitId: string; depth: number }) => {
    const unit = orgUnits.find((u) => u.id === unitId);
    if (!unit) return null;
    const children = orgUnits.filter((u) => u.parentId === unitId).sort((a, b) => a.ordre - b.ordre);
    const isExpanded = expandedNodes.has(unitId);
    const config = ORG_UNIT_TYPE_CONFIG[unit.type];
    const site = sites.find((s) => s.id === unit.siteId);
    const allowedTypes = ALLOWED_CHILDREN[unit.type];

    return (
      <div style={{ paddingLeft: depth * 24 }}>
        {/* Node row */}
        <div className="group flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-white/[0.03] transition-all">
          {/* Expand/collapse */}
          {children.length > 0 ? (
            <button onClick={() => setExpandedNodes((prev) => {
              const next = new Set(prev);
              next.has(unitId) ? next.delete(unitId) : next.add(unitId);
              return next;
            })} className="text-muted-foreground hover:text-white transition-colors">
              {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
            </button>
          ) : (
            <span className="w-3.5" />
          )}

          {/* Color dot */}
          <div className={`h-2.5 w-2.5 rounded-full bg-${config.color}-500 shrink-0`} />

          {/* Name (editable) */}
          {editingUnitId === unitId ? (
            <Input
              autoFocus
              value={unit.nom}
              onChange={(e) => setOrgUnits((prev) => prev.map((u) => u.id === unitId ? { ...u, nom: e.target.value } : u))}
              onKeyDown={(e) => { if (e.key === "Enter") setEditingUnitId(null); }}
              onBlur={() => setEditingUnitId(null)}
              className="h-6 text-xs bg-white/5 border-white/10 w-48"
            />
          ) : (
            <span className="text-xs font-medium">{unit.nom}</span>
          )}

          {/* Type badge */}
          <Badge className={`text-[8px] bg-${config.color}-500/10 text-${config.color}-400 border-${config.color}-500/20 py-0`}>
            {config.label}
          </Badge>

          {/* Site badge */}
          {site && (
            <Badge className="text-[8px] bg-white/5 text-muted-foreground border-white/10 py-0">
              {site.nom}
            </Badge>
          )}

          {/* Actions (hover) */}
          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 ml-auto transition-opacity">
            {allowedTypes.length > 0 && (
              <button onClick={() => {
                setShowAddUnitForm(unitId);
                setNewUnit({ nom: "", type: allowedTypes[0], parentId: unitId, siteId: unit.siteId, responsable: "", couleur: ORG_UNIT_COLORS[Math.floor(Math.random() * ORG_UNIT_COLORS.length)], description: "", ordre: orgUnits.length });
              }} className="text-muted-foreground hover:text-blue-400 transition-colors" title="Ajouter enfant">
                <Plus className="h-3 w-3" />
              </button>
            )}
            <button onClick={() => setEditingUnitId(unitId)} className="text-muted-foreground hover:text-blue-400 transition-colors" title="Renommer">
              <Edit3 className="h-3 w-3" />
            </button>
            <button onClick={() => deleteUnitAndChildren(unitId)} className="text-muted-foreground hover:text-red-400 transition-colors" title="Supprimer">
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Inline add-child form */}
        {showAddUnitForm === unitId && (
          <div style={{ paddingLeft: 24 }} className="my-1">
            <div className="bg-white/[0.02] border border-blue-500/20 rounded-lg p-3 space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <Input value={newUnit.nom} onChange={(e) => setNewUnit((p) => ({ ...p, nom: e.target.value }))} placeholder="Nom de l'unité" className="h-7 text-xs bg-white/5 border-white/10" />
                <select value={newUnit.type} onChange={(e) => setNewUnit((p) => ({ ...p, type: e.target.value as OrgUnitType }))} className="h-7 text-xs bg-white/5 border border-white/10 rounded-md px-2 text-white">
                  {allowedTypes.map((t) => (
                    <option key={t} value={t}>{ORG_UNIT_TYPE_CONFIG[t].label}</option>
                  ))}
                </select>
                <select value={newUnit.siteId} onChange={(e) => setNewUnit((p) => ({ ...p, siteId: e.target.value }))} className="h-7 text-xs bg-white/5 border border-white/10 rounded-md px-2 text-white">
                  {sites.map((s) => (
                    <option key={s.id} value={s.id}>{s.nom}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-muted-foreground">Couleur:</span>
                  {ORG_UNIT_COLORS.map((c) => (
                    <button key={c} onClick={() => setNewUnit((p) => ({ ...p, couleur: c }))}
                      className={`h-4 w-4 rounded-full bg-${c}-500 transition-all ${newUnit.couleur === c ? "ring-2 ring-white/30 scale-110" : "opacity-40 hover:opacity-70"}`}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setShowAddUnitForm(null)} className="text-[10px] h-6">Annuler</Button>
                  <Button size="sm" onClick={() => {
                    if (!newUnit.nom) return;
                    setOrgUnits((prev) => [...prev, { ...newUnit, id: uid() }]);
                    setExpandedNodes((prev) => { const n = new Set(Array.from(prev)); n.add(unitId); return n; });
                    setShowAddUnitForm(null);
                  }} className="bg-gradient-to-r from-blue-600 to-violet-500 text-white text-[10px] h-6">Ajouter</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Children */}
        {isExpanded && children.map((child) => (
          <OrgTreeNodeRender key={child.id} unitId={child.id} depth={depth + 1} />
        ))}
      </div>
    );
  };

  /* ---- Validation (non-blocking, advisory only) ---- */
  const getValidationMessage = (s: number) => {
    if (s === 1 && !profil.nom) return "Veuillez renseigner la raison sociale";
    if (s === 3 && sites.length === 0) return "Ajoutez au moins un site";
    if (s === 4 && !personnel.some((p) => p.role === "org_admin")) return "Au moins un membre doit avoir le rôle Admin";
    if (s === 5 && dossiers.length === 0) return "Sélectionnez un template ou ajoutez des dossiers";
    return "";
  };

  /* ---- Navigation (libre) ---- */
  const navigateToStep = (targetStepId: number) => {
    saveDraft();
    setVisitedSteps((prev) => { const n = new Set(prev); n.add(targetStepId); return n; });
    setStep(targetStepId);
  };

  const goNext = () => {
    const msg = getValidationMessage(step);
    if (msg) {
      toast.warning("Étape incomplète", { description: msg + " — Vous pourrez revenir plus tard." });
    }
    if (step === 2) ensureDefaultSite();
    const nextIdx = currentStepIndex + 1;
    if (nextIdx < visibleSteps.length) {
      navigateToStep(visibleSteps[nextIdx].id);
    }
  };

  const goPrev = () => {
    const prevIdx = currentStepIndex - 1;
    if (prevIdx >= 0) {
      navigateToStep(visibleSteps[prevIdx].id);
    }
  };

  const handleSubmit = () => {
    if (!profil.nom) {
      toast.error("Nom requis", { description: "Veuillez renseigner la raison sociale" });
      setStep(1);
      return;
    }
    toast.success("Organisation créée avec succès", { description: profil.nom });
    router.push("/admin/organizations");
  };

  /* ---- Folder template selection ---- */
  const selectFolderTemplate = (tplKey: string) => {
    setSelectedTemplate(tplKey);
    if (tplKey === "entreprise") {
      setDossiers(DEFAULT_FOLDERS_ENTREPRISE.map((f) => ({ ...f, id: uid() })));
    } else {
      setDossiers(DEFAULT_FOLDERS_ENTREPRISE.slice(0, tplKey === "ong" ? 3 : 5).map((f) => ({ ...f, id: uid() })));
    }
  };

  /* ---- Automation template toggle ---- */
  const toggleAutomationTemplate = (template: AutomationRule) => {
    const exists = automationRules.find((r) => r.nom === template.nom);
    if (exists) {
      setAutomationRules((prev) => prev.filter((r) => r.nom !== template.nom));
    } else {
      setAutomationRules((prev) => [...prev, { ...template, id: uid(), actif: true }]);
    }
  };

  /* ================= RENDER ================= */

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[960px] mx-auto">
      {/* Draft Banner */}
      {draftId && (
        <motion.div variants={fadeUp} className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-amber-500/8 border border-amber-500/15">
          <div className="flex items-center gap-2">
            <Save className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-xs font-medium text-amber-300">Brouillon</span>
            {lastSaved && (
              <span className="text-[10px] text-amber-400/60 flex items-center gap-1">
                <Clock className="h-3 w-3" /> Sauvegardé {formatTimeAgo(lastSaved)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-[10px] h-6 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10" onClick={() => saveDraft()}>
              <Save className="h-3 w-3 mr-1" /> Sauvegarder
            </Button>
            <Button variant="ghost" size="sm" className="text-[10px] h-6 text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={deleteDraft}>
              <Trash2 className="h-3 w-3 mr-1" /> Supprimer
            </Button>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Plus className="h-6 w-6 text-blue-400" />
          Nouvelle Organisation
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configuration complète en {visibleSteps.length} étapes
        </p>
      </motion.div>

      {/* Stepper — navigation libre */}
      <motion.div variants={fadeUp} className="flex items-center justify-between overflow-x-auto pb-1">
        {visibleSteps.map((s, i) => {
          const isActive = step === s.id;
          const isValid = isStepValid(s.id);
          const isVisited = visitedSteps.has(s.id);
          return (
            <React.Fragment key={s.id}>
              <button
                onClick={() => navigateToStep(s.id)}
                className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap cursor-pointer ${isActive
                  ? "bg-blue-500/15 text-blue-400"
                  : isVisited && isValid
                    ? "text-emerald-400 hover:bg-emerald-500/10"
                    : isVisited && !isValid
                      ? "text-amber-400 hover:bg-amber-500/10"
                      : "text-muted-foreground hover:bg-white/5"
                  }`}
              >
                {isVisited && !isActive && isValid ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : isVisited && !isActive && !isValid ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : (
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${isActive ? "bg-blue-500 text-white" : "bg-white/5 text-muted-foreground"
                    }`}>
                    {i + 1}
                  </div>
                )}
                <span className="hidden md:inline">{s.label}</span>
              </button>
              {i < visibleSteps.length - 1 && (
                <div className={`flex-1 h-px mx-1 min-w-[12px] ${isVisited && isValid ? "bg-emerald-500/30" : isVisited ? "bg-amber-500/20" : "bg-white/5"
                  }`} />
              )}
            </React.Fragment>
          );
        })}
      </motion.div>

      {/* Step Content */}
      <motion.div variants={fadeUp} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">

        {/* ===== STEP 1: PROFIL ===== */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold flex items-center gap-2 mb-4">
              <Building2 className="h-4 w-4 text-blue-400" />
              Profil de l&apos;organisation
            </h2>

            {/* Logo Upload */}
            <div className="flex items-start gap-6 mb-2">
              <div className="flex flex-col items-center gap-2">
                <label className="text-xs font-medium text-muted-foreground mb-1">Logo</label>
                <div
                  className={`relative h-24 w-24 rounded-2xl border-2 border-dashed transition-all cursor-pointer group ${profil.logo ? "border-blue-500/30 bg-blue-500/5" : "border-white/10 hover:border-blue-500/20 hover:bg-white/[0.02]"
                    }`}
                  onClick={() => document.getElementById("logo-upload")?.click()}
                  onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("border-blue-500/40", "bg-blue-500/10"); }}
                  onDragLeave={(e) => { e.currentTarget.classList.remove("border-blue-500/40", "bg-blue-500/10"); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove("border-blue-500/40", "bg-blue-500/10");
                    const file = e.dataTransfer.files?.[0];
                    if (file && file.type.startsWith("image/")) {
                      if (file.size > 2 * 1024 * 1024) { toast.error("Fichier trop volumineux", { description: "Le logo ne doit pas dépasser 2 Mo" }); return; }
                      const reader = new FileReader();
                      reader.onload = (ev) => setProfil((p) => ({ ...p, logo: ev.target?.result as string }));
                      reader.readAsDataURL(file);
                    }
                  }}
                >
                  {profil.logo ? (
                    <>
                      <img src={profil.logo} alt="Logo" className="h-full w-full rounded-2xl object-cover" />
                      <div className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Edit3 className="h-4 w-4 text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="h-full w-full flex flex-col items-center justify-center gap-1.5">
                      <Upload className="h-5 w-5 text-muted-foreground group-hover:text-blue-400 transition-colors" />
                      <span className="text-[9px] text-muted-foreground group-hover:text-blue-400 transition-colors">Importer</span>
                    </div>
                  )}
                </div>
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 2 * 1024 * 1024) { toast.error("Fichier trop volumineux", { description: "Le logo ne doit pas dépasser 2 Mo" }); return; }
                      const reader = new FileReader();
                      reader.onload = (ev) => setProfil((p) => ({ ...p, logo: ev.target?.result as string }));
                      reader.readAsDataURL(file);
                    }
                    e.target.value = "";
                  }}
                />
                {profil.logo && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setProfil((p) => ({ ...p, logo: "" })); }}
                    className="text-[10px] text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" /> Retirer
                  </button>
                )}
              </div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Raison sociale *</label>
                  <Input value={profil.nom} onChange={(e) => setProfil((p) => ({ ...p, nom: e.target.value }))} placeholder="Ex: SEEG" className="h-9 text-xs bg-white/5 border-white/10" />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Secteur d&apos;activité</label>
                  <Input value={profil.secteur} onChange={(e) => setProfil((p) => ({ ...p, secteur: e.target.value }))} placeholder="Ex: Énergie & Eau" className="h-9 text-xs bg-white/5 border-white/10" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Type d&apos;organisation</label>
                <div className="flex flex-wrap gap-2">
                  {["Entreprise", "Gouvernement", "Établissement public", "ONG"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setProfil((p) => ({ ...p, type: t }))}
                      className={`px-3 py-1.5 rounded-md text-[10px] font-medium border transition-all ${profil.type === t ? "bg-blue-500/15 text-blue-400 border-blue-500/30" : "border-white/10 text-muted-foreground hover:bg-white/5"
                        }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block text-muted-foreground">RCCM</label>
                <Input value={profil.rccm} onChange={(e) => setProfil((p) => ({ ...p, rccm: e.target.value }))} placeholder="GA-LBV-2003-B-44521" className="h-9 text-xs bg-white/5 border-white/10" />
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block text-muted-foreground">NIF</label>
                <Input value={profil.nif} onChange={(e) => setProfil((p) => ({ ...p, nif: e.target.value }))} placeholder="20031234567A" className="h-9 text-xs bg-white/5 border-white/10" />
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Contact principal</label>
                <Input value={profil.contact} onChange={(e) => setProfil((p) => ({ ...p, contact: e.target.value }))} placeholder="M. / Mme Nom" className="h-9 text-xs bg-white/5 border-white/10" />
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Email</label>
                <Input value={profil.email} onChange={(e) => setProfil((p) => ({ ...p, email: e.target.value }))} placeholder="contact@organisation.ga" className="h-9 text-xs bg-white/5 border-white/10" />
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Téléphone</label>
                <Input value={profil.telephone} onChange={(e) => setProfil((p) => ({ ...p, telephone: e.target.value }))} placeholder="+241 01 XX XX XX" className="h-9 text-xs bg-white/5 border-white/10" />
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Adresse</label>
                <Input value={profil.adresse} onChange={(e) => setProfil((p) => ({ ...p, adresse: e.target.value }))} placeholder="Boulevard Léon Mba, Centre-ville" className="h-9 text-xs bg-white/5 border-white/10" />
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Ville</label>
                <Input value={profil.ville} onChange={(e) => setProfil((p) => ({ ...p, ville: e.target.value }))} placeholder="Libreville" className="h-9 text-xs bg-white/5 border-white/10" />
              </div>
            </div>
          </div>
        )}

        {/* ===== STEP 2: MODULES ===== */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold flex items-center gap-2 mb-4">
              <Package className="h-4 w-4 text-blue-400" />
              Modules à activer
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {([
                {
                  id: "idocument" as const, label: "iDocument", desc: "Gestion documentaire, dossiers, templates, partage", icon: FileText, color: "blue",
                  features: ["Création et édition de documents", "Classification automatique", "Modèles personnalisables", "Partage sécurisé"]
                },
                {
                  id: "iarchive" as const, label: "iArchive", desc: "Archivage légal, coffre-fort, certificats, rétention OHADA", icon: Archive, color: "amber",
                  features: ["Rétention OHADA", "Coffre-fort numérique", "Certificats d'intégrité", "Cycle de vie complet"]
                },
                {
                  id: "isignature" as const, label: "iSignature", desc: "Signature électronique, multi-signataires, audit trail", icon: PenTool, color: "violet",
                  features: ["Signature électronique avancée", "Chaînes de validation", "Horodatage certifié", "Délégation de pouvoir"]
                },
                {
                  id: "iasted" as const, label: "iAsted", desc: "Assistant IA 24/7 — OCR, recherche sémantique, résumés automatiques", icon: Bot, color: "amber",
                  badge: "Beta",
                  features: ["OCR & extraction intelligente", "Recherche sémantique", "Résumés automatiques", "Classification IA"]
                },
                {
                  id: "ipublic" as const, label: "Page publique", desc: "Personnalisation du portail public de l'organisation", icon: Globe, color: "cyan",
                  features: ["Page vitrine personnalisable", "Sous-domaine dédié", "Branding & thème", "Annuaire public/privé"]
                },
                {
                  id: "ieditor" as const, label: "Éditeur avancé", desc: "Éditeur de documents collaboratif en temps réel", icon: Edit3, color: "rose",
                  features: ["Co-édition multi-curseurs", "Templates professionnels", "Export PDF / Word", "Commentaires intégrés"]
                },
                {
                  id: "ichat" as const, label: "iChat", desc: "Messagerie interne et communication d'équipe", icon: MessageSquare, color: "indigo",
                  features: ["Chat d'équipe en temps réel", "Canaux par département", "Partage de fichiers", "Appels audio/vidéo"]
                },
                {
                  id: "ianalytics" as const, label: "iAnalytics", desc: "Tableaux de bord et reporting avancé", icon: BarChart3, color: "emerald",
                  features: ["Dashboards personnalisables", "Rapports automatisés", "KPIs en temps réel", "Export & planification"]
                },
              ] as const).map((mod) => {
                const Icon = mod.icon;
                const isActive = modules[mod.id];
                const badge = 'badge' in mod ? mod.badge : null;
                return (
                  <button
                    key={mod.id}
                    onClick={() => setModules((p) => ({ ...p, [mod.id]: !p[mod.id] }))}
                    className={`bg-white/[0.02] rounded-xl p-5 border text-left transition-all ${isActive
                      ? `border-${mod.color}-500/30 bg-${mod.color}-500/5`
                      : "border-white/5 hover:border-white/10"
                      }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className={`h-10 w-10 rounded-lg bg-${mod.color}-500/15 flex items-center justify-center`}>
                        <Icon className={`h-5 w-5 text-${mod.color}-400`} />
                      </div>
                      <div className="flex items-center gap-1.5">
                        {badge && (
                          <Badge className="text-[8px] bg-amber-500/15 text-amber-400 border-amber-500/20 py-0">{badge}</Badge>
                        )}
                        {isActive ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border border-white/10" />
                        )}
                      </div>
                    </div>
                    <p className="text-sm font-semibold">{mod.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-1 mb-3">{mod.desc}</p>
                    <div className="space-y-1">
                      {mod.features.map((f) => (
                        <p key={f} className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                          <CheckCircle2 className={`h-3 w-3 ${isActive ? `text-${mod.color}-400` : "text-white/20"}`} />
                          {f}
                        </p>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ===== STEP 3: ECOSYSTEME ===== */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <Network className="h-4 w-4 text-blue-400" />
              Écosystème organisationnel
            </h2>

            {/* Section A: Sites & Implantations */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" /> Sites & Implantations
              </p>
              {sites.map((s) => {
                const stConfig = SITE_TYPE_CONFIG[s.type];
                return (
                  <div key={s.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-9 w-9 rounded-lg bg-${stConfig.color}-500/15 flex items-center justify-center`}>
                        <Building2 className={`h-4 w-4 text-${stConfig.color}-400`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-semibold">{s.nom}</p>
                          {s.estSiege && <Star className="h-3 w-3 text-amber-400 fill-amber-400" />}
                        </div>
                        <p className="text-[10px] text-muted-foreground">{s.adresse}{s.ville ? `, ${s.ville}` : ""}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-[9px] bg-${stConfig.color}-500/10 text-${stConfig.color}-400 border-${stConfig.color}-500/20`}>
                        {stConfig.label}
                      </Badge>
                      <button onClick={() => setSites((prev) => prev.filter((x) => x.id !== s.id))} className="text-muted-foreground hover:text-red-400 transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {showSiteForm ? (
                <div className="bg-white/[0.02] border border-blue-500/20 rounded-xl p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Input value={newSite.nom} onChange={(e) => setNewSite((p) => ({ ...p, nom: e.target.value }))} placeholder="Nom du site" className="h-8 text-xs bg-white/5 border-white/10" />
                    <Input value={newSite.ville} onChange={(e) => setNewSite((p) => ({ ...p, ville: e.target.value }))} placeholder="Ville" className="h-8 text-xs bg-white/5 border-white/10" />
                    <Input value={newSite.adresse} onChange={(e) => setNewSite((p) => ({ ...p, adresse: e.target.value }))} placeholder="Adresse" className="h-8 text-xs bg-white/5 border-white/10" />
                    <Input value={newSite.telephone} onChange={(e) => setNewSite((p) => ({ ...p, telephone: e.target.value }))} placeholder="Téléphone" className="h-8 text-xs bg-white/5 border-white/10" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {/* Type selector */}
                      <div className="flex gap-1">
                        {(Object.entries(SITE_TYPE_CONFIG) as [SiteType, { label: string; color: string }][]).map(([key, cfg]) => (
                          <button key={key} onClick={() => setNewSite((p) => ({ ...p, type: key }))}
                            className={`px-2 py-0.5 rounded text-[9px] font-medium border transition-all ${newSite.type === key
                              ? `bg-${cfg.color}-500/15 text-${cfg.color}-400 border-${cfg.color}-500/30`
                              : "border-white/10 text-muted-foreground hover:bg-white/5"
                              }`}
                          >
                            {cfg.label}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => setNewSite((p) => ({ ...p, estSiege: !p.estSiege }))}
                        className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded border transition-all ${newSite.estSiege ? "border-amber-500/30 text-amber-400 bg-amber-500/10" : "border-white/10 text-muted-foreground"
                          }`}
                      >
                        <Star className="h-3 w-3" /> Siège
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => { setShowSiteForm(false); setNewSite({ nom: "", adresse: "", ville: "", pays: "Gabon", telephone: "", email: "", estSiege: false, type: "siege" }); }} className="text-xs h-7">
                        Annuler
                      </Button>
                      <Button size="sm" onClick={() => {
                        if (!newSite.nom) return;
                        setSites((prev) => [...prev, { ...newSite, id: uid() }]);
                        setNewSite({ nom: "", adresse: "", ville: "", pays: "Gabon", telephone: "", email: "", estSiege: false, type: "siege" });
                        setShowSiteForm(false);
                      }} className="bg-gradient-to-r from-blue-600 to-violet-500 text-white text-xs h-7">
                        Ajouter
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowSiteForm(true)} className="w-full py-2.5 rounded-xl border border-dashed border-white/10 text-xs text-muted-foreground hover:border-blue-500/30 hover:text-blue-400 transition-all flex items-center justify-center gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> Ajouter un site
                </button>
              )}
            </div>

            {/* Section B: Template selector */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Network className="h-3.5 w-3.5" /> Structure organisationnelle
              </p>
              <div className="flex gap-2">
                {([
                  { key: "entreprise", label: "🏢 Entreprise", recommended: "Entreprise" },
                  { key: "gouvernement", label: "🏛 Administration", recommended: "Gouvernement" },
                  { key: "ong", label: "🌍 ONG", recommended: "ONG" },
                ] as const).map((tpl) => {
                  const isRecommended = profil.type === tpl.recommended || (profil.type === "Établissement public" && tpl.key === "gouvernement");
                  return (
                    <button key={tpl.key} onClick={() => applyTemplate(tpl.key)}
                      className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-medium transition-all ${isRecommended
                        ? "border-blue-500/30 bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20"
                        : "border-white/10 text-muted-foreground hover:border-white/20 hover:bg-white/[0.03]"
                        }`}
                    >
                      {tpl.label}
                      {isRecommended && <span className="ml-1 text-[9px] opacity-70">• Recommandé</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section C: Recursive Org Tree */}
            {orgUnits.length > 0 && (
              <div className="space-y-1 bg-white/[0.02] border border-white/5 rounded-xl p-4">
                {orgUnits.filter((u) => u.parentId === null).sort((a, b) => a.ordre - b.ordre).map((root) => (
                  <OrgTreeNodeRender key={root.id} unitId={root.id} depth={0} />
                ))}

                {/* Add root node */}
                {showAddUnitForm === "root" ? (
                  <div className="mt-2 bg-white/[0.02] border border-blue-500/20 rounded-lg p-3 space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                      <Input value={newUnit.nom} onChange={(e) => setNewUnit((p) => ({ ...p, nom: e.target.value }))} placeholder="Nom de l'unité" className="h-7 text-xs bg-white/5 border-white/10" />
                      <select value={newUnit.type} onChange={(e) => setNewUnit((p) => ({ ...p, type: e.target.value as OrgUnitType }))} className="h-7 text-xs bg-white/5 border border-white/10 rounded-md px-2 text-white">
                        {(Object.keys(ORG_UNIT_TYPE_CONFIG) as OrgUnitType[]).map((t) => (
                          <option key={t} value={t}>{ORG_UNIT_TYPE_CONFIG[t].label}</option>
                        ))}
                      </select>
                      <select value={newUnit.siteId} onChange={(e) => setNewUnit((p) => ({ ...p, siteId: e.target.value }))} className="h-7 text-xs bg-white/5 border border-white/10 rounded-md px-2 text-white">
                        {sites.map((s) => (
                          <option key={s.id} value={s.id}>{s.nom}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setShowAddUnitForm(null)} className="text-[10px] h-6">Annuler</Button>
                      <Button size="sm" onClick={() => {
                        if (!newUnit.nom) return;
                        const id = uid();
                        setOrgUnits((prev) => [...prev, { ...newUnit, id, parentId: null }]);
                        setExpandedNodes((prev) => { const n = new Set(Array.from(prev)); n.add(id); return n; });
                        setShowAddUnitForm(null);
                      }} className="bg-gradient-to-r from-blue-600 to-violet-500 text-white text-[10px] h-6">Ajouter</Button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => {
                    setShowAddUnitForm("root");
                    setNewUnit({ nom: "", type: "direction_generale", parentId: null, siteId: sites[0]?.id || "", responsable: "", couleur: "blue", description: "", ordre: orgUnits.length });
                  }} className="w-full mt-2 py-2 rounded-lg border border-dashed border-white/10 text-[10px] text-muted-foreground hover:border-blue-500/30 hover:text-blue-400 transition-all flex items-center justify-center gap-1.5">
                    <Plus className="h-3 w-3" /> Ajouter un nœud racine
                  </button>
                )}
              </div>
            )}

            {/* Empty state — show add root when no orgUnits */}
            {orgUnits.length === 0 && sites.length > 0 && (
              <div className="text-center py-6">
                <p className="text-xs text-muted-foreground mb-3">Sélectionnez un template ci-dessus ou créez votre structure manuellement</p>
                <button onClick={() => {
                  setShowAddUnitForm("root");
                  setNewUnit({ nom: "", type: "direction_generale", parentId: null, siteId: sites[0]?.id || "", responsable: "", couleur: "blue", description: "", ordre: 0 });
                }} className="px-4 py-2 rounded-lg border border-dashed border-white/10 text-xs text-muted-foreground hover:border-blue-500/30 hover:text-blue-400 transition-all inline-flex items-center gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> Créer manuellement
                </button>
              </div>
            )}

            {/* Section D: Summary */}
            {(sites.length > 0 || orgUnits.length > 0) && (
              <div className="bg-white/[0.02] border border-white/5 rounded-lg px-4 py-2.5 flex items-center gap-4">
                <span className="text-[10px] text-muted-foreground">📊 Résumé :</span>
                <Badge className="text-[9px] bg-blue-500/10 text-blue-400 border-blue-500/20">{sites.length} site{sites.length > 1 ? "s" : ""}</Badge>
                <Badge className="text-[9px] bg-violet-500/10 text-violet-400 border-violet-500/20">{orgUnits.length} unité{orgUnits.length > 1 ? "s" : ""}</Badge>
                {orgUnits.length > 0 && <Badge className="text-[9px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20">{getMaxDepth()} niveau{getMaxDepth() > 1 ? "x" : ""}</Badge>}
              </div>
            )}
          </div>
        )}

        {/* ===== STEP 4: PERSONNEL ===== */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-blue-400" />
              Personnel clé
            </h2>
            <p className="text-[10px] text-muted-foreground mb-3">Au moins un membre doit avoir le rôle Admin pour administrer l&apos;organisation.</p>

            {/* Personnel table */}
            {personnel.length > 0 && (
              <div className="border border-white/5 rounded-xl overflow-hidden">
                <div className="grid grid-cols-[1fr_1fr_0.8fr_0.8fr_0.7fr_40px] gap-2 px-4 py-2 bg-white/[0.03] text-[10px] font-medium text-muted-foreground">
                  <span>Nom</span><span>Email</span><span>Poste</span><span>Unité org.</span><span>Rôle</span><span />
                </div>
                {personnel.map((m) => (
                  <div key={m.id} className="grid grid-cols-[1fr_1fr_0.8fr_0.8fr_0.7fr_40px] gap-2 px-4 py-2.5 border-t border-white/5 items-center">
                    <span className="text-xs font-medium truncate">{m.nom}</span>
                    <span className="text-[10px] text-muted-foreground truncate">{m.email}</span>
                    <span className="text-[10px] text-muted-foreground truncate">{m.poste}</span>
                    <span className="text-[10px] text-muted-foreground truncate">
                      {orgUnits.find((u) => u.id === m.orgUnitId)?.nom || "—"}
                    </span>
                    <Badge className={`text-[9px] bg-${ROLE_CONFIG[m.role].color}-500/15 text-${ROLE_CONFIG[m.role].color}-400 border-${ROLE_CONFIG[m.role].color}-500/20`}>
                      {ROLE_CONFIG[m.role].label}
                    </Badge>
                    <button onClick={() => setPersonnel((prev) => prev.filter((x) => x.id !== m.id))} className="text-muted-foreground hover:text-red-400 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add member form */}
            {showPersonnelForm ? (
              <div className="bg-white/[0.02] border border-blue-500/20 rounded-xl p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Input value={newMember.nom} onChange={(e) => setNewMember((p) => ({ ...p, nom: e.target.value }))} placeholder="Nom complet" className="h-8 text-xs bg-white/5 border-white/10" />
                  <Input value={newMember.email} onChange={(e) => setNewMember((p) => ({ ...p, email: e.target.value }))} placeholder="email@organisation.ga" className="h-8 text-xs bg-white/5 border-white/10" />
                  <Input value={newMember.poste} onChange={(e) => setNewMember((p) => ({ ...p, poste: e.target.value }))} placeholder="Poste / Titre" className="h-8 text-xs bg-white/5 border-white/10" />
                  <select
                    value={newMember.orgUnitId}
                    onChange={(e) => setNewMember((p) => ({ ...p, orgUnitId: e.target.value }))}
                    className="h-8 text-xs bg-white/5 border border-white/10 rounded-md px-2 text-white"
                  >
                    <option value="">Unité org...</option>
                    {getOrgUnitOptions().map((opt) => (
                      <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-muted-foreground mr-1">Rôle:</span>
                    {(Object.keys(ROLE_CONFIG) as Array<keyof typeof ROLE_CONFIG>).map((r) => (
                      <button key={r} onClick={() => setNewMember((p) => ({ ...p, role: r as PersonnelMember["role"] }))}
                        className={`px-2 py-0.5 rounded text-[9px] font-medium border transition-all ${newMember.role === r
                          ? `bg-${ROLE_CONFIG[r].color}-500/15 text-${ROLE_CONFIG[r].color}-400 border-${ROLE_CONFIG[r].color}-500/30`
                          : "border-white/10 text-muted-foreground hover:bg-white/5"
                          }`}
                      >
                        {ROLE_CONFIG[r].label}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => { setShowPersonnelForm(false); setNewMember({ nom: "", email: "", poste: "", orgUnitId: "", role: "org_member" }); }} className="text-xs h-7">
                      Annuler
                    </Button>
                    <Button size="sm" onClick={() => {
                      if (!newMember.nom || !newMember.email) return;
                      setPersonnel((prev) => [...prev, { ...newMember, id: uid() }]);
                      setNewMember({ nom: "", email: "", poste: "", orgUnitId: "", role: "org_member" });
                      setShowPersonnelForm(false);
                    }} className="bg-gradient-to-r from-blue-600 to-violet-500 text-white text-xs h-7">
                      Ajouter
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowPersonnelForm(true)} className="w-full py-2.5 rounded-xl border border-dashed border-white/10 text-xs text-muted-foreground hover:border-blue-500/30 hover:text-blue-400 transition-all flex items-center justify-center gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Inviter un membre
              </button>
            )}

            {!personnel.some((p) => p.role === "org_admin") && personnel.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-[10px] text-red-400">
                Au moins un membre doit avoir le rôle Admin.
              </div>
            )}
          </div>
        )}

        {/* ===== STEP 5: DOSSIERS ===== */}
        {step === 5 && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold flex items-center gap-2 mb-2">
              <FolderTree className="h-4 w-4 text-blue-400" />
              Structure de dossiers
            </h2>

            {/* Template selection */}
            {!selectedTemplate ? (
              <div className="space-y-3">
                <p className="text-[10px] text-muted-foreground">Sélectionnez un modèle adapté à votre type d&apos;organisation</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(FOLDER_TEMPLATES).map(([key, tpl]) => {
                    const isRecommended = tpl.recommended === profil.type;
                    return (
                      <button key={key} onClick={() => selectFolderTemplate(key)}
                        className={`bg-white/[0.02] rounded-xl p-4 border text-left transition-all ${isRecommended ? "border-blue-500/30 bg-blue-500/5 ring-1 ring-blue-500/20" : "border-white/5 hover:border-white/10"
                          }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-semibold">{tpl.nom}</p>
                          {isRecommended && <Badge className="text-[9px] bg-blue-500/15 text-blue-400 border-blue-500/20">Recommandé</Badge>}
                        </div>
                        <p className="text-[10px] text-muted-foreground">{tpl.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-muted-foreground">
                    Modèle: <span className="text-white font-medium">{FOLDER_TEMPLATES[selectedTemplate]?.nom}</span>
                  </p>
                  <Button size="sm" variant="ghost" onClick={() => { setSelectedTemplate(null); setDossiers([]); }} className="text-[10px] h-6 text-muted-foreground">
                    Changer de modèle
                  </Button>
                </div>

                {/* Folder tree */}
                <div className="space-y-2">
                  {dossiers.map((folder) => {
                    const FolderIcon = getFolderIcon(folder.icone);
                    const moduleColors: Record<string, string> = { idocument: "blue", iarchive: "amber", isignature: "violet" };
                    const moduleLabels: Record<string, string> = { idocument: "iDocument", iarchive: "iArchive", isignature: "iSignature" };
                    const mColor = folder.moduleAssociation ? moduleColors[folder.moduleAssociation] : "zinc";
                    const mLabel = folder.moduleAssociation ? moduleLabels[folder.moduleAssociation] : "";

                    return (
                      <div key={folder.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2.5">
                            <div className={`h-8 w-8 rounded-lg bg-${folder.couleur}-500/15 flex items-center justify-center`}>
                              <FolderIcon className={`h-4 w-4 text-${folder.couleur}-400`} />
                            </div>
                            {editingFolderId === folder.id ? (
                              <Input
                                value={editingFolderName}
                                onChange={(e) => setEditingFolderName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    setDossiers((prev) => prev.map((f) => f.id === folder.id ? { ...f, nom: editingFolderName } : f));
                                    setEditingFolderId(null);
                                  }
                                }}
                                onBlur={() => {
                                  setDossiers((prev) => prev.map((f) => f.id === folder.id ? { ...f, nom: editingFolderName } : f));
                                  setEditingFolderId(null);
                                }}
                                autoFocus
                                className="h-7 text-xs bg-white/5 border-white/10 w-48"
                              />
                            ) : (
                              <p className="text-xs font-semibold">{folder.nom}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {mLabel && (
                              <Badge className={`text-[9px] bg-${mColor}-500/15 text-${mColor}-400 border-${mColor}-500/20`}>
                                {mLabel}
                              </Badge>
                            )}
                            <button onClick={() => { setEditingFolderId(folder.id); setEditingFolderName(folder.nom); }} className="text-muted-foreground hover:text-blue-400 transition-colors">
                              <Edit3 className="h-3 w-3" />
                            </button>
                            <button onClick={() => setDossiers((prev) => prev.filter((f) => f.id !== folder.id))} className="text-muted-foreground hover:text-red-400 transition-colors">
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 ml-10">
                          {folder.sousDossiers.map((sd) => (
                            <Badge key={sd} className="text-[9px] bg-white/5 text-muted-foreground border-white/10">{sd}</Badge>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button onClick={() => {
                  setDossiers((prev) => [...prev, { id: uid(), nom: "Nouveau dossier", categorie: "autre", couleur: "zinc", icone: "FolderTree", sousDossiers: [], tags: [], orgUnitIds: [] }]);
                }} className="w-full py-2.5 rounded-xl border border-dashed border-white/10 text-xs text-muted-foreground hover:border-blue-500/30 hover:text-blue-400 transition-all flex items-center justify-center gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> Ajouter un dossier
                </button>
              </div>
            )}
          </div>
        )}

        {/* ===== STEP 6: CONFIGURATION ===== */}
        {step === 6 && hasModules && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold flex items-center gap-2 mb-2">
              <Settings className="h-4 w-4 text-blue-400" />
              Configuration des modules
            </h2>

            <Tabs defaultValue={modules.idocument ? "idocument" : modules.iarchive ? "iarchive" : "isignature"}>
              <TabsList className="bg-white/5 border border-white/10">
                {modules.idocument && (
                  <TabsTrigger value="idocument" className="text-xs data-[state=active]:bg-blue-500/15 data-[state=active]:text-blue-400">
                    <FileText className="h-3.5 w-3.5 mr-1.5" /> iDocument
                  </TabsTrigger>
                )}
                {modules.iarchive && (
                  <TabsTrigger value="iarchive" className="text-xs data-[state=active]:bg-amber-500/15 data-[state=active]:text-amber-400">
                    <Archive className="h-3.5 w-3.5 mr-1.5" /> iArchive
                  </TabsTrigger>
                )}
                {modules.isignature && (
                  <TabsTrigger value="isignature" className="text-xs data-[state=active]:bg-violet-500/15 data-[state=active]:text-violet-400">
                    <PenTool className="h-3.5 w-3.5 mr-1.5" /> iSignature
                  </TabsTrigger>
                )}
              </TabsList>

              {/* 6a: iDocument Config */}
              {modules.idocument && (
                <TabsContent value="idocument" className="space-y-5 mt-4">
                  {/* General params */}
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-blue-400">Paramètres généraux</p>
                    <div className="space-y-2">
                      {[
                        { key: "versioningActif", label: "Versioning des documents", desc: "Conserver l'historique des modifications" },
                        { key: "autoClassification", label: "Classification automatique", desc: "Classer automatiquement selon les règles" },
                      ].map((param) => (
                        <div key={param.key} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5">
                          <div>
                            <p className="text-xs font-medium">{param.label}</p>
                            <p className="text-[10px] text-muted-foreground">{param.desc}</p>
                          </div>
                          <button onClick={() => setDocConfig((p) => ({ ...p, [param.key]: !p[param.key as keyof IDocumentConfig] }))}>
                            {(docConfig as unknown as Record<string, unknown>)[param.key] ? (
                              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                            ) : (
                              <div className="h-5 w-5 rounded-full border-2 border-white/10" />
                            )}
                          </button>
                        </div>
                      ))}
                      <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5">
                        <div>
                          <p className="text-xs font-medium">Champs obligatoires</p>
                          <p className="text-[10px] text-muted-foreground">Tags, unité org. requis à la création</p>
                        </div>
                        <div className="flex gap-1">
                          {["tags", "unite_org", "categorie"].map((c) => (
                            <button key={c} onClick={() => setDocConfig((p) => ({
                              ...p, champsObligatoires: p.champsObligatoires.includes(c)
                                ? p.champsObligatoires.filter((x) => x !== c)
                                : [...p.champsObligatoires, c]
                            }))}
                              className={`px-2 py-0.5 rounded text-[9px] font-medium border transition-all ${docConfig.champsObligatoires.includes(c)
                                ? "bg-blue-500/15 text-blue-400 border-blue-500/30"
                                : "border-white/10 text-muted-foreground"
                                }`}
                            >
                              {c}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tag categories */}
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-blue-400">Catégories de tags</p>
                    {docConfig.categoriesTags.map((cat) => (
                      <div key={cat.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`h-2.5 w-2.5 rounded-full bg-${cat.couleur}-500`} />
                            <p className="text-xs font-medium">{cat.nom}</p>
                          </div>
                          <button onClick={() => setDocConfig((p) => ({
                            ...p, categoriesTags: p.categoriesTags.map((c) => c.id === cat.id ? { ...c, obligatoire: !c.obligatoire } : c)
                          }))}
                            className={`px-2 py-0.5 rounded text-[9px] border transition-all ${cat.obligatoire ? "bg-amber-500/15 text-amber-400 border-amber-500/30" : "border-white/10 text-muted-foreground"
                              }`}
                          >
                            {cat.obligatoire ? "Obligatoire" : "Optionnel"}
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {cat.tags.map((t) => (
                            <Badge key={t} className={`text-[9px] bg-${cat.couleur}-500/10 text-${cat.couleur}-400 border-${cat.couleur}-500/20`}>{t}</Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Classification rules */}
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-blue-400">Règles de classement</p>
                    <div className="border border-white/5 rounded-xl overflow-hidden">
                      <div className="grid grid-cols-[1fr_1fr_80px] gap-2 px-4 py-2 bg-white/[0.03] text-[10px] font-medium text-muted-foreground">
                        <span>Condition</span><span>Action</span><span>Actif</span>
                      </div>
                      {docConfig.reglesClassement.map((rule) => (
                        <div key={rule.id} className="grid grid-cols-[1fr_1fr_80px] gap-2 px-4 py-2.5 border-t border-white/5 items-center">
                          <div>
                            <p className="text-xs font-medium">{rule.nom}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {rule.condition.type === "tag" ? "Tag" : rule.condition.type === "nom_contient" ? "Nom contient" : "Département"}: {rule.condition.valeur}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {rule.action.tagsAjoutes.map((t) => (
                              <Badge key={t} className="text-[9px] bg-blue-500/10 text-blue-400 border-blue-500/20">{t}</Badge>
                            ))}
                          </div>
                          <button onClick={() => setDocConfig((p) => ({
                            ...p, reglesClassement: p.reglesClassement.map((r) => r.id === rule.id ? { ...r, actif: !r.actif } : r)
                          }))}>
                            {rule.actif ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                            ) : (
                              <div className="h-4 w-4 rounded-full border border-white/10" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              )}

              {/* 6b: iArchive Config */}
              {modules.iarchive && (
                <TabsContent value="iarchive" className="space-y-5 mt-4">
                  {/* OHADA banner */}
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg px-4 py-2.5 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-400" />
                    <p className="text-xs font-medium text-blue-400">Configuration conforme OHADA — Durées légales d&apos;archivage intégrées</p>
                  </div>

                  {/* ── Section A: Durée d'archivage personnalisable + OHADA ── */}
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-amber-400">🗃️ Politiques de rétention par catégorie</p>
                    <div className="space-y-2">
                      {archiveConfig.retentionPolicies.map((rp) => {
                        const catColors: Record<string, string> = { fiscal: "amber", social: "blue", juridique: "emerald", client: "violet", coffre: "rose" };
                        const catIcons: Record<string, React.ElementType> = { fiscal: Landmark, social: Users2, juridique: Scale, client: Briefcase, coffre: Lock };
                        const CatIcon = catIcons[rp.categorieSlug] || Landmark;
                        const cColor = catColors[rp.categorieSlug] || "zinc";
                        const triggerLabels: Record<string, string> = { date_creation: "Date création", date_depot: "Date dépôt", date_tag: "Date tag", date_gel: "Date gel" };
                        const ohadaRef = OHADA_REFERENCES[rp.categorieSlug];
                        const isUnderOHADA = ohadaRef && rp.dureeAns < ohadaRef.dureeAns;
                        const totalAlertesArchivage = rp.alertesAvantArchivage.filter((a) => a.actif).length;
                        const totalAlertesSuppression = rp.alertesAvantSuppression.filter((a) => a.actif).length;

                        return (
                          <div key={rp.id} className={`bg-white/[0.02] border rounded-xl p-4 space-y-3 ${isUnderOHADA ? "border-orange-500/30 bg-orange-500/[0.03]" : "border-white/5"}`}>
                            {/* Header row */}
                            <div className="flex items-center gap-3">
                              <div className={`h-9 w-9 rounded-lg bg-${cColor}-500/15 flex items-center justify-center shrink-0`}>
                                <CatIcon className={`h-4 w-4 text-${cColor}-400`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="text-xs font-semibold">{rp.categorieLabel}</p>
                                  {ohadaRef && (
                                    <Badge className="text-[8px] bg-blue-500/10 text-blue-400 border-blue-500/20" title={ohadaRef.description}>
                                      OHADA: {ohadaRef.dureeAns} ans min. — {ohadaRef.article}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-0.5">{rp.description}</p>
                              </div>
                            </div>

                            {/* Warning if under OHADA */}
                            {isUnderOHADA && (
                              <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-lg px-3 py-2">
                                <AlertTriangle className="h-3.5 w-3.5 text-orange-400 shrink-0" />
                                <p className="text-[10px] text-orange-400">
                                  Durée inférieure au minimum OHADA ({ohadaRef.dureeAns} ans). Risque de non-conformité légale.
                                </p>
                              </div>
                            )}

                            {/* Config row: Durée + Trigger + Transitions */}
                            <div className="grid grid-cols-3 gap-3">
                              <div className="space-y-1">
                                <p className="text-[10px] text-muted-foreground font-medium">Durée d&apos;archivage</p>
                                <div className="flex items-center gap-1.5">
                                  <Input
                                    type="number" min={1} max={99}
                                    value={rp.dureeAns}
                                    onChange={(e) => setArchiveConfig((p) => ({
                                      ...p, retentionPolicies: p.retentionPolicies.map((r) => r.id === rp.id ? { ...r, dureeAns: Math.max(1, parseInt(e.target.value) || 1) } : r)
                                    }))}
                                    className="h-8 w-20 text-sm bg-white/5 border-white/10 text-center font-semibold"
                                  />
                                  <span className="text-xs text-muted-foreground">ans</span>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <p className="text-[10px] text-muted-foreground font-medium">Date de début du comptage</p>
                                <select
                                  value={rp.triggerDate}
                                  onChange={(e) => setArchiveConfig((p) => ({
                                    ...p, retentionPolicies: p.retentionPolicies.map((r) => r.id === rp.id ? { ...r, triggerDate: e.target.value as TriggerDateType } : r)
                                  }))}
                                  className="h-8 w-full text-xs bg-white/5 border border-white/10 rounded-md px-2 text-white"
                                >
                                  {(["date_creation", "date_depot", "date_tag", "date_gel"] as const).map((td) => (
                                    <option key={td} value={td}>{triggerLabels[td]}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="space-y-1">
                                <p className="text-[10px] text-muted-foreground font-medium">Transitions (années)</p>
                                <p className="text-[10px] text-white/60">
                                  Actif → {rp.transitions.activeToSemiActive}a · Semi → {rp.transitions.semiActiveToArchived}a · Alerte → {rp.transitions.expiringThresholdMois}m
                                </p>
                              </div>
                            </div>

                            {/* ── Section D: Alertes avant archivage (éditables) ── */}
                            <div className="bg-white/[0.015] border border-white/5 rounded-lg p-3 space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Bell className="h-3.5 w-3.5 text-amber-400" />
                                  <p className="text-[11px] font-semibold text-amber-400">Alertes avant archivage automatique</p>
                                </div>
                                <Badge className={`text-[9px] ${totalAlertesArchivage > 0 ? "bg-amber-500/15 text-amber-400 border-amber-500/25" : "bg-white/5 text-muted-foreground border-white/10"}`}>
                                  {totalAlertesArchivage} alerte{totalAlertesArchivage !== 1 ? "s" : ""}
                                </Badge>
                              </div>

                              {/* Editable alert rows */}
                              <div className="space-y-1.5">
                                {rp.alertesAvantArchivage.map((alerte) => (
                                  <div key={alerte.id} className="flex items-center gap-2 bg-white/[0.02] border border-white/5 rounded-lg px-2.5 py-1.5 group">
                                    <Clock className="h-3 w-3 text-amber-400/60 shrink-0" />
                                    <input
                                      type="number"
                                      min={1}
                                      max={99}
                                      value={alerte.delai}
                                      onChange={(e) => {
                                        const v = Math.max(1, Math.min(99, parseInt(e.target.value) || 1));
                                        setArchiveConfig((p) => ({
                                          ...p,
                                          retentionPolicies: p.retentionPolicies.map((r) =>
                                            r.id !== rp.id ? r : {
                                              ...r,
                                              alertesAvantArchivage: r.alertesAvantArchivage.map((a) =>
                                                a.id === alerte.id ? { ...a, delai: v } : a
                                              ),
                                            }
                                          ),
                                        }));
                                      }}
                                      className="w-12 bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-[11px] text-center text-white focus:border-amber-500/40 focus:outline-none"
                                    />
                                    <select
                                      value={alerte.unite}
                                      onChange={(e) => {
                                        setArchiveConfig((p) => ({
                                          ...p,
                                          retentionPolicies: p.retentionPolicies.map((r) =>
                                            r.id !== rp.id ? r : {
                                              ...r,
                                              alertesAvantArchivage: r.alertesAvantArchivage.map((a) =>
                                                a.id === alerte.id ? { ...a, unite: e.target.value as AlerteUnite } : a
                                              ),
                                            }
                                          ),
                                        }));
                                      }}
                                      className="bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-[11px] text-white/80 focus:border-amber-500/40 focus:outline-none cursor-pointer"
                                    >
                                      {UNITE_OPTIONS.map((u) => (
                                        <option key={u.value} value={u.value} className="bg-zinc-900">{u.label}</option>
                                      ))}
                                    </select>
                                    <span className="flex-1 text-[9px] text-white/30 truncate">{alerteLabel(alerte)} avant archivage</span>
                                    <button
                                      onClick={() => {
                                        setArchiveConfig((p) => ({
                                          ...p,
                                          retentionPolicies: p.retentionPolicies.map((r) =>
                                            r.id !== rp.id ? r : {
                                              ...r,
                                              alertesAvantArchivage: r.alertesAvantArchivage.filter((a) => a.id !== alerte.id),
                                            }
                                          ),
                                        }));
                                      }}
                                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                      title="Supprimer cette alerte"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>

                              {/* Quick-add presets */}
                              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                                <span className="text-[9px] text-muted-foreground mr-0.5">Ajouter :</span>
                                {ALERTE_PRESETS.map((preset) => {
                                  const alreadyExists = rp.alertesAvantArchivage.some(
                                    (a) => a.delai === preset.delai && a.unite === preset.unite
                                  );
                                  if (alreadyExists) return null;
                                  return (
                                    <button
                                      key={preset.label}
                                      onClick={() => {
                                        setArchiveConfig((p) => ({
                                          ...p,
                                          retentionPolicies: p.retentionPolicies.map((r) => {
                                            if (r.id !== rp.id) return r;
                                            return {
                                              ...r,
                                              alertesAvantArchivage: [
                                                ...r.alertesAvantArchivage,
                                                {
                                                  id: uid(),
                                                  delai: preset.delai,
                                                  unite: preset.unite,
                                                  destinataires: ["org_admin"],
                                                  message: `Archive {nom} sera archivée dans ${preset.label}`,
                                                  actif: true,
                                                },
                                              ],
                                            };
                                          }),
                                        }));
                                      }}
                                      className="px-2 py-0.5 rounded text-[9px] font-medium border border-dashed border-amber-500/20 text-amber-400/60 hover:border-amber-500/40 hover:text-amber-400 hover:bg-amber-500/5 transition-all"
                                    >
                                      + {preset.label}
                                    </button>
                                  );
                                })}
                                <button
                                  onClick={() => {
                                    setArchiveConfig((p) => ({
                                      ...p,
                                      retentionPolicies: p.retentionPolicies.map((r) => {
                                        if (r.id !== rp.id) return r;
                                        return {
                                          ...r,
                                          alertesAvantArchivage: [
                                            ...r.alertesAvantArchivage,
                                            {
                                              id: uid(),
                                              delai: 1,
                                              unite: "mois" as AlerteUnite,
                                              destinataires: ["org_admin"],
                                              message: "Archive {nom} sera archivée dans {delai}",
                                              actif: true,
                                            },
                                          ],
                                        };
                                      }),
                                    }));
                                  }}
                                  className="px-2 py-0.5 rounded text-[9px] font-medium border border-dashed border-white/15 text-white/40 hover:border-amber-500/30 hover:text-amber-400/80 hover:bg-amber-500/5 transition-all flex items-center gap-0.5"
                                >
                                  <Plus className="h-2.5 w-2.5" /> Personnalisée
                                </button>
                              </div>
                            </div>

                            {/* ── Section E: Alertes avant suppression (éditables) ── */}
                            <div className="bg-white/[0.015] border border-white/5 rounded-lg p-3 space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
                                  <p className="text-[11px] font-semibold text-red-400">Alertes avant suppression (post-archivage)</p>
                                </div>
                                <Badge className={`text-[9px] ${totalAlertesSuppression > 0 ? "bg-red-500/15 text-red-400 border-red-500/25" : "bg-white/5 text-muted-foreground border-white/10"}`}>
                                  {totalAlertesSuppression} alerte{totalAlertesSuppression !== 1 ? "s" : ""}
                                </Badge>
                              </div>

                              {/* Editable alert rows */}
                              <div className="space-y-1.5">
                                {rp.alertesAvantSuppression.map((alerte) => (
                                  <div key={alerte.id} className="flex items-center gap-2 bg-white/[0.02] border border-white/5 rounded-lg px-2.5 py-1.5 group">
                                    <Clock className="h-3 w-3 text-red-400/60 shrink-0" />
                                    <input
                                      type="number"
                                      min={1}
                                      max={99}
                                      value={alerte.delai}
                                      onChange={(e) => {
                                        const v = Math.max(1, Math.min(99, parseInt(e.target.value) || 1));
                                        setArchiveConfig((p) => ({
                                          ...p,
                                          retentionPolicies: p.retentionPolicies.map((r) =>
                                            r.id !== rp.id ? r : {
                                              ...r,
                                              alertesAvantSuppression: r.alertesAvantSuppression.map((a) =>
                                                a.id === alerte.id ? { ...a, delai: v } : a
                                              ),
                                            }
                                          ),
                                        }));
                                      }}
                                      className="w-12 bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-[11px] text-center text-white focus:border-red-500/40 focus:outline-none"
                                    />
                                    <select
                                      value={alerte.unite}
                                      onChange={(e) => {
                                        setArchiveConfig((p) => ({
                                          ...p,
                                          retentionPolicies: p.retentionPolicies.map((r) =>
                                            r.id !== rp.id ? r : {
                                              ...r,
                                              alertesAvantSuppression: r.alertesAvantSuppression.map((a) =>
                                                a.id === alerte.id ? { ...a, unite: e.target.value as AlerteUnite } : a
                                              ),
                                            }
                                          ),
                                        }));
                                      }}
                                      className="bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-[11px] text-white/80 focus:border-red-500/40 focus:outline-none cursor-pointer"
                                    >
                                      {UNITE_OPTIONS.map((u) => (
                                        <option key={u.value} value={u.value} className="bg-zinc-900">{u.label}</option>
                                      ))}
                                    </select>
                                    <span className="flex-1 text-[9px] text-white/30 truncate">{alerteLabel(alerte)} avant suppression</span>
                                    <button
                                      onClick={() => {
                                        setArchiveConfig((p) => ({
                                          ...p,
                                          retentionPolicies: p.retentionPolicies.map((r) =>
                                            r.id !== rp.id ? r : {
                                              ...r,
                                              alertesAvantSuppression: r.alertesAvantSuppression.filter((a) => a.id !== alerte.id),
                                            }
                                          ),
                                        }));
                                      }}
                                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                      title="Supprimer cette alerte"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>

                              {/* Quick-add presets */}
                              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                                <span className="text-[9px] text-muted-foreground mr-0.5">Ajouter :</span>
                                {ALERTE_SUPPRESSION_PRESETS.map((preset) => {
                                  const alreadyExists = rp.alertesAvantSuppression.some(
                                    (a) => a.delai === preset.delai && a.unite === preset.unite
                                  );
                                  if (alreadyExists) return null;
                                  return (
                                    <button
                                      key={preset.label}
                                      onClick={() => {
                                        setArchiveConfig((p) => ({
                                          ...p,
                                          retentionPolicies: p.retentionPolicies.map((r) => {
                                            if (r.id !== rp.id) return r;
                                            return {
                                              ...r,
                                              alertesAvantSuppression: [
                                                ...r.alertesAvantSuppression,
                                                {
                                                  id: uid(),
                                                  delai: preset.delai,
                                                  unite: preset.unite,
                                                  destinataires: ["org_admin"],
                                                  message: `Archive {nom} sera supprimée dans ${preset.label}`,
                                                  actif: true,
                                                },
                                              ],
                                            };
                                          }),
                                        }));
                                      }}
                                      className="px-2 py-0.5 rounded text-[9px] font-medium border border-dashed border-red-500/20 text-red-400/60 hover:border-red-500/40 hover:text-red-400 hover:bg-red-500/5 transition-all"
                                    >
                                      + {preset.label}
                                    </button>
                                  );
                                })}
                                <button
                                  onClick={() => {
                                    setArchiveConfig((p) => ({
                                      ...p,
                                      retentionPolicies: p.retentionPolicies.map((r) => {
                                        if (r.id !== rp.id) return r;
                                        return {
                                          ...r,
                                          alertesAvantSuppression: [
                                            ...r.alertesAvantSuppression,
                                            {
                                              id: uid(),
                                              delai: 1,
                                              unite: "mois" as AlerteUnite,
                                              destinataires: ["org_admin"],
                                              message: "Archive {nom} sera supprimée dans {delai}",
                                              actif: true,
                                            },
                                          ],
                                        };
                                      }),
                                    }));
                                  }}
                                  className="px-2 py-0.5 rounded text-[9px] font-medium border border-dashed border-white/15 text-white/40 hover:border-red-500/30 hover:text-red-400/80 hover:bg-red-500/5 transition-all flex items-center gap-0.5"
                                >
                                  <Plus className="h-2.5 w-2.5" /> Personnalisée
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Lifecycle pipeline */}
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-amber-400">📊 Cycle de vie des archives</p>
                    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
                      <div className="flex items-center justify-between overflow-x-auto pb-3">
                        {LIFECYCLE_NODES.map((node, i) => (
                          <React.Fragment key={node.label}>
                            <div className="flex flex-col items-center min-w-[70px]">
                              <div className={`h-10 w-10 rounded-full bg-${node.color}-500/20 border-2 border-${node.color}-500/40 flex items-center justify-center mb-1.5`}>
                                <div className={`h-3 w-3 rounded-full bg-${node.color}-500`} />
                              </div>
                              <p className={`text-[9px] font-medium text-${node.color}-400 text-center`}>{node.label}</p>
                            </div>
                            {i < LIFECYCLE_NODES.length - 1 && (
                              <ArrowRight className="h-3.5 w-3.5 text-white/20 flex-shrink-0 mx-0.5" />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t border-white/5">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {[
                            { label: "Création", desc: "Déposé, en attente de classification" },
                            { label: "Actif", desc: "En rétention active, usage fréquent" },
                            { label: "Gel juridique", desc: "Bloqué pour litige ou audit" },
                            { label: "Détruit", desc: "Détruit conformément à la politique" },
                          ].map((item) => (
                            <div key={item.label} className="text-[9px]">
                              <p className="font-medium text-white/70">{item.label}</p>
                              <p className="text-muted-foreground">{item.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Auto-archive toggle + Confirmation manuelle */}
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-amber-400">⚙️ Paramètres globaux</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5">
                        <div>
                          <p className="text-xs font-medium">Archivage automatique</p>
                          <p className="text-[10px] text-muted-foreground">Archiver automatiquement les documents selon les politiques configurées</p>
                        </div>
                        <button onClick={() => setArchiveConfig((p) => ({ ...p, autoArchiveActif: !p.autoArchiveActif }))}>
                          {archiveConfig.autoArchiveActif ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                          ) : (
                            <div className="h-5 w-5 rounded-full border-2 border-white/10" />
                          )}
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5">
                        <div>
                          <p className="text-xs font-medium">Confirmation manuelle avant suppression</p>
                          <p className="text-[10px] text-muted-foreground">Exiger une validation humaine avant la destruction définitive des archives expirées</p>
                        </div>
                        <button onClick={() => setArchiveConfig((p) => ({ ...p, confirmationManuelle: !p.confirmationManuelle }))}>
                          {archiveConfig.confirmationManuelle ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                          ) : (
                            <div className="h-5 w-5 rounded-full border-2 border-white/10" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Archive categories */}
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-amber-400">📂 Catégories d&apos;archivage</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {archiveConfig.categories.map((cat) => {
                        const CIcon = getFolderIcon(cat.icone);
                        const oRef = OHADA_REFERENCES[cat.slug];
                        return (
                          <div key={cat.slug} className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <div className={`h-8 w-8 rounded-lg bg-${cat.couleur}-500/15 flex items-center justify-center`}>
                                <CIcon className={`h-4 w-4 text-${cat.couleur}-400`} />
                              </div>
                              <div>
                                <p className="text-xs font-semibold">{cat.nom}</p>
                                <p className="text-[10px] text-muted-foreground">{cat.retentionAns} ans</p>
                              </div>
                              {cat.estFixe && <Lock className="h-3 w-3 text-rose-400 ml-auto" />}
                            </div>
                            <div className="flex flex-wrap gap-1">
                              <Badge className={`text-[9px] bg-${cat.couleur}-500/10 text-${cat.couleur}-400 border-${cat.couleur}-500/20`}>
                                {cat.confidentialite}
                              </Badge>
                              {oRef && (
                                <Badge className="text-[8px] bg-blue-500/10 text-blue-400 border-blue-500/20" title={oRef.description}>
                                  {oRef.article}
                                </Badge>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </TabsContent>
              )}

              {/* 6c: iSignature Config */}
              {modules.isignature && (
                <TabsContent value="isignature" className="space-y-5 mt-4">
                  {/* General params */}
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-violet-400">Paramètres généraux</p>
                    <div className="space-y-2">
                      {[
                        { key: "signatureAvancee", label: "Signature électronique avancée", desc: "Niveau de signature qualifié" },
                        { key: "horodatageCertifie", label: "Horodatage certifié", desc: "Preuve de date et heure de signature" },
                        { key: "contreSignatureObligatoire", label: "Contre-signature obligatoire", desc: "Validation supplémentaire requise" },
                      ].map((param) => (
                        <div key={param.key} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5">
                          <div>
                            <p className="text-xs font-medium">{param.label}</p>
                            <p className="text-[10px] text-muted-foreground">{param.desc}</p>
                          </div>
                          <button onClick={() => setSignatureConfig((p) => ({
                            ...p, parametres: { ...p.parametres, [param.key]: !p.parametres[param.key as keyof typeof p.parametres] }
                          }))}>
                            {(signatureConfig.parametres as unknown as Record<string, unknown>)[param.key] ? (
                              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                            ) : (
                              <div className="h-5 w-5 rounded-full border-2 border-white/10" />
                            )}
                          </button>
                        </div>
                      ))}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                          <p className="text-xs font-medium mb-1">Délai par défaut</p>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={signatureConfig.parametres.delaiDefautJours}
                              onChange={(e) => setSignatureConfig((p) => ({ ...p, parametres: { ...p.parametres, delaiDefautJours: parseInt(e.target.value) || 0 } }))}
                              className="h-7 w-16 text-xs bg-white/5 border-white/10 text-center"
                            />
                            <span className="text-[10px] text-muted-foreground">jours</span>
                          </div>
                        </div>
                        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                          <p className="text-xs font-medium mb-1">Relance automatique</p>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={signatureConfig.parametres.relanceAutoJours}
                              onChange={(e) => setSignatureConfig((p) => ({ ...p, parametres: { ...p.parametres, relanceAutoJours: parseInt(e.target.value) || 0 } }))}
                              className="h-7 w-16 text-xs bg-white/5 border-white/10 text-center"
                            />
                            <span className="text-[10px] text-muted-foreground">jours</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Signature chains */}
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-violet-400">Chaînes de signature</p>
                    {signatureConfig.chainesSignature.map((chain) => (
                      <div key={chain.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-xs font-semibold">{chain.nom}</p>
                            <p className="text-[10px] text-muted-foreground">{chain.description}</p>
                          </div>
                          {chain.estModele && <Badge className="text-[9px] bg-violet-500/15 text-violet-400 border-violet-500/20">Modèle</Badge>}
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto pb-1">
                          {chain.etapes.map((etape, i) => {
                            const typeColors: Record<string, string> = { visa: "amber", approbation: "blue", signature: "violet", contre_signature: "emerald" };
                            const typeLabels: Record<string, string> = { visa: "Visa", approbation: "Approbation", signature: "Signature", contre_signature: "Contre-signature" };
                            const tColor = typeColors[etape.type] || "zinc";
                            return (
                              <React.Fragment key={i}>
                                <div className={`bg-${tColor}-500/10 border border-${tColor}-500/20 rounded-lg px-3 py-2 min-w-[120px]`}>
                                  <Badge className={`text-[8px] bg-${tColor}-500/15 text-${tColor}-400 border-${tColor}-500/20 mb-1`}>
                                    {typeLabels[etape.type]}
                                  </Badge>
                                  <p className="text-[10px] text-white/80">{etape.signataire.valeur}</p>
                                  <p className="text-[9px] text-muted-foreground">{etape.signataire.mode}</p>
                                </div>
                                {i < chain.etapes.length - 1 && (
                                  <ArrowRight className="h-3.5 w-3.5 text-white/20 flex-shrink-0" />
                                )}
                              </React.Fragment>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Delegations */}
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-violet-400">Règles de délégation</p>
                    <div className="border border-white/5 rounded-xl overflow-hidden">
                      <div className="grid grid-cols-[1fr_1fr_0.8fr_0.8fr_1fr] gap-2 px-4 py-2 bg-white/[0.03] text-[10px] font-medium text-muted-foreground">
                        <span>Délégant</span><span>Délégataire</span><span>Période</span><span>Types</span><span>Motif</span>
                      </div>
                      {signatureConfig.delegations.map((d, i) => (
                        <div key={i} className="grid grid-cols-[1fr_1fr_0.8fr_0.8fr_1fr] gap-2 px-4 py-2.5 border-t border-white/5 items-center">
                          <span className="text-xs font-medium">{d.delegant}</span>
                          <span className="text-xs">{d.delegataire}</span>
                          <span className="text-[10px] text-muted-foreground">{d.dateDebut} → {d.dateFin}</span>
                          <div className="flex flex-wrap gap-1">
                            {d.types.map((t) => (
                              <Badge key={t} className="text-[9px] bg-violet-500/10 text-violet-400 border-violet-500/20">{t}</Badge>
                            ))}
                          </div>
                          <span className="text-[10px] text-muted-foreground">{d.motif}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </div>
        )}

        {/* ===== STEP 7: AUTOMATISATION ===== */}
        {step === 7 && hasModules && (
          <div className="space-y-5">
            <h2 className="text-sm font-semibold flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-blue-400" />
              Automatisation
            </h2>

            {/* Templates */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground">Modèles pré-configurés</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {AUTOMATION_TEMPLATES.filter((t) => modules[t.module]).map((template) => {
                  const isAdded = automationRules.some((r) => r.nom === template.nom);
                  const moduleColors: Record<string, string> = { idocument: "blue", iarchive: "amber", isignature: "violet" };
                  const moduleLabels: Record<string, string> = { idocument: "iDocument", iarchive: "iArchive", isignature: "iSignature" };
                  const mColor = moduleColors[template.module];
                  return (
                    <button key={template.id} onClick={() => toggleAutomationTemplate(template)}
                      className={`bg-white/[0.02] rounded-xl p-3 border text-left transition-all ${isAdded ? `border-${mColor}-500/30 bg-${mColor}-500/5` : "border-white/5 hover:border-white/10"
                        }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Badge className={`text-[8px] bg-${mColor}-500/15 text-${mColor}-400 border-${mColor}-500/20`}>
                            {moduleLabels[template.module]}
                          </Badge>
                          <p className="text-[11px] font-medium">{template.nom}</p>
                        </div>
                        {isAdded ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground">{template.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active rules */}
            {automationRules.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground">Règles activées</p>
                {(["idocument", "iarchive", "isignature"] as const).map((mod) => {
                  const modRules = automationRules.filter((r) => r.module === mod);
                  if (modRules.length === 0) return null;
                  const moduleColors: Record<string, string> = { idocument: "blue", iarchive: "amber", isignature: "violet" };
                  const moduleLabels: Record<string, string> = { idocument: "iDocument", iarchive: "iArchive", isignature: "iSignature" };
                  const moduleIcons: Record<string, React.ElementType> = { idocument: FileText, iarchive: Archive, isignature: PenTool };
                  const MIcon = moduleIcons[mod];
                  const mColor = moduleColors[mod];
                  return (
                    <div key={mod} className="space-y-2">
                      <p className={`text-xs font-medium text-${mColor}-400 flex items-center gap-1.5`}>
                        <MIcon className="h-3.5 w-3.5" /> {moduleLabels[mod]}
                      </p>
                      {modRules.map((rule) => (
                        <div key={rule.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-xs font-semibold">{rule.nom}</p>
                            <div className="flex items-center gap-2">
                              <button onClick={() => setAutomationRules((prev) => prev.map((r) => r.id === rule.id ? { ...r, actif: !r.actif } : r))}>
                                {rule.actif ? (
                                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                ) : (
                                  <div className="h-4 w-4 rounded-full border border-white/10" />
                                )}
                              </button>
                              <button onClick={() => setAutomationRules((prev) => prev.filter((r) => r.id !== rule.id))} className="text-muted-foreground hover:text-red-400 transition-colors">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {/* QUAND block */}
                            <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg px-3 py-2 flex-1">
                              <Badge className="text-[8px] bg-amber-500/15 text-amber-400 border-amber-500/20 mb-1.5">QUAND</Badge>
                              <p className="text-[10px] font-medium">{TRIGGER_LABELS[rule.declencheur.type] || rule.declencheur.type}</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {rule.declencheur.conditions.map((c, ci) => (
                                  <Badge key={ci} className="text-[8px] bg-white/5 text-muted-foreground border-white/10">
                                    {c.champ} {c.operateur} &quot;{c.valeur}&quot;
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <ArrowRight className="h-4 w-4 text-white/20 flex-shrink-0" />

                            {/* ALORS block */}
                            <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg px-3 py-2 flex-1">
                              <Badge className="text-[8px] bg-blue-500/15 text-blue-400 border-blue-500/20 mb-1.5">ALORS</Badge>
                              {rule.actions.map((a) => (
                                <div key={a.ordre} className="flex items-center gap-1.5 mb-0.5">
                                  <span className="text-[9px] font-bold text-white/30">{a.ordre}.</span>
                                  <Badge className="text-[8px] bg-white/5 text-muted-foreground border-white/10">
                                    {ACTION_LABELS[a.type] || a.type}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}

            {automationRules.length === 0 && (
              <div className="text-center py-6 text-xs text-muted-foreground">
                Activez des modèles ci-dessus ou créez des règles personnalisées
              </div>
            )}
          </div>
        )}

        {/* ===== STEP 8: DEPLOIEMENT ===== */}
        {step === maxStep && (
          <div className="space-y-5">
            <h2 className="text-sm font-semibold flex items-center gap-2 mb-2">
              <Server className="h-4 w-4 text-blue-400" />
              Déploiement
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: Hebergement */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground">Modèle d&apos;hébergement</p>
                {([
                  { id: "Local" as const, icon: Server, desc: "Serveur sur site client. Contrôle total, maintenance interne.", color: "blue" },
                  { id: "Data_Center" as const, icon: HardDrive, desc: "Hébergement en data center DIGITALIUM. Haute disponibilité.", color: "violet" },
                  { id: "Cloud" as const, icon: Cloud, desc: "Infrastructure cloud (AWS/Azure). Scalabilité maximale.", color: "emerald" },
                ]).map((h) => {
                  const Icon = h.icon;
                  const isActive = hebergement === h.id;
                  return (
                    <button key={h.id} onClick={() => setHebergement(h.id)}
                      className={`w-full bg-white/[0.02] rounded-xl p-4 border text-left transition-all ${isActive ? "border-blue-500/30 bg-blue-500/5" : "border-white/5 hover:border-white/10"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-9 w-9 rounded-lg bg-${h.color}-500/15 flex items-center justify-center`}>
                          <Icon className={`h-4 w-4 text-${h.color}-400`} />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-semibold">{h.id.replace("_", " ")}</p>
                          <p className="text-[10px] text-muted-foreground">{h.desc}</p>
                        </div>
                        {isActive ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border border-white/10" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Right: Page publique */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground">Page publique</p>

                <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5">
                  <div>
                    <p className="text-xs font-medium">Activer la page publique</p>
                    <p className="text-[10px] text-muted-foreground">Portail accessible aux visiteurs</p>
                  </div>
                  <button onClick={() => setPagePublique(!pagePublique)}>
                    {pagePublique ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-white/10" />
                    )}
                  </button>
                </div>

                {pagePublique && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Sous-domaine</label>
                      <div className="flex items-center gap-2">
                        <Input value={domaine} onChange={(e) => setDomaine(e.target.value)} placeholder="mon-organisation" className="h-9 text-xs bg-white/5 border-white/10 flex-1" />
                        <span className="text-xs text-muted-foreground">.digitalium.io</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Thème</label>
                      <div className="flex items-center gap-2">
                        {["violet", "blue", "emerald", "amber", "rose"].map((t) => (
                          <button key={t} onClick={() => setTheme(t)}
                            className={`h-7 w-7 rounded-full bg-${t}-500 transition-all ${theme === t ? "ring-2 ring-white/30 scale-110" : "opacity-50 hover:opacity-80"}`}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Annuaire</label>
                      <div className="flex gap-2">
                        {([
                          { id: "public" as const, label: "Public", icon: Globe },
                          { id: "prive" as const, label: "Privé", icon: Eye },
                        ]).map((a) => {
                          const AIcon = a.icon;
                          return (
                            <button key={a.id} onClick={() => setAnnuaire(a.id)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-medium border transition-all ${annuaire === a.id
                                ? "bg-blue-500/15 text-blue-400 border-blue-500/30"
                                : "border-white/10 text-muted-foreground hover:bg-white/5"
                                }`}
                            >
                              <AIcon className="h-3 w-3" /> {a.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </motion.div>

      {/* Navigation */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={goPrev}
          disabled={currentStepIndex === 0}
          className="text-xs gap-1.5"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Précédent
        </Button>

        <div className="flex items-center gap-1.5">
          {visibleSteps.map((s, i) => (
            <div
              key={s.id}
              className={`h-1.5 rounded-full transition-all ${s.id === step ? "w-6 bg-blue-500" : step > s.id ? "w-1.5 bg-emerald-500/50" : "w-1.5 bg-white/10"
                }`}
            />
          ))}
        </div>

        {step < maxStep ? (
          <Button
            size="sm"
            onClick={goNext}
            className="bg-gradient-to-r from-blue-600 to-violet-500 text-white hover:opacity-90 text-xs gap-1.5"
          >
            Suivant
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={handleSubmit}
            className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white hover:opacity-90 text-xs gap-1.5"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Créer l&apos;organisation
          </Button>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function NewOrganizationWizardPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-32 text-muted-foreground text-sm">Chargement…</div>}>
      <NewOrganizationWizardInner />
    </Suspense>
  );
}
