#!/bin/bash

# ══════════════════════════════════════════════════════════
# GCLOUD DEPLOY SCRIPT (Mode Économique - Correction)
# Projet: Digitalium.io
# ══════════════════════════════════════════════════════════

PROJECT_ID="digitalium-ga"
INSTANCE_NAME="digitalium-db"

echo "🔍 Vérification de l'instance '$INSTANCE_NAME'..."

if gcloud sql instances describe $INSTANCE_NAME --project=$PROJECT_ID >/dev/null 2>&1; then
    echo "⚠️  L'instance existe déjà. Application des correctifs pour réduire les coûts..."
    
    # Correction: On retire --disk-autoresize qui n'existe pas pour 'patch'
    # On force ZONAL pour désactiver la Haute Disponibilité (coût / 2)
    # On force db-f1-micro
    gcloud sql instances patch $INSTANCE_NAME \
        --project=$PROJECT_ID \
        --tier=db-f1-micro \
        --availability-type=ZONAL \
        --storage-auto-increase

    echo "✅ Instance mise à jour."
else
    echo "🆕 Création d'une nouvelle instance en mode économique..."
    # Pour la création, --disk-autoresize est valide
    gcloud sql instances create $INSTANCE_NAME \
        --project=$PROJECT_ID \
        --region="europe-west1" \
        --database-version=POSTGRES_15 \
        --tier=db-f1-micro \
        --availability-type=ZONAL \
        --storage-type=HDD \
        --storage-size=10 \
        --disk-autoresize \
        --root-password="ChangezMoiImmédiatement123!"

    echo "✅ Instance créée avec succès."
fi

# Vérification finale
echo "📊 État final :"
gcloud sql instances describe $INSTANCE_NAME --project=$PROJECT_ID --format="table(name, settings.tier, settings.availabilityType, state)"
