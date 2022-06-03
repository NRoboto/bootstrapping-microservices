resource "google_service_account" "kubernetes_node_pool_service_worker" {
  account_id   = "${var.app_name}-kubernetes-node-pool"
  display_name = "Kubernetes node pool service worker"
}

resource "google_container_cluster" "cluster" {
  name     = var.app_name
  location = var.region

  remove_default_node_pool = true
  initial_node_count       = 1
}

resource "google_container_node_pool" "node_pool" {
  name       = "${var.app_name}-node-pool"
  location   = var.region
  cluster    = google_container_cluster.cluster.name
  node_count = 0

  node_config {
    preemptible  = true
    machine_type = "e2-standard-2"

    service_account = google_service_account.kubernetes_node_pool_service_worker.email
    oauth_scopes    = ["https://www.googleapis.com/auth/cloud-platform"]
  }

  autoscaling {
    max_node_count = 1
    min_node_count = 0
  }
}