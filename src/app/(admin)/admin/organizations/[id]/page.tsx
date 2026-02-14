// ===============================================
// DIGITALIUM.IO — Business: Fiche Organisation
// 8 onglets miroir du wizard : Profil, Modules,
// Ecosysteme, Personnel, Dossiers, Configuration,
// Automatisation, Deploiement
// ===============================================

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Building,
  Building2,
  Save,
  Package,
  Server,
  UserCircle,
  Users,
  Network,
  FileText,
  Archive,
  PenTool,
  CheckCircle2,
  ToggleLeft,
  ToggleRight,
  ArrowLeft,
  ArrowRight,
  Clock,
  Settings,
  MapPin,
  Phone,
  ChevronRight,
  ChevronDown,
  Layers,
  Cloud,
  HardDrive,
  Cpu,
  MemoryStick,
  Eye,
  Palette,
  Globe,
  Star,
  Zap,
  FolderTree,
  Folder,
  FolderOpen,
  Shield,
  Lock,
  Landmark,
  Briefcase,
  Wrench,
  Tag,
  AlertTriangle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

/* ─── Animations ───────────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

/* ─── Types ────────────────────────────────────── */

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
  orgUnitNom: string;
  role: "org_admin" | "org_manager" | "org_editor" | "org_member" | "org_viewer";
  statut: "Actif" | "Inactif" | "Invité";
}

interface DefaultFolder {
  id: string;
  nom: string;
  categorie: string;
  couleur: string;
  icone: string;
  sousDossiers: string[];
  tags: string[];
  orgUnitAcces: string[];
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
  action: { dossier: string; tagsAjoutes: string[] };
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

interface RetentionPolicy {
  id: string;
  categorieSlug: string;
  categorieLabel: string;
  dureeAns: number;
  triggerDate: TriggerDateType;
  description: string;
  referenceOHADA: string;
  couleur: string;
  icone: string;
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

interface ArchiveNotification {
  delaiMois: number;
  destinataires: string[];
  message: string;
}

interface IArchiveConfig {
  retentionPolicies: RetentionPolicy[];
  triggerDateDefaut: TriggerDateType;
  autoArchiveActif: boolean;
  notifications: ArchiveNotification[];
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

interface SignatureDelegation {
  delegant: string;
  delegataire: string;
  dateDebut: string;
  dateFin: string;
  types: string[];
  motif: string;
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
  delegations: SignatureDelegation[];
}

type TriggerType =
  | "document_cree"
  | "document_tag"
  | "document_approuve"
  | "archive_depose"
  | "archive_status_change"
  | "retention_expiring"
  | "signature_completee"
  | "date_echeance";

type ActionType =
  | "envoyer_signature"
  | "archiver_document"
  | "classer_dossier"
  | "notifier_personnes"
  | "changer_statut"
  | "generer_certificat"
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
  actions: { type: ActionType; label: string; ordre: number }[];
}

interface OrganizationData {
  id: string;
  nom: string;
  secteur: string;
  type: string;
  rccm: string;
  nif: string;
  contact: string;
  email: string;
  telephone: string;
  adresse: string;
  ville: string;
  statut: "Actif" | "Config";
  plan: string;

  modules: { idocument: boolean; iarchive: boolean; isignature: boolean };

  sites: Site[];
  orgUnits: OrgUnit[];
  personnel: PersonnelMember[];
  dossiers: DefaultFolder[];

  docConfig: IDocumentConfig;
  archiveConfig: IArchiveConfig;
  signatureConfig: ISignatureConfig;
  automationRules: AutomationRule[];

  hebergement: string;
  pagePublique: boolean;
  domaine: string;
  theme: string;
  annuaire: string;
}

/* ─── Module Features ──────────────────────────── */

const MODULE_FEATURES: Record<string, { label: string; features: { name: string; enabled: boolean }[] }> = {
  idocument: {
    label: "iDocument",
    features: [
      { name: "Dossiers & Fichiers", enabled: true },
      { name: "Templates de documents", enabled: true },
      { name: "Partage & Collaboration", enabled: true },
      { name: "Archivage automatique", enabled: false },
      { name: "Import en masse", enabled: true },
      { name: "Versionnage", enabled: true },
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
      { name: "Délégation", enabled: true },
      { name: "Horodatage certifié", enabled: true },
      { name: "Audit trail complet", enabled: true },
      { name: "Signature avancée eIDAS", enabled: false },
    ],
  },
};

const MODULE_COLORS: Record<string, { text: string; bg: string; stepBg: string }> = {
  idocument: { text: "text-blue-400", bg: "bg-blue-500/15", stepBg: "bg-blue-500/15" },
  iarchive: { text: "text-amber-400", bg: "bg-amber-500/15", stepBg: "bg-amber-500/15" },
  isignature: { text: "text-violet-400", bg: "bg-violet-500/15", stepBg: "bg-violet-500/15" },
};

const DEPT_COLORS: Record<string, { bg: string; text: string; iconBg: string; dot: string }> = {
  blue: { bg: "bg-blue-500/10", text: "text-blue-400", iconBg: "bg-blue-500/15", dot: "bg-blue-400" },
  cyan: { bg: "bg-cyan-500/10", text: "text-cyan-400", iconBg: "bg-cyan-500/15", dot: "bg-cyan-400" },
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400", iconBg: "bg-emerald-500/15", dot: "bg-emerald-400" },
  amber: { bg: "bg-amber-500/10", text: "text-amber-400", iconBg: "bg-amber-500/15", dot: "bg-amber-400" },
  violet: { bg: "bg-violet-500/10", text: "text-violet-400", iconBg: "bg-violet-500/15", dot: "bg-violet-400" },
  rose: { bg: "bg-rose-500/10", text: "text-rose-400", iconBg: "bg-rose-500/15", dot: "bg-rose-400" },
};

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

const ROLE_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  org_admin: { bg: "bg-red-500/15", text: "text-red-400", label: "Administrateur" },
  org_manager: { bg: "bg-blue-500/15", text: "text-blue-400", label: "Responsable" },
  org_editor: { bg: "bg-emerald-500/15", text: "text-emerald-400", label: "Éditeur" },
  org_member: { bg: "bg-zinc-500/15", text: "text-zinc-400", label: "Membre" },
  org_viewer: { bg: "bg-gray-500/15", text: "text-gray-400", label: "Lecteur" },
};

const CATEGORY_COLORS: Record<string, { bg: string; text: string; iconBg: string }> = {
  fiscal: { bg: "bg-amber-500/10", text: "text-amber-400", iconBg: "bg-amber-500/15" },
  social: { bg: "bg-blue-500/10", text: "text-blue-400", iconBg: "bg-blue-500/15" },
  juridique: { bg: "bg-emerald-500/10", text: "text-emerald-400", iconBg: "bg-emerald-500/15" },
  client: { bg: "bg-violet-500/10", text: "text-violet-400", iconBg: "bg-violet-500/15" },
  coffre: { bg: "bg-rose-500/10", text: "text-rose-400", iconBg: "bg-rose-500/15" },
};

const FOLDER_COLORS: Record<string, { text: string; bg: string }> = {
  amber: { text: "text-amber-400", bg: "bg-amber-500/15" },
  blue: { text: "text-blue-400", bg: "bg-blue-500/15" },
  emerald: { text: "text-emerald-400", bg: "bg-emerald-500/15" },
  violet: { text: "text-violet-400", bg: "bg-violet-500/15" },
  cyan: { text: "text-cyan-400", bg: "bg-cyan-500/15" },
  rose: { text: "text-rose-400", bg: "bg-rose-500/15" },
};

const TRIGGER_DATE_LABELS: Record<TriggerDateType, string> = {
  date_creation: "Date de création",
  date_depot: "Date de dépôt",
  date_tag: "Date tag (clôture)",
  date_gel: "Date de gel",
};

/* ─── Mock Data: SEEG (Full) ───────────────────── */

const SEEG_SITES: Site[] = [
  { id: "site1", nom: "Siège Social", adresse: "Boulevard Léon Mba, Centre-ville", ville: "Libreville", pays: "Gabon", telephone: "+241 01 76 31 00", email: "direction@seeg.ga", estSiege: true, type: "siege" },
  { id: "site2", nom: "Centre Technique Oloumi", adresse: "Zone Industrielle d'Oloumi", ville: "Libreville", pays: "Gabon", telephone: "+241 01 76 31 10", email: "technique@seeg.ga", estSiege: false, type: "antenne" },
  { id: "site3", nom: "Agence Port-Gentil", adresse: "Quartier du Grand Village", ville: "Port-Gentil", pays: "Gabon", telephone: "+241 01 55 20 00", email: "portgentil@seeg.ga", estSiege: false, type: "agence" },
];

const SEEG_ORG_UNITS: OrgUnit[] = [
  { id: "ou1", nom: "Direction Générale", type: "direction_generale", parentId: null, siteId: "site1", responsable: "Pierre Nguema", couleur: "blue", description: "", ordre: 0 },
  { id: "ou2", nom: "Secrétariat Général", type: "service", parentId: "ou1", siteId: "site1", responsable: "", couleur: "cyan", description: "", ordre: 1 },
  { id: "ou3", nom: "Communication", type: "service", parentId: "ou1", siteId: "site1", responsable: "", couleur: "rose", description: "", ordre: 2 },
  { id: "ou4", nom: "Direction Technique", type: "direction", parentId: "ou1", siteId: "site2", responsable: "Éric Assoumou", couleur: "violet", description: "", ordre: 3 },
  { id: "ou5", nom: "Production Électrique", type: "service", parentId: "ou4", siteId: "site2", responsable: "", couleur: "amber", description: "", ordre: 4 },
  { id: "ou6", nom: "Distribution Eau", type: "service", parentId: "ou4", siteId: "site2", responsable: "", couleur: "emerald", description: "", ordre: 5 },
  { id: "ou7", nom: "Maintenance", type: "service", parentId: "ou4", siteId: "site2", responsable: "", couleur: "cyan", description: "", ordre: 6 },
  { id: "ou8", nom: "Direction Commerciale", type: "direction", parentId: "ou1", siteId: "site1", responsable: "Jacques Mouélé", couleur: "emerald", description: "", ordre: 7 },
  { id: "ou9", nom: "Ventes Entreprises", type: "service", parentId: "ou8", siteId: "site1", responsable: "", couleur: "violet", description: "", ordre: 8 },
  { id: "ou10", nom: "Ventes Particuliers", type: "service", parentId: "ou8", siteId: "site3", responsable: "", couleur: "amber", description: "", ordre: 9 },
  { id: "ou11", nom: "Recouvrement", type: "service", parentId: "ou8", siteId: "site1", responsable: "", couleur: "rose", description: "", ordre: 10 },
  { id: "ou12", nom: "Direction Administrative", type: "direction", parentId: "ou1", siteId: "site1", responsable: "Hélène Mboumba", couleur: "amber", description: "", ordre: 11 },
  { id: "ou13", nom: "Ressources Humaines", type: "service", parentId: "ou12", siteId: "site1", responsable: "", couleur: "blue", description: "", ordre: 12 },
  { id: "ou14", nom: "Comptabilité", type: "service", parentId: "ou12", siteId: "site1", responsable: "", couleur: "emerald", description: "", ordre: 13 },
  { id: "ou15", nom: "Logistique", type: "service", parentId: "ou12", siteId: "site1", responsable: "", couleur: "cyan", description: "", ordre: 14 },
  { id: "ou16", nom: "Juridique", type: "service", parentId: "ou12", siteId: "site1", responsable: "Rose Mintsa", couleur: "violet", description: "", ordre: 15 },
];

const SEEG_PERSONNEL: PersonnelMember[] = [
  { id: "per1", nom: "Pierre Nguema", email: "p.nguema@seeg.ga", poste: "Directeur Général", orgUnitId: "ou1", orgUnitNom: "Direction Générale", role: "org_admin", statut: "Actif" },
  { id: "per2", nom: "Éric Assoumou", email: "e.assoumou@seeg.ga", poste: "Directeur Technique", orgUnitId: "ou4", orgUnitNom: "Direction Technique", role: "org_manager", statut: "Actif" },
  { id: "per3", nom: "Hélène Mboumba", email: "h.mboumba@seeg.ga", poste: "DRH", orgUnitId: "ou12", orgUnitNom: "Direction Administrative", role: "org_manager", statut: "Actif" },
  { id: "per4", nom: "Jacques Mouélé", email: "j.mouele@seeg.ga", poste: "Directeur Commercial", orgUnitId: "ou8", orgUnitNom: "Direction Commerciale", role: "org_manager", statut: "Actif" },
  { id: "per5", nom: "Rose Mintsa", email: "r.mintsa@seeg.ga", poste: "Juriste", orgUnitId: "ou16", orgUnitNom: "Juridique", role: "org_editor", statut: "Actif" },
];

const SEEG_DOSSIERS: DefaultFolder[] = [
  { id: "fld1", nom: "Documents Fiscaux", categorie: "fiscal", couleur: "amber", icone: "Landmark", sousDossiers: ["Déclarations TVA", "Bilans Annuels", "Liasses Fiscales"], tags: ["fiscal", "ohada"], orgUnitAcces: ["Direction Administrative"], moduleAssociation: "iarchive" },
  { id: "fld2", nom: "Documents RH", categorie: "social", couleur: "blue", icone: "Users", sousDossiers: ["Contrats de Travail", "Bulletins de Paie", "Congés"], tags: ["rh", "social"], orgUnitAcces: ["Direction Administrative"], moduleAssociation: "idocument" },
  { id: "fld3", nom: "Contrats & Juridique", categorie: "juridique", couleur: "emerald", icone: "Shield", sousDossiers: ["Contrats Fournisseurs", "PV Assemblée", "Statuts"], tags: ["juridique", "contrat"], orgUnitAcces: ["Direction Générale", "Direction Administrative"], moduleAssociation: "isignature" },
  { id: "fld4", nom: "Documents Commerciaux", categorie: "client", couleur: "violet", icone: "Briefcase", sousDossiers: ["Factures Clients", "Devis", "Bons de Commande"], tags: ["commercial", "client"], orgUnitAcces: ["Direction Commerciale"], moduleAssociation: "idocument" },
  { id: "fld5", nom: "Documents Techniques", categorie: "technique", couleur: "cyan", icone: "Wrench", sousDossiers: ["Plans", "Rapports Maintenance", "Normes"], tags: ["technique", "maintenance"], orgUnitAcces: ["Direction Technique"], moduleAssociation: "idocument" },
  { id: "fld6", nom: "Coffre-Fort Numérique", categorie: "coffre", couleur: "rose", icone: "Lock", sousDossiers: ["Titres de Propriété", "Actes Notariés", "Brevets"], tags: ["coffre-fort", "confidentiel"], orgUnitAcces: ["Direction Générale"], moduleAssociation: "iarchive" },
];

const SEEG_DOC_CONFIG: IDocumentConfig = {
  versioningActif: true,
  maxVersions: 10,
  autoClassification: true,
  champsObligatoires: ["tags", "unite_org"],
  categoriesTags: [
    { id: "tc1", nom: "Nature du document", tags: ["facture", "contrat", "rapport", "pv", "courrier"], obligatoire: true, couleur: "blue" },
    { id: "tc2", nom: "Confidentialité", tags: ["public", "interne", "confidentiel", "secret"], obligatoire: true, couleur: "amber" },
    { id: "tc3", nom: "Priorité", tags: ["urgent", "normal", "archive"], obligatoire: false, couleur: "emerald" },
  ],
  reglesClassement: [
    { id: "rc1", nom: "Factures → Dossier Fiscal", condition: { type: "tag", valeur: "facture" }, action: { dossier: "Documents Fiscaux", tagsAjoutes: ["fiscal"] }, actif: true },
    { id: "rc2", nom: "Contrats → Juridique", condition: { type: "tag", valeur: "contrat" }, action: { dossier: "Contrats & Juridique", tagsAjoutes: ["juridique"] }, actif: true },
    { id: "rc3", nom: "Paie → RH", condition: { type: "nom_contient", valeur: "bulletin" }, action: { dossier: "Documents RH", tagsAjoutes: ["social", "paie"] }, actif: true },
    { id: "rc4", nom: "Maintenance → Technique", condition: { type: "departement", valeur: "Direction Technique" }, action: { dossier: "Documents Techniques", tagsAjoutes: ["technique"] }, actif: false },
  ],
};

const SEEG_ARCHIVE_CONFIG: IArchiveConfig = {
  retentionPolicies: [
    { id: "rp1", categorieSlug: "fiscal", categorieLabel: "Documents Fiscaux", dureeAns: 10, triggerDate: "date_tag", description: "10 ans à compter de la clôture exercice fiscal", referenceOHADA: "Acte Uniforme Comptable Art. 24", couleur: "amber", icone: "Landmark" },
    { id: "rp2", categorieSlug: "social", categorieLabel: "Documents Sociaux", dureeAns: 5, triggerDate: "date_creation", description: "5 ans à compter de la création du document", referenceOHADA: "Code du Travail Gabonais Art. 178", couleur: "blue", icone: "Users" },
    { id: "rp3", categorieSlug: "juridique", categorieLabel: "Documents Juridiques", dureeAns: 30, triggerDate: "date_depot", description: "30 ans à compter du dépôt officiel", referenceOHADA: "Acte Uniforme Droit Sociétés Art. 36", couleur: "emerald", icone: "Shield" },
    { id: "rp4", categorieSlug: "client", categorieLabel: "Documents Client", dureeAns: 5, triggerDate: "date_creation", description: "5 ans à compter de la création", referenceOHADA: "—", couleur: "violet", icone: "Briefcase" },
    { id: "rp5", categorieSlug: "coffre", categorieLabel: "Coffre-Fort", dureeAns: 99, triggerDate: "date_gel", description: "Conservation perpétuelle", referenceOHADA: "Conservation perpétuelle", couleur: "rose", icone: "Lock" },
  ],
  triggerDateDefaut: "date_creation",
  autoArchiveActif: true,
  notifications: [
    { delaiMois: 6, destinataires: ["org_admin", "org_manager"], message: "Document {nom} arrive à expiration dans 6 mois" },
    { delaiMois: 3, destinataires: ["org_admin"], message: "URGENT : {nom} expire dans 3 mois — action requise" },
    { delaiMois: 1, destinataires: ["org_admin", "org_manager", "org_editor"], message: "CRITIQUE : {nom} expire dans 1 mois" },
  ],
  categories: [
    { slug: "fiscal", nom: "Fiscal", couleur: "amber", icone: "Landmark", retentionAns: 10, confidentialite: "Confidentiel", estFixe: true },
    { slug: "social", nom: "Social", couleur: "blue", icone: "Users", retentionAns: 5, confidentialite: "Interne", estFixe: true },
    { slug: "juridique", nom: "Juridique", couleur: "emerald", icone: "Shield", retentionAns: 30, confidentialite: "Confidentiel", estFixe: true },
    { slug: "client", nom: "Client", couleur: "violet", icone: "Briefcase", retentionAns: 5, confidentialite: "Interne", estFixe: false },
    { slug: "coffre", nom: "Coffre-Fort", couleur: "rose", icone: "Lock", retentionAns: 99, confidentialite: "Secret", estFixe: true },
  ],
};

const SEEG_SIGNATURE_CONFIG: ISignatureConfig = {
  parametres: {
    signatureAvancee: true,
    horodatageCertifie: true,
    delaiDefautJours: 7,
    relanceAutoJours: 3,
    contreSignatureObligatoire: true,
  },
  chainesSignature: [
    {
      id: "ch1",
      nom: "Validation Contrat Client",
      description: "Processus standard pour les contrats clients",
      etapes: [
        { ordre: 1, type: "visa", signataire: { mode: "role", valeur: "DRH" }, obligatoire: true },
        { ordre: 2, type: "approbation", signataire: { mode: "departement", valeur: "Direction Commerciale" }, obligatoire: true },
        { ordre: 3, type: "signature", signataire: { mode: "personne", valeur: "Jacques Mouélé" }, obligatoire: true },
        { ordre: 4, type: "contre_signature", signataire: { mode: "personne", valeur: "Pierre Nguema" }, obligatoire: true },
      ],
      estModele: true,
    },
    {
      id: "ch2",
      nom: "Approbation Document Interne",
      description: "Validation documents internes par la direction",
      etapes: [
        { ordre: 1, type: "visa", signataire: { mode: "role", valeur: "Chef de service" }, obligatoire: true },
        { ordre: 2, type: "signature", signataire: { mode: "role", valeur: "Directeur" }, obligatoire: true },
      ],
      estModele: true,
    },
    {
      id: "ch3",
      nom: "PV Assemblée Générale",
      description: "Signature des PV par les membres du conseil",
      etapes: [
        { ordre: 1, type: "visa", signataire: { mode: "role", valeur: "Secrétaire Général" }, obligatoire: true },
        { ordre: 2, type: "signature", signataire: { mode: "personne", valeur: "Pierre Nguema" }, obligatoire: true },
        { ordre: 3, type: "contre_signature", signataire: { mode: "role", valeur: "Président du CA" }, obligatoire: false },
      ],
      estModele: false,
    },
  ],
  delegations: [
    { delegant: "Pierre Nguema", delegataire: "Éric Assoumou", dateDebut: "2026-01-15", dateFin: "2026-02-15", types: ["contrat", "pv"], motif: "Congés annuels DG" },
    { delegant: "Jacques Mouélé", delegataire: "Rose Mintsa", dateDebut: "2026-02-01", dateFin: "2026-02-28", types: ["devis", "bon_commande"], motif: "Mission extérieure" },
  ],
};

const SEEG_AUTOMATION: AutomationRule[] = [
  {
    id: "auto1",
    nom: "Auto-archivage documents approuvés",
    description: "Archive automatiquement les documents validés dans iArchive",
    module: "idocument",
    actif: true,
    declencheur: {
      type: "document_approuve",
      conditions: [
        { champ: "statut", operateur: "egal", valeur: "approuvé" },
        { champ: "categorie", operateur: "contient", valeur: "fiscal" },
      ],
    },
    actions: [
      { type: "archiver_document", label: "Archiver dans iArchive", ordre: 1 },
      { type: "changer_statut", label: "Passer en statut «archivé»", ordre: 2 },
      { type: "generer_certificat", label: "Générer certificat d'archivage", ordre: 3 },
    ],
  },
  {
    id: "auto2",
    nom: "Signature obligatoire contrats",
    description: "Envoie automatiquement les contrats en signature",
    module: "isignature",
    actif: true,
    declencheur: {
      type: "document_tag",
      conditions: [
        { champ: "tag", operateur: "contient", valeur: "contrat" },
        { champ: "statut", operateur: "egal", valeur: "validé" },
      ],
    },
    actions: [
      { type: "envoyer_signature", label: "Envoyer en circuit de signature", ordre: 1 },
      { type: "notifier_personnes", label: "Notifier les signataires", ordre: 2 },
    ],
  },
  {
    id: "auto3",
    nom: "Alertes expiration archives",
    description: "Notification avant expiration de la période de rétention",
    module: "iarchive",
    actif: true,
    declencheur: {
      type: "retention_expiring",
      conditions: [
        { champ: "delai_restant", operateur: "egal", valeur: "6_mois" },
      ],
    },
    actions: [
      { type: "notifier_personnes", label: "Notifier administrateurs", ordre: 1 },
      { type: "changer_statut", label: "Passer en «Expiration proche»", ordre: 2 },
    ],
  },
  {
    id: "auto4",
    nom: "Classement auto PV signés",
    description: "Classe automatiquement les PV une fois signés",
    module: "idocument",
    actif: true,
    declencheur: {
      type: "signature_completee",
      conditions: [
        { champ: "type_document", operateur: "contient", valeur: "pv" },
      ],
    },
    actions: [
      { type: "classer_dossier", label: "Classer dans Contrats & Juridique", ordre: 1 },
      { type: "archiver_document", label: "Archiver dans iArchive", ordre: 2 },
      { type: "notifier_personnes", label: "Notifier Direction Générale", ordre: 3 },
    ],
  },
];

/* ─── Mock Data: Organizations DB ──────────────── */

const ORGANIZATIONS_DB: Record<string, OrganizationData> = {
  seeg: {
    id: "seeg",
    nom: "SEEG",
    secteur: "Énergie & Eau",
    type: "Établissement public",
    rccm: "GA-LBV-2003-B-44521",
    nif: "20031234567A",
    contact: "M. Bivigou",
    email: "direction@seeg.ga",
    telephone: "+241 01 76 31 00",
    adresse: "Boulevard Léon Mba, Centre-ville",
    ville: "Libreville",
    statut: "Actif",
    plan: "Enterprise",
    modules: { idocument: true, iarchive: true, isignature: true },
    sites: SEEG_SITES,
    orgUnits: SEEG_ORG_UNITS,
    personnel: SEEG_PERSONNEL,
    dossiers: SEEG_DOSSIERS,
    docConfig: SEEG_DOC_CONFIG,
    archiveConfig: SEEG_ARCHIVE_CONFIG,
    signatureConfig: SEEG_SIGNATURE_CONFIG,
    automationRules: SEEG_AUTOMATION,
    hebergement: "Data Center",
    pagePublique: true,
    domaine: "seeg.digitalium.io",
    theme: "Défaut — Violet",
    annuaire: "Public",
  },
  dgdi: {
    id: "dgdi",
    nom: "DGDI",
    secteur: "Administration publique",
    type: "Gouvernement",
    rccm: "—",
    nif: "GOV-DGDI-001",
    contact: "M. Essono",
    email: "contact@dgdi.ga",
    telephone: "+241 01 72 10 00",
    adresse: "Boulevard Triomphal",
    ville: "Libreville",
    statut: "Actif",
    plan: "Pro",
    modules: { idocument: true, iarchive: true, isignature: false },
    sites: [
      { id: "site-dgdi1", nom: "Siège DGDI", adresse: "Boulevard Triomphal", ville: "Libreville", pays: "Gabon", telephone: "+241 01 72 10 00", email: "contact@dgdi.ga", estSiege: true, type: "siege" as SiteType },
    ],
    orgUnits: [
      { id: "ou-dgdi1", nom: "Direction", type: "direction_generale" as OrgUnitType, parentId: null, siteId: "site-dgdi1", responsable: "M. Essono", couleur: "blue", description: "", ordre: 0 },
      { id: "ou-dgdi2", nom: "Secrétariat", type: "service" as OrgUnitType, parentId: "ou-dgdi1", siteId: "site-dgdi1", responsable: "", couleur: "cyan", description: "", ordre: 1 },
      { id: "ou-dgdi3", nom: "Informatique", type: "service" as OrgUnitType, parentId: "ou-dgdi1", siteId: "site-dgdi1", responsable: "", couleur: "emerald", description: "", ordre: 2 },
    ],
    personnel: [
      { id: "per-dgdi1", nom: "Marc Essono", email: "m.essono@dgdi.ga", poste: "Directeur", orgUnitId: "ou-dgdi1", orgUnitNom: "Direction", role: "org_admin", statut: "Actif" },
    ],
    dossiers: [],
    docConfig: { versioningActif: true, maxVersions: 5, autoClassification: false, champsObligatoires: ["tags"], categoriesTags: [], reglesClassement: [] },
    archiveConfig: { retentionPolicies: [], triggerDateDefaut: "date_creation", autoArchiveActif: false, notifications: [], categories: [] },
    signatureConfig: { parametres: { signatureAvancee: false, horodatageCertifie: false, delaiDefautJours: 7, relanceAutoJours: 3, contreSignatureObligatoire: false }, chainesSignature: [], delegations: [] },
    automationRules: [],
    hebergement: "Cloud",
    pagePublique: false,
    domaine: "",
    theme: "Défaut",
    annuaire: "Privé",
  },
  minterieur: {
    id: "minterieur",
    nom: "Min. Intérieur",
    secteur: "Administration publique",
    type: "Gouvernement",
    rccm: "—",
    nif: "GOV-MINT-001",
    contact: "Mme Akongo",
    email: "secgen@minterieur.ga",
    telephone: "+241 01 76 50 00",
    adresse: "Quartier Administratif",
    ville: "Libreville",
    statut: "Actif",
    plan: "Enterprise",
    modules: { idocument: true, iarchive: true, isignature: true },
    sites: [
      { id: "site-mint1", nom: "Siège Ministère", adresse: "Quartier Administratif", ville: "Libreville", pays: "Gabon", telephone: "+241 01 76 50 00", email: "secgen@minterieur.ga", estSiege: true, type: "siege" as SiteType },
    ],
    orgUnits: [
      { id: "ou-mint1", nom: "Cabinet du Ministre", type: "direction_generale" as OrgUnitType, parentId: null, siteId: "site-mint1", responsable: "Mme Akongo", couleur: "blue", description: "", ordre: 0 },
      { id: "ou-mint2", nom: "Protocole", type: "service" as OrgUnitType, parentId: "ou-mint1", siteId: "site-mint1", responsable: "", couleur: "cyan", description: "", ordre: 1 },
      { id: "ou-mint3", nom: "Archives", type: "service" as OrgUnitType, parentId: "ou-mint1", siteId: "site-mint1", responsable: "", couleur: "emerald", description: "", ordre: 2 },
    ],
    personnel: [
      { id: "per-mint1", nom: "Jeanne Akongo", email: "j.akongo@minterieur.ga", poste: "Secrétaire Générale", orgUnitId: "ou-mint1", orgUnitNom: "Cabinet du Ministre", role: "org_admin", statut: "Actif" },
    ],
    dossiers: [],
    docConfig: { versioningActif: false, maxVersions: 5, autoClassification: false, champsObligatoires: [], categoriesTags: [], reglesClassement: [] },
    archiveConfig: { retentionPolicies: [], triggerDateDefaut: "date_creation", autoArchiveActif: false, notifications: [], categories: [] },
    signatureConfig: { parametres: { signatureAvancee: false, horodatageCertifie: true, delaiDefautJours: 5, relanceAutoJours: 2, contreSignatureObligatoire: true }, chainesSignature: [], delegations: [] },
    automationRules: [],
    hebergement: "Local",
    pagePublique: true,
    domaine: "minterieur.digitalium.io",
    theme: "Officiel — Bleu",
    annuaire: "Public",
  },
  gabtelecom: {
    id: "gabtelecom",
    nom: "Gabon Télécom",
    secteur: "Télécommunications",
    type: "Entreprise",
    rccm: "GA-LBV-2001-B-33210",
    nif: "20011234567B",
    contact: "Mme Ndong",
    email: "admin@gabtelecom.ga",
    telephone: "+241 01 74 50 00",
    adresse: "Avenue du Général de Gaulle",
    ville: "Libreville",
    statut: "Config",
    plan: "Pro",
    modules: { idocument: true, iarchive: false, isignature: true },
    sites: [
      { id: "site-gab1", nom: "Siège", adresse: "Avenue du Général de Gaulle", ville: "Libreville", pays: "Gabon", telephone: "+241 01 74 50 00", email: "admin@gabtelecom.ga", estSiege: true, type: "siege" as SiteType },
    ],
    orgUnits: [
      { id: "ou-gab1", nom: "Direction", type: "direction_generale" as OrgUnitType, parentId: null, siteId: "site-gab1", responsable: "Mme Ndong", couleur: "violet", description: "", ordre: 0 },
      { id: "ou-gab2", nom: "Réseau", type: "service" as OrgUnitType, parentId: "ou-gab1", siteId: "site-gab1", responsable: "", couleur: "cyan", description: "", ordre: 1 },
      { id: "ou-gab3", nom: "Commercial", type: "service" as OrgUnitType, parentId: "ou-gab1", siteId: "site-gab1", responsable: "", couleur: "emerald", description: "", ordre: 2 },
    ],
    personnel: [
      { id: "per-gab1", nom: "Marie Ndong", email: "m.ndong@gabtelecom.ga", poste: "Directrice", orgUnitId: "ou-gab1", orgUnitNom: "Direction", role: "org_admin", statut: "Actif" },
    ],
    dossiers: [],
    docConfig: { versioningActif: false, maxVersions: 5, autoClassification: false, champsObligatoires: [], categoriesTags: [], reglesClassement: [] },
    archiveConfig: { retentionPolicies: [], triggerDateDefaut: "date_creation", autoArchiveActif: false, notifications: [], categories: [] },
    signatureConfig: { parametres: { signatureAvancee: false, horodatageCertifie: false, delaiDefautJours: 7, relanceAutoJours: 3, contreSignatureObligatoire: false }, chainesSignature: [], delegations: [] },
    automationRules: [],
    hebergement: "Cloud",
    pagePublique: false,
    domaine: "",
    theme: "Défaut",
    annuaire: "Privé",
  },
  pgl: {
    id: "pgl",
    nom: "Port-Gentil Logistique",
    secteur: "Logistique & Transport",
    type: "Entreprise",
    rccm: "GA-POG-2015-B-12345",
    nif: "20151234567C",
    contact: "M. Mba",
    email: "direction@pgl.ga",
    telephone: "+241 01 55 30 00",
    adresse: "Zone Portuaire",
    ville: "Port-Gentil",
    statut: "Config",
    plan: "Starter",
    modules: { idocument: true, iarchive: false, isignature: false },
    sites: [
      { id: "site-pgl1", nom: "Bureau Principal", adresse: "Zone Portuaire", ville: "Port-Gentil", pays: "Gabon", telephone: "+241 01 55 30 00", email: "direction@pgl.ga", estSiege: true, type: "siege" as SiteType },
    ],
    orgUnits: [
      { id: "ou-pgl1", nom: "Direction", type: "direction_generale" as OrgUnitType, parentId: null, siteId: "site-pgl1", responsable: "M. Mba", couleur: "blue", description: "", ordre: 0 },
      { id: "ou-pgl2", nom: "Opérations", type: "service" as OrgUnitType, parentId: "ou-pgl1", siteId: "site-pgl1", responsable: "", couleur: "cyan", description: "", ordre: 1 },
      { id: "ou-pgl3", nom: "Administration", type: "service" as OrgUnitType, parentId: "ou-pgl1", siteId: "site-pgl1", responsable: "", couleur: "emerald", description: "", ordre: 2 },
    ],
    personnel: [
      { id: "per-pgl1", nom: "Jean Mba", email: "j.mba@pgl.ga", poste: "Directeur", orgUnitId: "ou-pgl1", orgUnitNom: "Direction", role: "org_admin", statut: "Actif" },
    ],
    dossiers: [],
    docConfig: { versioningActif: false, maxVersions: 5, autoClassification: false, champsObligatoires: [], categoriesTags: [], reglesClassement: [] },
    archiveConfig: { retentionPolicies: [], triggerDateDefaut: "date_creation", autoArchiveActif: false, notifications: [], categories: [] },
    signatureConfig: { parametres: { signatureAvancee: false, horodatageCertifie: false, delaiDefautJours: 7, relanceAutoJours: 3, contreSignatureObligatoire: false }, chainesSignature: [], delegations: [] },
    automationRules: [],
    hebergement: "Cloud",
    pagePublique: false,
    domaine: "",
    theme: "Défaut",
    annuaire: "Privé",
  },
};

/* ─── Archive Lifecycle Pipeline ───────────────── */

const LIFECYCLE_NODES = [
  { id: "creation", label: "Création", color: "bg-zinc-500", textColor: "text-zinc-300", description: "Déposé, en attente de classification" },
  { id: "active", label: "Actif", color: "bg-emerald-500", textColor: "text-emerald-300", description: "En rétention active" },
  { id: "semi_active", label: "Semi-actif", color: "bg-blue-500", textColor: "text-blue-300", description: "Usage réduit, conservation obligatoire" },
  { id: "archived", label: "Archivé", color: "bg-violet-500", textColor: "text-violet-300", description: "Archivé définitif" },
  { id: "on_hold", label: "Gel", color: "bg-amber-500", textColor: "text-amber-300", description: "Gel juridique (litige, audit)" },
  { id: "expiring_soon", label: "Expiration", color: "bg-orange-500", textColor: "text-orange-300", description: "Alerte X mois avant expiration" },
  { id: "expired", label: "Expiré", color: "bg-red-500", textColor: "text-red-300", description: "Rétention écoulée" },
  { id: "destroyed", label: "Détruit", color: "bg-zinc-600", textColor: "text-zinc-400", description: "Détruit conformément à la politique" },
];

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════ */

export default function OrganizationDetailPage() {
  const params = useParams();
  const orgId = params.id as string;
  const org = ORGANIZATIONS_DB[orgId] || ORGANIZATIONS_DB.seeg;

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["fld1", "fld3"]));
  const [configSubTab, setConfigSubTab] = useState<string>(
    org.modules.idocument ? "idocument" : org.modules.iarchive ? "iarchive" : "isignature"
  );

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const handleSave = () => {
    toast.success("Organisation mise à jour", { description: `${org.nom} sauvegardé avec succès` });
  };

  const getSiteName = (siteId: string) => {
    const s = org.sites.find((site) => site.id === siteId);
    return s ? s.nom : "—";
  };

  const getFolderIcon = (icone: string) => {
    switch (icone) {
      case "Landmark": return Landmark;
      case "Users": return Users;
      case "Shield": return Shield;
      case "Briefcase": return Briefcase;
      case "Wrench": return Wrench;
      case "Lock": return Lock;
      default: return Folder;
    }
  };

  const getModuleBadge = (mod?: "idocument" | "iarchive" | "isignature") => {
    if (!mod) return null;
    const labels: Record<string, string> = { idocument: "iDocument", iarchive: "iArchive", isignature: "iSignature" };
    const colors = MODULE_COLORS[mod];
    return (
      <Badge variant="secondary" className={`text-[8px] ${colors.bg} ${colors.text} border-0`}>
        {labels[mod]}
      </Badge>
    );
  };

  const getSignatureStepColor = (type: string) => {
    switch (type) {
      case "visa": return { bg: "bg-blue-500/15", text: "text-blue-400" };
      case "approbation": return { bg: "bg-amber-500/15", text: "text-amber-400" };
      case "signature": return { bg: "bg-emerald-500/15", text: "text-emerald-400" };
      case "contre_signature": return { bg: "bg-violet-500/15", text: "text-violet-400" };
      default: return { bg: "bg-zinc-500/15", text: "text-zinc-400" };
    }
  };

  const getSignatureStepLabel = (type: string) => {
    switch (type) {
      case "visa": return "Visa";
      case "approbation": return "Approbation";
      case "signature": return "Signature";
      case "contre_signature": return "Contre-signature";
      default: return type;
    }
  };

  const ReadOnlyTree = ({ units, sites }: { units: OrgUnit[]; sites: Site[] }) => {
    const [expanded, setExpanded] = useState<Set<string>>(new Set(units.map(u => u.id)));

    const toggleExpand = (id: string) => {
      setExpanded(prev => {
        const next = new Set(Array.from(prev));
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    };

    const renderNode = (unit: OrgUnit, depth: number): React.ReactNode => {
      const children = units.filter(u => u.parentId === unit.id).sort((a, b) => a.ordre - b.ordre);
      const isExpanded = expanded.has(unit.id);
      const config = ORG_UNIT_TYPE_CONFIG[unit.type];
      const site = sites.find(s => s.id === unit.siteId);

      return (
        <div key={unit.id} style={{ paddingLeft: depth * 24 }}>
          <div className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-white/[0.03] transition-all">
            {children.length > 0 ? (
              <button onClick={() => toggleExpand(unit.id)} className="text-muted-foreground hover:text-white transition-colors">
                {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
              </button>
            ) : (
              <span className="w-3.5" />
            )}
            <div className={`h-2.5 w-2.5 rounded-full bg-${config.color}-500 shrink-0`} />
            <span className="text-xs font-medium">{unit.nom}</span>
            <Badge className={`text-[8px] bg-${config.color}-500/10 text-${config.color}-400 border-${config.color}-500/20 py-0`}>
              {config.label}
            </Badge>
            {site && (
              <Badge className="text-[8px] bg-white/5 text-muted-foreground border-white/10 py-0">
                {site.nom}
              </Badge>
            )}
            {unit.responsable && (
              <span className="text-[9px] text-muted-foreground ml-auto">{unit.responsable}</span>
            )}
          </div>
          {isExpanded && children.map(child => renderNode(child, depth + 1))}
        </div>
      );
    };

    const roots = units.filter(u => u.parentId === null).sort((a, b) => a.ordre - b.ordre);
    return (
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-1">
        {roots.map(root => renderNode(root, 0))}
      </div>
    );
  };

  /* ─── RENDER ─────────────────────────────────── */

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-[1200px] mx-auto">
      {/* ─── Header ─── */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/organizations">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-white/5">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Building className="h-6 w-6 text-blue-400" />
              {org.nom}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-[9px] bg-white/5 border-0">{org.type}</Badge>
              <Badge variant="secondary" className="text-[9px] bg-blue-500/15 text-blue-300 border-0">{org.secteur}</Badge>
              <Badge variant="secondary" className={`text-[9px] border-0 ${org.statut === "Actif" ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"}`}>
                {org.statut}
              </Badge>
            </div>
          </div>
        </div>
        <Button onClick={handleSave} className="bg-gradient-to-r from-blue-600 to-violet-500 text-white hover:opacity-90 text-xs gap-2">
          <Save className="h-3.5 w-3.5" />
          Enregistrer
        </Button>
      </motion.div>

      {/* ─── Tabs ─── */}
      <motion.div variants={fadeUp}>
        <Tabs defaultValue="profil" className="w-full">
          <TabsList className="bg-white/[0.02] border border-white/5 p-1 rounded-lg h-auto flex flex-wrap gap-0.5">
            {[
              { value: "profil", label: "Profil", icon: UserCircle },
              { value: "modules", label: "Modules", icon: Package },
              { value: "ecosysteme", label: "Écosystème", icon: Network },
              { value: "personnel", label: "Personnel", icon: Users },
              { value: "dossiers", label: "Dossiers", icon: FolderTree },
              { value: "configuration", label: "Configuration", icon: Settings },
              { value: "automatisation", label: "Automatisation", icon: Zap },
              { value: "deploiement", label: "Déploiement", icon: Server },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="text-xs gap-1.5 data-[state=active]:bg-blue-500/15 data-[state=active]:text-blue-300"
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* ═══════════════════════════════════════
             TAB 1: PROFIL
             ═══════════════════════════════════════ */}
          <TabsContent value="profil" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Identite */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <Building className="h-4 w-4 text-blue-400" /> Identité
                </h3>
                <div className="space-y-3">
                  {[
                    { label: "Raison sociale", value: org.nom },
                    { label: "Secteur d'activité", value: org.secteur },
                    { label: "Type", value: org.type },
                    { label: "RCCM", value: org.rccm },
                    { label: "NIF", value: org.nif },
                  ].map((f) => (
                    <div key={f.label}>
                      <label className="text-[10px] font-medium block text-muted-foreground mb-1">{f.label}</label>
                      <Input value={f.value} readOnly className="h-8 text-xs bg-white/5 border-white/10" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Coordonnees */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <UserCircle className="h-4 w-4 text-blue-400" /> Coordonnées
                </h3>
                <div className="space-y-3">
                  {[
                    { label: "Contact principal", value: org.contact },
                    { label: "Email", value: org.email },
                    { label: "Téléphone", value: org.telephone },
                    { label: "Adresse", value: org.adresse },
                    { label: "Ville", value: org.ville },
                  ].map((f) => (
                    <div key={f.label}>
                      <label className="text-[10px] font-medium block text-muted-foreground mb-1">{f.label}</label>
                      <Input value={f.value} readOnly className="h-8 text-xs bg-white/5 border-white/10" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                className="text-xs gap-1.5 border-white/10"
                onClick={() => toast.success("Organisation mise à jour", { description: "Profil modifié" })}
              >
                <Save className="h-3 w-3" /> Modifier
              </Button>
            </div>
          </TabsContent>

          {/* ═══════════════════════════════════════
             TAB 2: MODULES
             ═══════════════════════════════════════ */}
          <TabsContent value="modules" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(["idocument", "iarchive", "isignature"] as const).map((mod) => {
                const modConfig = MODULE_FEATURES[mod];
                const isActive = org.modules[mod];
                const colors = MODULE_COLORS[mod];
                const ModIcon = mod === "idocument" ? FileText : mod === "iarchive" ? Archive : PenTool;
                return (
                  <div key={mod} className={`bg-white/[0.02] border rounded-2xl p-5 ${isActive ? "border-white/10" : "border-white/5 opacity-50"}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <ModIcon className={`h-5 w-5 ${colors.text}`} />
                        <span className="text-sm font-semibold">{modConfig.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className={`text-[9px] border-0 ${isActive ? "bg-emerald-500/15 text-emerald-400" : "bg-zinc-500/15 text-zinc-400"}`}>
                          {isActive ? "Actif" : "Inactif"}
                        </Badge>
                        {isActive ? (
                          <ToggleRight className="h-6 w-6 text-emerald-400" />
                        ) : (
                          <ToggleLeft className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      {modConfig.features.map((f) => (
                        <div key={f.name} className="flex items-center justify-between">
                          <span className="text-[10px] text-muted-foreground">{f.name}</span>
                          {f.enabled ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <X className="h-3.5 w-3.5 text-muted-foreground/30" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* ═══════════════════════════════════════
             TAB 3: ECOSYSTEME
             ═══════════════════════════════════════ */}
          <TabsContent value="ecosysteme" className="mt-4 space-y-6">
            {/* Sites */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-blue-400" /> Sites & Implantations
                </p>
                <Badge variant="secondary" className="text-[9px] border-0 bg-white/5">{org.sites.length}</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {org.sites.map((s) => {
                  const stConfig = SITE_TYPE_CONFIG[s.type];
                  return (
                    <div key={s.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`h-8 w-8 rounded-lg bg-${stConfig.color}-500/15 flex items-center justify-center`}>
                          <Building2 className={`h-4 w-4 text-${stConfig.color}-400`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-semibold truncate">{s.nom}</p>
                            {s.estSiege && <Star className="h-3 w-3 text-amber-400 fill-amber-400 shrink-0" />}
                          </div>
                        </div>
                        <Badge className={`text-[8px] bg-${stConfig.color}-500/10 text-${stConfig.color}-400 border-${stConfig.color}-500/20 shrink-0`}>
                          {stConfig.label}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {s.adresse}, {s.ville}
                      </p>
                      {s.telephone && (
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Phone className="h-3 w-3 shrink-0" />
                          {s.telephone}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Org Tree (read-only) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold flex items-center gap-1.5">
                  <Network className="h-4 w-4 text-violet-400" /> Structure organisationnelle
                </p>
                <Badge variant="secondary" className="text-[9px] border-0 bg-white/5">{org.orgUnits.length} unités</Badge>
              </div>
              <ReadOnlyTree units={org.orgUnits} sites={org.sites} />
            </div>

            {/* Summary */}
            <div className="bg-white/[0.02] border border-white/5 rounded-lg px-4 py-2.5 flex items-center gap-4">
              <span className="text-[10px] text-muted-foreground">Résumé :</span>
              <Badge className="text-[9px] bg-blue-500/10 text-blue-400 border-blue-500/20">{org.sites.length} site{org.sites.length > 1 ? "s" : ""}</Badge>
              <Badge className="text-[9px] bg-violet-500/10 text-violet-400 border-violet-500/20">{org.orgUnits.length} unité{org.orgUnits.length > 1 ? "s" : ""}</Badge>
              <Badge className="text-[9px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20">{org.personnel.length} personnel</Badge>
            </div>
          </TabsContent>

          {/* ═══════════════════════════════════════
             TAB 4: PERSONNEL
             ═══════════════════════════════════════ */}
          <TabsContent value="personnel" className="mt-4 space-y-4">
            {/* KPIs */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Total", value: org.personnel.length, color: "blue" },
                { label: "Actifs", value: org.personnel.filter((p) => p.statut === "Actif").length, color: "emerald" },
                { label: "Unités org.", value: new Set(org.personnel.map((p) => p.orgUnitNom)).size, color: "violet" },
              ].map((kpi) => (
                <div key={kpi.label} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                  <p className="text-xl font-bold">{kpi.value}</p>
                  <p className="text-[10px] text-muted-foreground">{kpi.label}</p>
                </div>
              ))}
            </div>

            {/* Table */}
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 overflow-x-auto">
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
                  {org.personnel.map((p) => {
                    const roleConfig = ROLE_COLORS[p.role] || ROLE_COLORS.org_member;
                    return (
                      <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                        <td className="py-2.5 px-2">
                          <div>
                            <p className="font-medium">{p.nom}</p>
                            <p className="text-[10px] text-muted-foreground">{p.email}</p>
                          </div>
                        </td>
                        <td className="py-2.5 px-2 text-muted-foreground">{p.poste}</td>
                        <td className="py-2.5 px-2 text-muted-foreground hidden md:table-cell">{p.orgUnitNom}</td>
                        <td className="py-2.5 px-2 hidden sm:table-cell">
                          <Badge variant="secondary" className={`text-[9px] border-0 ${roleConfig.bg} ${roleConfig.text}`}>
                            {roleConfig.label}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <Badge variant="secondary" className={`text-[9px] border-0 ${p.statut === "Actif" ? "bg-emerald-500/15 text-emerald-400" : p.statut === "Invité" ? "bg-blue-500/15 text-blue-400" : "bg-zinc-500/15 text-zinc-400"}`}>
                            {p.statut}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* ═══════════════════════════════════════
             TAB 5: DOSSIERS
             ═══════════════════════════════════════ */}
          <TabsContent value="dossiers" className="mt-4 space-y-4">
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <FolderTree className="h-4 w-4 text-blue-400" /> Arborescence des dossiers
              </h3>
              <div className="space-y-2">
                {org.dossiers.map((folder) => {
                  const isExpanded = expandedFolders.has(folder.id);
                  const folderColors = FOLDER_COLORS[folder.couleur] || FOLDER_COLORS.blue;
                  const FolderIcon = getFolderIcon(folder.icone);
                  return (
                    <div key={folder.id}>
                      <button
                        onClick={() => toggleFolder(folder.id)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors text-left"
                      >
                        <div className={`h-9 w-9 rounded-lg ${folderColors.bg} flex items-center justify-center shrink-0`}>
                          <FolderIcon className={`h-4 w-4 ${folderColors.text}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{folder.nom}</span>
                            <Badge variant="secondary" className="text-[8px] bg-white/5 border-0">
                              {folder.sousDossiers.length} sous-dossiers
                            </Badge>
                            {getModuleBadge(folder.moduleAssociation)}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1">
                            {folder.tags.map((tag) => (
                              <span key={tag} className="text-[9px] text-muted-foreground bg-white/5 px-1.5 py-0.5 rounded">
                                {tag}
                              </span>
                            ))}
                            <span className="text-[9px] text-muted-foreground/60 ml-2">
                              {folder.orgUnitAcces.join(", ")}
                            </span>
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                      </button>
                      {isExpanded && (
                        <div className="ml-12 mt-1 space-y-1 pb-2">
                          {folder.sousDossiers.map((sub) => (
                            <div key={sub} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/[0.02] text-xs text-muted-foreground">
                              <FolderOpen className={`h-3.5 w-3.5 ${folderColors.text}`} />
                              <span>{sub}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
                {org.dossiers.length === 0 && (
                  <div className="text-center py-8">
                    <FolderTree className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Aucun dossier configuré</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ═══════════════════════════════════════
             TAB 6: CONFIGURATION
             ═══════════════════════════════════════ */}
          <TabsContent value="configuration" className="mt-4 space-y-4">
            {/* Module Sub-tabs */}
            <div className="flex items-center gap-2 mb-2">
              {(["idocument", "iarchive", "isignature"] as const).map((mod) => {
                if (!org.modules[mod]) return null;
                const Icon = mod === "idocument" ? FileText : mod === "iarchive" ? Archive : PenTool;
                const colors = MODULE_COLORS[mod];
                const isActive = configSubTab === mod;
                const labels: Record<string, string> = { idocument: "iDocument", iarchive: "iArchive", isignature: "iSignature" };
                return (
                  <button
                    key={mod}
                    onClick={() => setConfigSubTab(mod)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                      isActive ? `${colors.stepBg} ${colors.text} border-current/20` : "border-transparent text-muted-foreground hover:bg-white/5"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {labels[mod]}
                  </button>
                );
              })}
            </div>

            {/* ─── iDocument Config ─── */}
            {configSubTab === "idocument" && org.modules.idocument && (
              <div className="space-y-4">
                {/* Parametres generaux */}
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
                  <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    <Settings className="h-4 w-4 text-blue-400" /> Paramètres généraux
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: "Versionnage actif", value: org.docConfig.versioningActif, detail: `Max ${org.docConfig.maxVersions} versions` },
                      { label: "Auto-classification", value: org.docConfig.autoClassification, detail: "Classement automatique par tags" },
                      { label: "Champs obligatoires", value: true, detail: org.docConfig.champsObligatoires.join(", ") },
                    ].map((param) => (
                      <div key={param.label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                        <div>
                          <p className="text-xs font-medium">{param.label}</p>
                          <p className="text-[10px] text-muted-foreground">{param.detail}</p>
                        </div>
                        {param.value ? (
                          <ToggleRight className="h-5 w-5 text-emerald-400" />
                        ) : (
                          <ToggleLeft className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Categories de tags */}
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
                  <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    <Tag className="h-4 w-4 text-blue-400" /> Catégories de tags
                  </h3>
                  <div className="space-y-3">
                    {org.docConfig.categoriesTags.map((cat) => {
                      const catColors = DEPT_COLORS[cat.couleur] || DEPT_COLORS.blue;
                      return (
                        <div key={cat.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                          <div>
                            <div className="flex items-center gap-2">
                              <div className={`h-2 w-2 rounded-full ${catColors.dot}`} />
                              <p className="text-xs font-medium">{cat.nom}</p>
                              {cat.obligatoire && (
                                <Badge variant="secondary" className="text-[8px] bg-red-500/15 text-red-400 border-0">Obligatoire</Badge>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1.5 ml-4">
                              {cat.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className={`text-[9px] border-0 ${catColors.bg} ${catColors.text}`}>
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Regles de classement */}
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
                  <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    <Layers className="h-4 w-4 text-blue-400" /> Règles de classement
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-white/5 text-muted-foreground">
                          <th className="text-left py-2 px-2">Règle</th>
                          <th className="text-left py-2 px-2">Condition</th>
                          <th className="text-left py-2 px-2 hidden md:table-cell">Action</th>
                          <th className="text-center py-2 px-2">Statut</th>
                        </tr>
                      </thead>
                      <tbody>
                        {org.docConfig.reglesClassement.map((rule) => (
                          <tr key={rule.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                            <td className="py-2.5 px-2 font-medium">{rule.nom}</td>
                            <td className="py-2.5 px-2 text-muted-foreground">
                              <span className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded">{rule.condition.type}</span>
                              <span className="ml-1">= {rule.condition.valeur}</span>
                            </td>
                            <td className="py-2.5 px-2 text-muted-foreground hidden md:table-cell">
                              <span>{rule.action.dossier}</span>
                            </td>
                            <td className="py-2.5 px-2 text-center">
                              {rule.actif ? (
                                <Badge variant="secondary" className="text-[9px] border-0 bg-emerald-500/15 text-emerald-400">Actif</Badge>
                              ) : (
                                <Badge variant="secondary" className="text-[9px] border-0 bg-zinc-500/15 text-zinc-400">Inactif</Badge>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ─── iArchive Config ─── */}
            {configSubTab === "iarchive" && org.modules.iarchive && (
              <div className="space-y-4">
                {/* OHADA Banner */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-center gap-3">
                  <Shield className="h-5 w-5 text-blue-400 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-blue-300">Configuration conforme OHADA</p>
                    <p className="text-[10px] text-blue-400/70">Les durées de rétention suivent les recommandations de l'Acte Uniforme OHADA et du Code du Travail gabonais</p>
                  </div>
                </div>

                {/* Retention Policies Table */}
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
                  <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-400" /> Politiques de rétention
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-white/5 text-muted-foreground">
                          <th className="text-left py-2 px-2">Catégorie</th>
                          <th className="text-center py-2 px-2">Durée</th>
                          <th className="text-left py-2 px-2 hidden md:table-cell">Déclencheur</th>
                          <th className="text-left py-2 px-2 hidden lg:table-cell">Référence OHADA</th>
                        </tr>
                      </thead>
                      <tbody>
                        {org.archiveConfig.retentionPolicies.map((policy) => {
                          const catColors = CATEGORY_COLORS[policy.categorieSlug] || CATEGORY_COLORS.fiscal;
                          const PolicyIcon = getFolderIcon(policy.icone);
                          return (
                            <tr key={policy.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                              <td className="py-3 px-2">
                                <div className="flex items-center gap-2">
                                  <div className={`h-7 w-7 rounded-lg ${catColors.iconBg} flex items-center justify-center`}>
                                    <PolicyIcon className={`h-3.5 w-3.5 ${catColors.text}`} />
                                  </div>
                                  <span className="font-medium">{policy.categorieLabel}</span>
                                </div>
                              </td>
                              <td className="py-3 px-2 text-center">
                                <Badge variant="secondary" className={`text-[10px] border-0 ${catColors.bg} ${catColors.text} font-bold`}>
                                  {policy.dureeAns} ans
                                </Badge>
                              </td>
                              <td className="py-3 px-2 text-muted-foreground hidden md:table-cell">
                                {TRIGGER_DATE_LABELS[policy.triggerDate]}
                              </td>
                              <td className="py-3 px-2 text-muted-foreground hidden lg:table-cell">
                                <span className="text-[10px]">{policy.referenceOHADA}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Archive Lifecycle Pipeline */}
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
                  <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-amber-400" /> Cycle de vie des archives
                  </h3>
                  <div className="flex items-center gap-1 flex-wrap justify-center py-4">
                    {LIFECYCLE_NODES.map((node, i) => (
                      <React.Fragment key={node.id}>
                        <div className="flex flex-col items-center gap-1.5">
                          <div className={`h-10 w-10 rounded-full ${node.color} flex items-center justify-center`}>
                            <span className="text-[9px] font-bold text-white">{i + 1}</span>
                          </div>
                          <span className={`text-[9px] font-medium ${node.textColor}`}>{node.label}</span>
                        </div>
                        {i < LIFECYCLE_NODES.length - 1 && (
                          <ArrowRight className="h-3 w-3 text-muted-foreground/30 shrink-0 mx-0.5" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4 pt-4 border-t border-white/5">
                    {LIFECYCLE_NODES.map((node) => (
                      <div key={node.id} className="flex items-start gap-2 text-[9px]">
                        <div className={`h-2 w-2 rounded-full ${node.color} mt-1 shrink-0`} />
                        <div>
                          <p className={`font-medium ${node.textColor}`}>{node.label}</p>
                          <p className="text-muted-foreground">{node.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notifications */}
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
                  <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-400" /> Règles de notification
                  </h3>
                  <div className="space-y-3">
                    {org.archiveConfig.notifications.map((notif, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                        <div>
                          <p className="text-xs font-medium">{notif.delaiMois} mois avant expiration</p>
                          <p className="text-[10px] text-muted-foreground">{notif.message}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {notif.destinataires.map((dest) => (
                            <Badge key={dest} variant="secondary" className="text-[8px] bg-white/5 border-0">{dest}</Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Archive Categories */}
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
                  <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    <Archive className="h-4 w-4 text-amber-400" /> Catégories d'archivage
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {org.archiveConfig.categories.map((cat) => {
                      const catColors = CATEGORY_COLORS[cat.slug] || CATEGORY_COLORS.fiscal;
                      const CatIcon = getFolderIcon(cat.icone);
                      return (
                        <div key={cat.slug} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`h-8 w-8 rounded-lg ${catColors.iconBg} flex items-center justify-center`}>
                              <CatIcon className={`h-4 w-4 ${catColors.text}`} />
                            </div>
                            <div>
                              <p className="text-xs font-semibold">{cat.nom}</p>
                              <p className="text-[10px] text-muted-foreground">{cat.retentionAns} ans</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="text-[8px] bg-white/5 border-0 gap-0.5">
                              {cat.slug === "coffre" && <Lock className="h-2 w-2" />}
                              {cat.confidentialite}
                            </Badge>
                            {cat.estFixe && (
                              <Badge variant="secondary" className="text-[8px] bg-blue-500/10 text-blue-400 border-0">Fixe</Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ─── iSignature Config ─── */}
            {configSubTab === "isignature" && org.modules.isignature && (
              <div className="space-y-4">
                {/* Parametres generaux */}
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
                  <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    <Settings className="h-4 w-4 text-violet-400" /> Paramètres généraux
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: "Signature avancée", value: org.signatureConfig.parametres.signatureAvancee, detail: "Signature qualifiée eIDAS" },
                      { label: "Horodatage certifié", value: org.signatureConfig.parametres.horodatageCertifie, detail: "Horodatage légalement reconnu" },
                      { label: "Contre-signature obligatoire", value: org.signatureConfig.parametres.contreSignatureObligatoire, detail: "Exige contre-signature DG" },
                    ].map((param) => (
                      <div key={param.label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                        <div>
                          <p className="text-xs font-medium">{param.label}</p>
                          <p className="text-[10px] text-muted-foreground">{param.detail}</p>
                        </div>
                        {param.value ? (
                          <ToggleRight className="h-5 w-5 text-emerald-400" />
                        ) : (
                          <ToggleLeft className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    ))}
                    <div className="flex items-center justify-between py-2 border-b border-white/5">
                      <div>
                        <p className="text-xs font-medium">Délai par défaut</p>
                        <p className="text-[10px] text-muted-foreground">Durée maximale pour signer</p>
                      </div>
                      <Badge variant="secondary" className="text-[9px] bg-violet-500/15 text-violet-400 border-0">
                        {org.signatureConfig.parametres.delaiDefautJours} jours
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-xs font-medium">Relance automatique</p>
                        <p className="text-[10px] text-muted-foreground">Intervalle de relance</p>
                      </div>
                      <Badge variant="secondary" className="text-[9px] bg-violet-500/15 text-violet-400 border-0">
                        {org.signatureConfig.parametres.relanceAutoJours} jours
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Chaines de signature */}
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
                  <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    <PenTool className="h-4 w-4 text-violet-400" /> Chaînes de signature
                  </h3>
                  <div className="space-y-4">
                    {org.signatureConfig.chainesSignature.map((chain) => (
                      <div key={chain.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-semibold">{chain.nom}</p>
                              {chain.estModele && (
                                <Badge variant="secondary" className="text-[8px] bg-violet-500/15 text-violet-400 border-0">Modèle</Badge>
                              )}
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{chain.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {chain.etapes.map((etape, i) => {
                            const stepColors = getSignatureStepColor(etape.type);
                            return (
                              <React.Fragment key={etape.ordre}>
                                <div className={`px-2.5 py-1 rounded-lg ${stepColors.bg} flex items-center gap-1.5`}>
                                  <span className={`text-[9px] font-bold ${stepColors.text}`}>{etape.ordre}</span>
                                  <div>
                                    <p className={`text-[9px] font-medium ${stepColors.text}`}>{getSignatureStepLabel(etape.type)}</p>
                                    <p className="text-[8px] text-muted-foreground">{etape.signataire.valeur}</p>
                                  </div>
                                </div>
                                {i < chain.etapes.length - 1 && (
                                  <ArrowRight className="h-3 w-3 text-muted-foreground/30 shrink-0" />
                                )}
                              </React.Fragment>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delegations */}
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
                  <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    <Users className="h-4 w-4 text-violet-400" /> Règles de délégation
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-white/5 text-muted-foreground">
                          <th className="text-left py-2 px-2">Délégant</th>
                          <th className="text-left py-2 px-2">Délégataire</th>
                          <th className="text-left py-2 px-2 hidden md:table-cell">Période</th>
                          <th className="text-left py-2 px-2 hidden lg:table-cell">Types</th>
                          <th className="text-left py-2 px-2 hidden lg:table-cell">Motif</th>
                        </tr>
                      </thead>
                      <tbody>
                        {org.signatureConfig.delegations.map((deleg, i) => (
                          <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                            <td className="py-2.5 px-2 font-medium">{deleg.delegant}</td>
                            <td className="py-2.5 px-2 text-muted-foreground">{deleg.delegataire}</td>
                            <td className="py-2.5 px-2 text-muted-foreground hidden md:table-cell">
                              <span className="text-[10px]">{deleg.dateDebut} → {deleg.dateFin}</span>
                            </td>
                            <td className="py-2.5 px-2 hidden lg:table-cell">
                              <div className="flex gap-1">
                                {deleg.types.map((t) => (
                                  <Badge key={t} variant="secondary" className="text-[8px] bg-white/5 border-0">{t}</Badge>
                                ))}
                              </div>
                            </td>
                            <td className="py-2.5 px-2 text-muted-foreground hidden lg:table-cell text-[10px]">{deleg.motif}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* No modules */}
            {!org.modules.idocument && !org.modules.iarchive && !org.modules.isignature && (
              <div className="text-center py-12">
                <Settings className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Aucun module activé</p>
                <p className="text-[10px] text-muted-foreground/60 mt-1">Activez au moins un module dans l'onglet Modules</p>
              </div>
            )}
          </TabsContent>

          {/* ═══════════════════════════════════════
             TAB 7: AUTOMATISATION
             ═══════════════════════════════════════ */}
          <TabsContent value="automatisation" className="mt-4 space-y-6">
            {(["idocument", "iarchive", "isignature"] as const).map((mod) => {
              const rules = org.automationRules.filter((r) => r.module === mod);
              if (rules.length === 0) return null;
              const colors = MODULE_COLORS[mod];
              const ModIcon = mod === "idocument" ? FileText : mod === "iarchive" ? Archive : PenTool;
              const labels: Record<string, string> = { idocument: "iDocument", iarchive: "iArchive", isignature: "iSignature" };
              return (
                <div key={mod}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`h-6 w-6 rounded-md ${colors.stepBg} flex items-center justify-center`}>
                      <ModIcon className={`h-3.5 w-3.5 ${colors.text}`} />
                    </div>
                    <h3 className={`text-sm font-semibold ${colors.text}`}>{labels[mod]}</h3>
                    <Badge variant="secondary" className="text-[9px] border-0 bg-white/5">{rules.length}</Badge>
                  </div>
                  <div className="space-y-3">
                    {rules.map((rule) => (
                      <div key={rule.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Zap className={`h-3.5 w-3.5 ${colors.text}`} />
                            <p className="text-xs font-semibold">{rule.nom}</p>
                            <Badge variant="secondary" className={`text-[9px] border-0 ${rule.actif ? "bg-emerald-500/15 text-emerald-400" : "bg-zinc-500/15 text-zinc-400"}`}>
                              {rule.actif ? "Actif" : "Inactif"}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          {/* QUAND */}
                          <div className="flex-1">
                            <Badge variant="secondary" className="text-[8px] bg-amber-500/15 text-amber-400 border-0 mb-2">QUAND</Badge>
                            <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg p-3">
                              <p className="text-[10px] font-medium text-amber-300 mb-1.5">
                                {rule.declencheur.type.replace(/_/g, " ")}
                              </p>
                              <div className="space-y-1">
                                {rule.declencheur.conditions.map((cond, ci) => (
                                  <div key={ci} className="flex items-center gap-1 text-[9px] text-amber-400/70">
                                    <span className="bg-amber-500/10 px-1.5 py-0.5 rounded">{cond.champ}</span>
                                    <span>{cond.operateur}</span>
                                    <span className="font-medium text-amber-300">{cond.valeur}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Arrow */}
                          <div className="flex items-center pt-8">
                            <ArrowRight className="h-4 w-4 text-muted-foreground/30" />
                          </div>

                          {/* ALORS */}
                          <div className="flex-1">
                            <Badge variant="secondary" className="text-[8px] bg-blue-500/15 text-blue-400 border-0 mb-2">ALORS</Badge>
                            <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg p-3">
                              <div className="space-y-1.5">
                                {rule.actions.map((action) => (
                                  <div key={action.ordre} className="flex items-center gap-2 text-[10px]">
                                    <span className="h-4 w-4 rounded-full bg-blue-500/15 flex items-center justify-center text-[8px] font-bold text-blue-400 shrink-0">
                                      {action.ordre}
                                    </span>
                                    <span className="text-blue-300">{action.label}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            {org.automationRules.length === 0 && (
              <div className="text-center py-12">
                <Zap className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Aucune règle d'automatisation</p>
                <p className="text-[10px] text-muted-foreground/60 mt-1">Les règles d'automatisation seront configurées ici</p>
              </div>
            )}
          </TabsContent>

          {/* ═══════════════════════════════════════
             TAB 8: DEPLOIEMENT
             ═══════════════════════════════════════ */}
          <TabsContent value="deploiement" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Hebergement */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <Server className="h-4 w-4 text-blue-400" /> Hébergement
                </h3>
                <div className="space-y-3 mb-4">
                  {[
                    { id: "Local", icon: Server, desc: "Serveur sur site client", color: "blue" },
                    { id: "Data Center", icon: HardDrive, desc: "Data center DIGITALIUM", color: "violet" },
                    { id: "Cloud", icon: Cloud, desc: "Infrastructure cloud (AWS/Azure)", color: "emerald" },
                  ].map((h) => {
                    const isActive = org.hebergement === h.id;
                    const Icon = h.icon;
                    return (
                      <div key={h.id} className={`rounded-xl p-3 border transition-all ${isActive ? "border-blue-500/30 bg-blue-500/5" : "border-white/5 opacity-40"}`}>
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-lg bg-${h.color}-500/15 flex items-center justify-center`}>
                            <Icon className={`h-4 w-4 text-${h.color}-400`} />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-semibold">{h.id}</p>
                            <p className="text-[9px] text-muted-foreground">{h.desc}</p>
                          </div>
                          {isActive && (
                            <Badge variant="secondary" className="text-[8px] bg-blue-500/15 text-blue-400 border-0">
                              <CheckCircle2 className="h-2 w-2 mr-0.5" /> Actif
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Resources */}
                <div className="pt-4 border-t border-white/5">
                  <p className="text-xs font-medium mb-3 text-muted-foreground">Ressources allouées</p>
                  <div className="space-y-3">
                    {[
                      { label: "CPU", value: "4 vCPU", usage: 45, icon: Cpu },
                      { label: "RAM", value: "8 GB", usage: 62, icon: MemoryStick },
                      { label: "Stockage", value: "45 / 100 GB", usage: 45, icon: HardDrive },
                    ].map((r) => {
                      const Icon = r.icon;
                      return (
                        <div key={r.label}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <Icon className="h-3 w-3 text-blue-400" />
                              <span className="text-[10px] font-medium">{r.label}</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground">{r.value} ({r.usage}%)</span>
                          </div>
                          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full" style={{ width: `${r.usage}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Page publique */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-emerald-400" /> Page publique
                </h3>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs font-medium">Portail public</p>
                    <p className="text-[10px] text-muted-foreground">Accessible aux visiteurs externes</p>
                  </div>
                  {org.pagePublique ? (
                    <ToggleRight className="h-6 w-6 text-emerald-400" />
                  ) : (
                    <ToggleLeft className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>

                {org.pagePublique ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-medium mb-1.5 block text-muted-foreground">Domaine personnalisé</label>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-blue-400" />
                        <Input value={org.domaine} readOnly className="h-8 text-xs bg-white/5 border-white/10 flex-1" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-medium mb-1.5 block text-muted-foreground">Thème</label>
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                        <Palette className="h-3.5 w-3.5 text-blue-400" />
                        <span className="text-xs">{org.theme}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-medium mb-1.5 block text-muted-foreground">Annuaire</label>
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                        <Eye className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-xs">{org.annuaire}</span>
                      </div>
                    </div>
                    <div className="pt-2">
                      <Badge variant="secondary" className="text-[9px] bg-emerald-500/15 text-emerald-400 border-0 gap-1">
                        <CheckCircle2 className="h-2.5 w-2.5" /> En ligne
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Globe className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Page publique désactivée</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

        </Tabs>
      </motion.div>
    </motion.div>
  );
}
