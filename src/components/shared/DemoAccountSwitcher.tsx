"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users,
    ChevronDown,
    ChevronRight,
    LogIn,
    LogOut,
    Check,
    Loader2,
    X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

/* ═══════════════════════════════════════════════
   DEMO ACCOUNTS DATA
   ═══════════════════════════════════════════════ */

interface DemoAccount {
    email: string;
    password: string;
    role: string;
    roleLevel: number;
    description: string;
    spaces: string[];
    capabilities: string[];
    personaType: "platform" | "business" | "institutional";
}

interface DemoOrganization {
    id: string;
    name: string;
    type: "platform" | "enterprise" | "institution";
    description: string;
    icon: string;
    gradient: string;
    accounts: DemoAccount[];
}

const LEVEL_COLORS: Record<number, string> = {
    0: "bg-red-500",
    1: "bg-orange-500",
    2: "bg-violet-500",
    3: "bg-cyan-500",
    4: "bg-emerald-500",
    5: "bg-gray-400",
};

const LEVEL_BORDER_COLORS: Record<number, string> = {
    0: "border-l-red-500",
    1: "border-l-orange-500",
    2: "border-l-violet-500",
    3: "border-l-cyan-500",
    4: "border-l-emerald-500",
    5: "border-l-gray-400",
};

const TYPE_COLORS: Record<string, string> = {
    platform: "bg-red-500/10 text-red-400 border-red-500/20",
    enterprise: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    institution: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

const TYPE_LABELS: Record<string, string> = {
    platform: "Plateforme",
    enterprise: "Entreprise",
    institution: "Institution",
};

const DEMO_ORGANIZATIONS: DemoOrganization[] = [
    {
        id: "digitalium",
        name: "DIGITALIUM — Équipe Plateforme",
        type: "platform",
        description: "Gestion interne de la plateforme DIGITALIUM",
        icon: "🛡️",
        gradient: "from-red-500 to-orange-500",
        accounts: [
            {
                email: "demo-sysadmin@digitalium.ga",
                password: "demo123456",
                role: "System Admin",
                roleLevel: 0,
                description:
                    "Accès total à l'infrastructure et à la plateforme",
                spaces: ["/admin", "/sysadmin", "/subadmin"],
                capabilities: [
                    "Infrastructure",
                    "Monitoring",
                    "Sécurité",
                    "IAM",
                    "Toutes les organisations",
                ],
                personaType: "platform",
            },
            {
                email: "demo-admin@digitalium.ga",
                password: "demo123456",
                role: "Platform Admin",
                roleLevel: 1,
                description:
                    "Administration de la plateforme, organisations et utilisateurs",
                spaces: ["/admin", "/sysadmin", "/subadmin"],
                capabilities: [
                    "Dashboard KPI",
                    "Leads",
                    "Utilisateurs",
                    "Abonnements",
                    "Organisations",
                ],
                personaType: "platform",
            },
            {
                email: "ornella.doumba@digitalium.ga",
                password: "demo123456",
                role: "Platform Admin (Sous-admin)",
                roleLevel: 1,
                description:
                    "Sous-administratrice — utilise DIGITALIUM en interne",
                spaces: ["/admin", "/sysadmin", "/subadmin"],
                capabilities: [
                    "iDocument interne",
                    "iArchive interne",
                    "iSignature",
                    "Gestion clients",
                ],
                personaType: "platform",
            },
        ],
    },
    {
        id: "ascoma",
        name: "ASCOMA GABON — Assurance & Courtage",
        type: "enterprise",
        description: "PME d'assurance et courtage — exemple client entreprise",
        icon: "🏢",
        gradient: "from-violet-500 to-purple-500",
        accounts: [
            {
                email: "dg@ascoma.ga",
                password: "demo123456",
                role: "Directeur Général (Org Admin)",
                roleLevel: 2,
                description: "Administrateur de l'organisation ASCOMA",
                spaces: ["/subadmin", "/pro"],
                capabilities: [
                    "Config organisation",
                    "Gestion équipe",
                    "Tous les modules",
                    "Facturation",
                    "Analytics",
                ],
                personaType: "business",
            },
            {
                email: "commercial@ascoma.ga",
                password: "demo123456",
                role: "Responsable Commercial (Manager)",
                roleLevel: 3,
                description:
                    "Gère l'équipe commerciale et valide les documents",
                spaces: ["/pro"],
                capabilities: [
                    "Gestion équipe",
                    "Validation documents",
                    "iDocument",
                    "iArchive",
                    "iSignature",
                ],
                personaType: "business",
            },
            {
                email: "sinistres@ascoma.ga",
                password: "demo123456",
                role: "Responsable Sinistres (Manager)",
                roleLevel: 3,
                description:
                    "Gère le service sinistres et les dossiers clients",
                spaces: ["/pro"],
                capabilities: [
                    "Gestion sinistres",
                    "Validation",
                    "Archives clients",
                    "Workflows",
                ],
                personaType: "business",
            },
            {
                email: "agent@ascoma.ga",
                password: "demo123456",
                role: "Agent (Collaborateur)",
                roleLevel: 4,
                description:
                    "Collaborateur terrain — crée et édite des documents",
                spaces: ["/pro"],
                capabilities: [
                    "Créer documents",
                    "Uploader archives",
                    "Co-édition",
                    "Signer",
                ],
                personaType: "business",
            },
            {
                email: "juridique@ascoma.ga",
                password: "demo123456",
                role: "Juridique (Lecture seule)",
                roleLevel: 5,
                description:
                    "Consultation et audit — aucune modification possible",
                spaces: ["/pro"],
                capabilities: [
                    "Consultation documents",
                    "Lecture archives",
                    "Vérification signatures",
                    "Rapports",
                ],
                personaType: "business",
            },
        ],
    },
    {
        id: "ministere-peche",
        name: "MINISTÈRE DE LA PÊCHE — Institution",
        type: "institution",
        description:
            "Exemple d'institution gouvernementale avec hiérarchie",
        icon: "🏗️",
        gradient: "from-amber-500 to-orange-500",
        accounts: [
            {
                email: "ministre-peche@digitalium.io",
                password: "demo123456",
                role: "Ministre / Admin",
                roleLevel: 2,
                description: "Administrateur principal du ministère",
                spaces: ["/subadmin", "/institutional"],
                capabilities: [
                    "Config ministère",
                    "Tous les modules",
                    "Conformité",
                    "Audit",
                    "SSO",
                ],
                personaType: "institutional",
            },
            {
                email: "admin-peche@digitalium.io",
                password: "demo123456",
                role: "Admin Pêche (Co-admin)",
                roleLevel: 2,
                description: "Co-administrateur technique du ministère",
                spaces: ["/subadmin", "/institutional"],
                capabilities: [
                    "Config technique",
                    "Migration archives",
                    "Sécurité",
                    "Formation",
                ],
                personaType: "institutional",
            },
            {
                email: "dgpa@digitalium.io",
                password: "demo123456",
                role: "DGPA (Direction Générale)",
                roleLevel: 3,
                description:
                    "Direction Générale de la Pêche et de l'Aquaculture",
                spaces: ["/institutional"],
                capabilities: [
                    "Gestion direction",
                    "Validation",
                    "Documents officiels",
                    "Archives",
                ],
                personaType: "institutional",
            },
            {
                email: "anpa@digitalium.io",
                password: "demo123456",
                role: "ANPA (Agence Nationale)",
                roleLevel: 3,
                description:
                    "Agence Nationale de la Pêche — sous-organisation",
                spaces: ["/institutional"],
                capabilities: [
                    "Gestion agence",
                    "Rapports terrain",
                    "Archives terrain",
                ],
                personaType: "institutional",
            },
            {
                email: "inspecteur-peche@digitalium.io",
                password: "demo123456",
                role: "Inspecteur de terrain",
                roleLevel: 4,
                description:
                    "Agent de contrôle et inspection sur le terrain",
                spaces: ["/institutional"],
                capabilities: [
                    "Rapports inspection",
                    "Upload terrain",
                    "Documents de contrôle",
                ],
                personaType: "institutional",
            },
        ],
    },
];

/* ═══════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════ */

function getRedirectPath(account: DemoAccount): string {
    if (account.roleLevel <= 1) return "/admin";
    if (account.roleLevel === 2) {
        return account.personaType === "institutional"
            ? "/institutional"
            : "/subadmin";
    }
    if (account.personaType === "institutional") return "/institutional";
    return "/pro";
}

export default function DemoAccountSwitcher() {
    const [open, setOpen] = useState(false);
    const [expandedOrgs, setExpandedOrgs] = useState<string[]>(["digitalium"]);
    const [loading, setLoading] = useState<string | null>(null);
    const [confirmSwitch, setConfirmSwitch] = useState<DemoAccount | null>(null);
    const [currentEmail, setCurrentEmail] = useState<string | null>(null);
    const [firebaseReady, setFirebaseReady] = useState(false);
    const router = useRouter();

    // Lazy-load Firebase auth — only when Sheet opens for the first time
    useEffect(() => {
        if (!open || firebaseReady) return;
        let unsubscribe: (() => void) | undefined;
        import("@/lib/firebase").then(({ auth: firebaseAuth }) => {
            import("firebase/auth").then(({ onAuthStateChanged }) => {
                unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
                    setCurrentEmail(user?.email || null);
                });
                setFirebaseReady(true);
            });
        });
        return () => unsubscribe?.();
    }, [open, firebaseReady]);

    const toggleOrg = (id: string) => {
        setExpandedOrgs((prev) =>
            prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]
        );
    };

    const handleConnect = useCallback(
        async (account: DemoAccount) => {
            // If already logged in as this account, do nothing
            if (currentEmail === account.email) return;

            // If logged in as someone else, ask for confirmation
            if (currentEmail && currentEmail !== account.email) {
                setConfirmSwitch(account);
                return;
            }

            // Direct login
            setLoading(account.email);
            try {
                const { auth: firebaseAuth } = await import("@/lib/firebase");
                const { signInWithEmailAndPassword } = await import("firebase/auth");
                await signInWithEmailAndPassword(firebaseAuth, account.email, account.password);
                toast.success(
                    `Connecté en tant que ${account.role}`,
                    { description: account.email }
                );
                const path = getRedirectPath(account);
                router.push(path);
                setOpen(false);
            } catch {
                toast.error("Échec de la connexion", {
                    description: "Vérifiez votre connexion réseau",
                });
            } finally {
                setLoading(null);
            }
        },
        [currentEmail, router]
    );

    const handleConfirmSwitch = useCallback(
        async (account: DemoAccount) => {
            setConfirmSwitch(null);
            setLoading(account.email);
            try {
                const { auth: firebaseAuth } = await import("@/lib/firebase");
                const { signInWithEmailAndPassword, signOut: firebaseSignOut } = await import("firebase/auth");
                await firebaseSignOut(firebaseAuth);
                await signInWithEmailAndPassword(firebaseAuth, account.email, account.password);
                toast.success(
                    `Connecté en tant que ${account.role}`,
                    { description: account.email }
                );
                const path = getRedirectPath(account);
                router.push(path);
                setOpen(false);
            } catch {
                toast.error("Échec du changement de compte");
            } finally {
                setLoading(null);
            }
        },
        [router]
    );

    return (
        <>
            {/* ── Floating Button ── */}
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <motion.button
                            onClick={() => setOpen(true)}
                            className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-br from-digitalium-blue to-digitalium-violet flex items-center justify-center shadow-lg shadow-digitalium-blue/20 cursor-pointer"
                            initial={{ opacity: 0, y: 40, scale: 0.8 }}
                            animate={{
                                opacity: 1,
                                y: 0,
                                scale: [1, 1.03, 1],
                            }}
                            transition={{
                                opacity: { delay: 2, duration: 0.5 },
                                y: { delay: 2, duration: 0.5 },
                                scale: {
                                    delay: 3,
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                },
                            }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            aria-label="Ouvrir le sélecteur de comptes démo"
                        >
                            <Users className="h-6 w-6 text-white" />
                            {/* Badge */}
                            <span
                                className={`absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white ${currentEmail
                                    ? "bg-emerald-500"
                                    : "bg-red-500 animate-pulse"
                                    }`}
                            >
                                {currentEmail ? "✓" : "DÉMO"}
                            </span>
                        </motion.button>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="text-xs">
                        Explorer les comptes démo
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            {/* ── Sheet Panel ── */}
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent
                    side="right"
                    className="w-full sm:w-[420px] overflow-y-auto p-0 border-l border-white/5 bg-background"
                >
                    {/* Header */}
                    <SheetHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur-lg border-b border-white/5 p-5">
                        <SheetTitle className="flex items-center gap-2 text-lg">
                            <span>🎭</span>
                            Explorer DIGITALIUM
                        </SheetTitle>
                        <SheetDescription className="text-xs">
                            Connectez-vous avec un compte démo pour découvrir chaque rôle
                            et chaque espace de la plateforme.
                        </SheetDescription>
                        {currentEmail && (
                            <div className="flex items-center gap-2 mt-2">
                                <Badge
                                    variant="secondary"
                                    className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                >
                                    <Check className="h-3 w-3 mr-1" />
                                    {currentEmail}
                                </Badge>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 text-[10px] text-muted-foreground"
                                    onClick={async () => {
                                        const { auth: firebaseAuth } = await import("@/lib/firebase");
                                        const { signOut: firebaseSignOut } = await import("firebase/auth");
                                        await firebaseSignOut(firebaseAuth);
                                        toast.info("Déconnecté");
                                    }}
                                >
                                    <LogOut className="h-3 w-3 mr-1" /> Déconnexion
                                </Button>
                            </div>
                        )}
                    </SheetHeader>

                    {/* Org Accordions */}
                    <div className="p-4 space-y-3">
                        {DEMO_ORGANIZATIONS.map((org, orgIdx) => (
                            <motion.div
                                key={org.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: orgIdx * 0.05 }}
                                className="glass-card overflow-hidden"
                            >
                                {/* Org Header */}
                                <button
                                    onClick={() => toggleOrg(org.id)}
                                    className="w-full flex items-center gap-3 p-4 hover:bg-white/[0.02] transition-colors"
                                >
                                    <span className="text-xl">{org.icon}</span>
                                    <div className="flex-1 text-left min-w-0">
                                        <p className="text-sm font-semibold truncate">
                                            {org.name}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground">
                                            {org.description}
                                        </p>
                                    </div>
                                    <Badge
                                        variant="outline"
                                        className={`text-[9px] ${TYPE_COLORS[org.type]} flex-shrink-0`}
                                    >
                                        {TYPE_LABELS[org.type]}
                                    </Badge>
                                    <span className="text-[10px] text-muted-foreground flex-shrink-0">
                                        {org.accounts.length}
                                    </span>
                                    <ChevronDown
                                        className={`h-4 w-4 text-muted-foreground transition-transform flex-shrink-0 ${expandedOrgs.includes(org.id) ? "rotate-180" : ""
                                            }`}
                                    />
                                </button>

                                {/* Accounts */}
                                <AnimatePresence>
                                    {expandedOrgs.includes(org.id) && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-3 pb-3 space-y-2">
                                                {org.accounts.map((account) => {
                                                    const isActive = currentEmail === account.email;
                                                    const isLoading = loading === account.email;

                                                    return (
                                                        <div
                                                            key={account.email}
                                                            className={`rounded-lg border-l-[3px] ${LEVEL_BORDER_COLORS[account.roleLevel]} p-3 transition-all ${isActive
                                                                ? "bg-emerald-500/5 border border-emerald-500/20 rounded-l-none"
                                                                : "bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-l-none"
                                                                }`}
                                                        >
                                                            <div className="flex items-start justify-between gap-2 mb-1.5">
                                                                <div className="min-w-0">
                                                                    <div className="flex items-center gap-2">
                                                                        <span
                                                                            className={`h-2 w-2 rounded-full ${LEVEL_COLORS[account.roleLevel]}`}
                                                                        />
                                                                        <p className="text-sm font-semibold truncate">
                                                                            {account.role}
                                                                        </p>
                                                                        {isActive && (
                                                                            <Badge className="text-[8px] h-4 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                                                                                ✓ ACTIF
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-[11px] font-mono text-muted-foreground mt-0.5 truncate">
                                                                        {account.email}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <p className="text-[11px] text-muted-foreground mb-2">
                                                                {account.description}
                                                            </p>

                                                            {/* Space badges */}
                                                            <div className="flex flex-wrap gap-1 mb-2">
                                                                {account.spaces.map((s) => (
                                                                    <Badge
                                                                        key={s}
                                                                        variant="outline"
                                                                        className="text-[9px] h-4 px-1.5"
                                                                    >
                                                                        {s}
                                                                    </Badge>
                                                                ))}
                                                            </div>

                                                            {/* Capabilities */}
                                                            <div className="flex flex-wrap gap-1 mb-3">
                                                                {account.capabilities
                                                                    .slice(0, 3)
                                                                    .map((c) => (
                                                                        <span
                                                                            key={c}
                                                                            className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-muted-foreground"
                                                                        >
                                                                            {c}
                                                                        </span>
                                                                    ))}
                                                                {account.capabilities.length > 3 && (
                                                                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-muted-foreground">
                                                                        +{account.capabilities.length - 3}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* Connect button */}
                                                            <Button
                                                                size="sm"
                                                                variant={isActive ? "secondary" : "outline"}
                                                                className="w-full h-7 text-[11px]"
                                                                disabled={isActive || isLoading}
                                                                onClick={() => handleConnect(account)}
                                                            >
                                                                {isLoading ? (
                                                                    <>
                                                                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                                                        Connexion…
                                                                    </>
                                                                ) : isActive ? (
                                                                    <>
                                                                        <Check className="h-3 w-3 mr-1" />
                                                                        Connecté
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <LogIn className="h-3 w-3 mr-1" />
                                                                        Se connecter
                                                                        <ChevronRight className="h-3 w-3 ml-auto" />
                                                                    </>
                                                                )}
                                                            </Button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="sticky bottom-0 bg-background/95 backdrop-blur-lg border-t border-white/5 p-4 text-center">
                        <p className="text-[10px] text-muted-foreground">
                            Tous les comptes utilisent le mot de passe :{" "}
                            <code className="text-foreground">demo123456</code>
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                            🔐 Ces comptes sont réservés à la démonstration
                        </p>
                    </div>
                </SheetContent>
            </Sheet>

            {/* ── Confirm Switch Dialog ── */}
            <AnimatePresence>
                {confirmSwitch && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
                        onClick={() => setConfirmSwitch(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="glass-card p-6 max-w-sm w-full"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold">Changer de compte</h3>
                                <button
                                    onClick={() => setConfirmSwitch(null)}
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">
                                Se déconnecter de{" "}
                                <span className="text-foreground font-medium">
                                    {currentEmail}
                                </span>{" "}
                                et se connecter en tant que{" "}
                                <span className="text-foreground font-medium">
                                    {confirmSwitch.role}
                                </span>{" "}
                                ?
                            </p>
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => setConfirmSwitch(null)}
                                >
                                    Annuler
                                </Button>
                                <Button
                                    size="sm"
                                    className="flex-1 bg-gradient-to-r from-digitalium-blue to-digitalium-violet"
                                    onClick={() => handleConfirmSwitch(confirmSwitch)}
                                >
                                    Confirmer
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
