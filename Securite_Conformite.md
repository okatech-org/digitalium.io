# Plan d'Implémentation : Sécurité & Conformité

Ce plan réplique la page de `Sécurité & Conformité` (NEXUS-ESPACE v4) dans les 2 grands environnements de la plateforme.

## A. Environnement Client (users)
Il existe 3 types d'organisation :

1. **Espace Pro (Entreprises) : `/pro`**
   - Implémentation : `/pro/compliance`
   - Navbar : [ProLayout](file:///Users/okatech/okatech-projects/digitalium.io/src/components/layout/ProLayout.tsx#449-652)

2. **Espace Institution : `/inst`**
   - Implémentation : `/inst/compliance`
   - *Statut : Finalisé*

3. **Espace Organisme : `/org`**
   - Implémentation : `/org/compliance`
   - Navbar : Layout approprié ou création

## B. Environnement Back-Office (Administrateur DIGITALIUM)
C'est un seul et même environnement fonctionnel (`Admin/Digitalium`), composé des 3 espaces d’administration suivants :

1. **`/admin`**
   - Implémentation : `/admin/compliance`
2. **`/sysadmin`**
   - Implémentation : `/sysadmin/compliance`
3. **`/subadmin`**
   - Implémentation : `/subadmin/compliance`

*(Note : Tous les espaces Back-Office pointeront vers des Layouts d'administration existants ou créés si nécessaire. Le code de la page [compliance](file:///Users/okatech/okatech-projects/digitalium.io/src/app/%28institutional%29/institutional/compliance) sera standard avec une couleur d'accentuation en Émeraude pour le Back-Office, Bleu/Cyan pour Pro, et Violet pour Org).*
