provider "google" {
  project = var.project_id
  region  = var.region
}

variable "project_id" {
  description = "L'ID du projet Google Cloud"
  type        = string
}

variable "region" {
  description = "La région GCP (ex: europe-west1)"
  type        = string
  default     = "europe-west1"
}

variable "db_password" {
  description = "Le mot de passe pour l'utilisateur de la base de données"
  type        = string
  sensitive   = true
}

# ══════════════════════════════════════════════════════════
# CLOUD SQL INSTANCE (Configuration Économique)
# ══════════════════════════════════════════════════════════

resource "google_sql_database_instance" "main" {
  name             = "digitalium-db"
  database_version = "POSTGRES_15"
  region           = var.region

  settings {
    # 🛑 CONFIGURATION CRITIQUE POUR ÉVITER LES SURCOÛTS (>100€/jour -> ~10€/mois)
    tier              = "db-f1-micro"   # Instance partagée (suffisant pour dev/test)
    availability_type = "ZONAL"         # Pas de haute disponibilité (divise le coût par 2)
    disk_size         = 10              # Taille minimale (10 Go)
    disk_type         = "PD_HDD"        # Disque standard (moins cher que SSD, suffisant pour dev)

    backup_configuration {
      enabled    = false                # Désactiver les backups auto en dev pour économiser
      start_time = "02:00"              # Si activé, backup à 2h du matin
    }
  }

  deletion_protection = false           # Permet de détruire l'instance via Terraform (attention en prod !)
}

# ══════════════════════════════════════════════════════════
# DATABASE & USER
# ══════════════════════════════════════════════════════════

resource "google_sql_database" "database" {
  name     = "digitalium"
  instance = google_sql_database_instance.main.name
}

resource "google_sql_user" "users" {
  name     = "digitalium_user"
  instance = google_sql_database_instance.main.name
  password = var.db_password
}
