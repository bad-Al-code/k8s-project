#/bin/bash

kind create cluster --config kind/kind-cluster.yml
kind load docker-image grafana/promtail:3.5 --name observability-cluster
kind load docker-image grafana/grafana:11.4.5 --name observability-cluster
kind load docker-image user-api:1.0 --name observability-cluster
kind load docker-image grafana/loki:3.5 --name observability-cluster
kind load docker-image product-catalog:1.0 --name observability-cluster
kind load docker-image prom/prometheus:v3.3.0-rc.0 --name observability-cluster
kind load docker-image prom/node-exporter:v1.9.1 --name observability-cluster

kubectl apply -f application
kubectl apply -f monitoring
kubectl apply -f monitoring/grafana 
kubectl apply -f monitoring/kube-state-metrics
kubectl apply -f monitoring/loki
kubectl apply -f monitoring/node-exporter
kubectl apply -f monitoring/prometheus
kubectl apply -f monitoring/promtail
