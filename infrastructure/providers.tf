terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "4.20.0"
    }

    kubernetes ={
      source = "hashicorp/kubernetes"
      version = "2.11.0"
    }
  }
}

provider "google" {
  credentials = file("service-account-credentials.json")

  project = var.project
  region  = var.region
}

data "google_client_config" "default" {
  depends_on = [
    google_container_cluster.cluster
  ]
}

provider "kubernetes" {
  host = "https://${google_container_cluster.cluster.endpoint}"

  token = data.google_client_config.default.access_token
  client_certificate = base64decode(google_container_cluster.cluster.master_auth.0.client_certificate)
  client_key = base64decode(google_container_cluster.cluster.master_auth.0.client_key)
  cluster_ca_certificate = base64decode(google_container_cluster.cluster.master_auth.0.cluster_ca_certificate)
}
