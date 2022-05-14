terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "4.20.0"
    }
  }
}

provider "google" {
  credentials = file("service-account-credentials.json")

  project = var.project
  region  = var.region
}