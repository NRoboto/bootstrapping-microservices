resource "google_container_registry" "flixtube" {}

output "registry_bucket_link" {
  value = google_container_registry.flixtube.bucket_self_link
}

output "registry_id" {
  value = google_container_registry.flixtube.id
}