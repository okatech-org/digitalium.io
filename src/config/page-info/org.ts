import type { PageInfoMap } from "@/types/page-info";

export const ORG_PAGE_INFO: PageInfoMap = {
    compliance: {
        pageId: "org-compliance",
        titre: "Sécurité & Conformité",
        but: "Assurer la conformité réglementaire et la sécurité de l'espace de l'organisme.",
        description: "Tableau de bord de sécurité, résultats d'audits automatisés, respect des durées de rétention et journal d'accès.",
        elements: [
            { nom: "KPIs de sécurité", type: "carte", description: "Score de conformité et alertes" },
            { nom: "Contrôles en temps réel", type: "tableau", description: "Vérification des standards RGPD et légaux" },
            { nom: "Journal d'audit", type: "tableau", description: "Traçabilité complète des actions" },
        ],
        tachesDisponibles: ["Consulter l'état de conformité", "Générer un rapport d'audit", "Exporter les journaux d'accès"],
        liens: [],
        conseil: "Générez et exportez régulièrement vos rapports d'audit pour répondre aux exigences réglementaires de vos donateurs.",
    },
};
