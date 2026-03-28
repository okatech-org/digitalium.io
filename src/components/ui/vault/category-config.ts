import {
	Briefcase, Building2, Car, ClipboardList, FileCheck, FileIcon,
	FilePenLine, FileText, Gavel, GraduationCap, Heart, Home,
	Landmark, Languages, Receipt, ShieldCheck, User, Wallet
} from "lucide-react";

export enum DocumentTypeCategory {
	Forms = "Forms",
	Identity = "Identity",
	CivilStatus = "CivilStatus",
	Nationality = "Nationality",
	Residence = "Residence",
	Employment = "Employment",
	Income = "Income",
	Certificates = "Certificates",
	OfficialCertificates = "OfficialCertificates",
	Justice = "Justice",
	AdministrativeDecisions = "AdministrativeDecisions",
	Housing = "Housing",
	Vehicle = "Vehicle",
	Education = "Education",
	LanguageIntegration = "LanguageIntegration",
	Health = "Health",
	Taxation = "Taxation",
	Other = "Other",
}

export const CATEGORY_CONFIG: Record<
	DocumentTypeCategory,
	{
		icon: React.ElementType;
		label: string;
		labelEn: string;
		gradient: string;
		shadowColor: string;
		iconColor: string;
	}
> = {
	[DocumentTypeCategory.Forms]: {
		icon: FilePenLine,
		label: "Formulaires", labelEn: "Forms",
		gradient: "bg-gradient-to-br from-indigo-400 to-indigo-600",
		shadowColor: "shadow-indigo-500/30",
		iconColor: "text-indigo-600",
	},
	[DocumentTypeCategory.Identity]: {
		icon: User,
		label: "Identité", labelEn: "Identity",
		gradient: "bg-gradient-to-br from-violet-400 to-purple-600",
		shadowColor: "shadow-violet-500/30",
		iconColor: "text-violet-600",
	},
	[DocumentTypeCategory.CivilStatus]: {
		icon: FileText,
		label: "État civil", labelEn: "Civil Status",
		gradient: "bg-gradient-to-br from-fuchsia-400 to-pink-600",
		shadowColor: "shadow-fuchsia-500/30",
		iconColor: "text-fuchsia-600",
	},
	[DocumentTypeCategory.Nationality]: {
		icon: ShieldCheck,
		label: "Nationalité", labelEn: "Nationality",
		gradient: "bg-gradient-to-br from-cyan-400 to-cyan-600",
		shadowColor: "shadow-cyan-500/30",
		iconColor: "text-cyan-600",
	},
	[DocumentTypeCategory.Residence]: {
		icon: Home,
		label: "Résidence", labelEn: "Residence",
		gradient: "bg-gradient-to-br from-emerald-400 to-teal-600",
		shadowColor: "shadow-emerald-500/30",
		iconColor: "text-emerald-600",
	},
	[DocumentTypeCategory.Employment]: {
		icon: Briefcase,
		label: "Emploi", labelEn: "Employment",
		gradient: "bg-gradient-to-br from-sky-400 to-blue-600",
		shadowColor: "shadow-sky-500/30",
		iconColor: "text-sky-600",
	},
	[DocumentTypeCategory.Income]: {
		icon: Wallet,
		label: "Revenus", labelEn: "Income",
		gradient: "bg-gradient-to-br from-green-400 to-emerald-600",
		shadowColor: "shadow-green-500/30",
		iconColor: "text-green-600",
	},
	[DocumentTypeCategory.Certificates]: {
		icon: ClipboardList,
		label: "Attestations", labelEn: "Certificates",
		gradient: "bg-gradient-to-br from-amber-400 to-yellow-600",
		shadowColor: "shadow-amber-500/30",
		iconColor: "text-amber-600",
	},
	[DocumentTypeCategory.OfficialCertificates]: {
		icon: FileCheck,
		label: "Certificats officiels", labelEn: "Official Certificates",
		gradient: "bg-gradient-to-br from-orange-400 to-orange-600",
		shadowColor: "shadow-orange-500/30",
		iconColor: "text-orange-600",
	},
	[DocumentTypeCategory.Justice]: {
		icon: Gavel,
		label: "Justice", labelEn: "Justice",
		gradient: "bg-gradient-to-br from-red-400 to-red-600",
		shadowColor: "shadow-red-500/30",
		iconColor: "text-red-600",
	},
	[DocumentTypeCategory.AdministrativeDecisions]: {
		icon: Landmark,
		label: "Décisions admin.", labelEn: "Administrative Decisions",
		gradient: "bg-gradient-to-br from-purple-400 to-purple-600",
		shadowColor: "shadow-purple-500/30",
		iconColor: "text-purple-600",
	},
	[DocumentTypeCategory.Housing]: {
		icon: Building2,
		label: "Logement", labelEn: "Housing",
		gradient: "bg-gradient-to-br from-teal-400 to-teal-600",
		shadowColor: "shadow-teal-500/30",
		iconColor: "text-teal-600",
	},
	[DocumentTypeCategory.Vehicle]: {
		icon: Car,
		label: "Véhicule", labelEn: "Vehicle",
		gradient: "bg-gradient-to-br from-slate-400 to-gray-600",
		shadowColor: "shadow-slate-500/30",
		iconColor: "text-slate-600",
	},
	[DocumentTypeCategory.Education]: {
		icon: GraduationCap,
		label: "Éducation", labelEn: "Education",
		gradient: "bg-gradient-to-br from-amber-300 to-orange-500",
		shadowColor: "shadow-amber-500/30",
		iconColor: "text-amber-600",
	},
	[DocumentTypeCategory.LanguageIntegration]: {
		icon: Languages,
		label: "Langue & intégration", labelEn: "Language & Integration",
		gradient: "bg-gradient-to-br from-blue-400 to-blue-600",
		shadowColor: "shadow-blue-500/30",
		iconColor: "text-blue-600",
	},
	[DocumentTypeCategory.Health]: {
		icon: Heart,
		label: "Santé", labelEn: "Health",
		gradient: "bg-gradient-to-br from-rose-400 to-red-600",
		shadowColor: "shadow-rose-500/30",
		iconColor: "text-rose-600",
	},
	[DocumentTypeCategory.Taxation]: {
		icon: Receipt,
		label: "Fiscalité", labelEn: "Taxation",
		gradient: "bg-gradient-to-br from-lime-400 to-lime-600",
		shadowColor: "shadow-lime-500/30",
		iconColor: "text-lime-600",
	},
	[DocumentTypeCategory.Other]: {
		icon: FileIcon,
		label: "Divers", labelEn: "Other",
		gradient: "bg-gradient-to-br from-stone-400 to-neutral-600",
		shadowColor: "shadow-stone-500/30",
		iconColor: "text-stone-600",
	},
};

export function getCategoryConfigFromFolder(foldername: string) {
	// A simple heuristic to map folder names to a DocumentTypeCategory
	const search = foldername.toLowerCase();
	if (search.includes("form") || search.includes("demande")) return CATEGORY_CONFIG[DocumentTypeCategory.Forms];
	if (search.includes("identité") || search.includes("identity") || search.includes("passeport") || search.includes("carte") || search.includes("cni")) return CATEGORY_CONFIG[DocumentTypeCategory.Identity];
	if (search.includes("civil") || search.includes("naissance") || search.includes("mariage")) return CATEGORY_CONFIG[DocumentTypeCategory.CivilStatus];
	if (search.includes("nationalité") || search.includes("nationality")) return CATEGORY_CONFIG[DocumentTypeCategory.Nationality];
	if (search.includes("résidence") || search.includes("residence") || search.includes("domicile")) return CATEGORY_CONFIG[DocumentTypeCategory.Residence];
	if (search.includes("emploi") || search.includes("travail") || search.includes("contrat")) return CATEGORY_CONFIG[DocumentTypeCategory.Employment];
	if (search.includes("revenu") || search.includes("salaire") || search.includes("fiche de paie") || search.includes("banque")) return CATEGORY_CONFIG[DocumentTypeCategory.Income];
	if (search.includes("officiel") || search.includes("certificat")) return CATEGORY_CONFIG[DocumentTypeCategory.OfficialCertificates];
	if (search.includes("attestation") || search.includes("justificatif")) return CATEGORY_CONFIG[DocumentTypeCategory.Certificates];
	if (search.includes("justice") || search.includes("pénal") || search.includes("casier") || search.includes("tribunal")) return CATEGORY_CONFIG[DocumentTypeCategory.Justice];
	if (search.includes("logement") || search.includes("bail") || search.includes("loyer")) return CATEGORY_CONFIG[DocumentTypeCategory.Housing];
	if (search.includes("véhicule") || search.includes("voiture") || search.includes("permis") || search.includes("carte grise")) return CATEGORY_CONFIG[DocumentTypeCategory.Vehicle];
	if (search.includes("éduc") || search.includes("diplôme") || search.includes("scol") || search.includes("étud")) return CATEGORY_CONFIG[DocumentTypeCategory.Education];
	if (search.includes("langue") || search.includes("intégration")) return CATEGORY_CONFIG[DocumentTypeCategory.LanguageIntegration];
	if (search.includes("santé") || search.includes("médical") || search.includes("assurance") || search.includes("vitale") || search.includes("mutuelle")) return CATEGORY_CONFIG[DocumentTypeCategory.Health];
	if (search.includes("fiscal") || search.includes("impôt") || search.includes("tax")) return CATEGORY_CONFIG[DocumentTypeCategory.Taxation];
	
	// Default
	return CATEGORY_CONFIG[DocumentTypeCategory.Other];
}
