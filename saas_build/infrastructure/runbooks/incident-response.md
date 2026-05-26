# MySchool App — Incident Response Runbooks

## RTO: 15 minutes | RPO: 5 minutes

---

## 🚨 API Pod Down

```bash
# 1. Check pod status
kubectl get pods -l app=myschoolapp-api

# 2. Check logs
kubectl logs -l app=myschoolapp-api --previous --tail=100

# 3. Check events
kubectl describe pod <pod-name>

# 4. If crash loop — rollback
kubectl rollout undo deployment/myschoolapp-api

# 5. Verify rollback
kubectl rollout status deployment/myschoolapp-api
```

## 🗄️ Database Connection Exhaustion

```bash
# 1. Check active connections
kubectl exec -it postgres-0 -- psql -U postgres -c "SELECT count(*) FROM pg_stat_activity;"

# 2. Kill idle connections
kubectl exec -it postgres-0 -- psql -U postgres -c "
  SELECT pg_terminate_backend(pid)
  FROM pg_stat_activity
  WHERE datname = 'myschoolapp'
    AND state = 'idle'
    AND query_start < NOW() - INTERVAL '5 minutes';
"

# 3. Restart PgBouncer pool
kubectl rollout restart deployment/pgbouncer

# 4. Scale down API replicas temporarily
kubectl scale deployment/myschoolapp-api --replicas=1
```

## 🔴 High Error Rate

```bash
# 1. Check recent errors
kubectl logs -l app=myschoolapp-api --since=5m | grep ERROR | tail -50

# 2. Check which endpoint is failing
# Grafana: HTTP Requests dashboard -> filter by status=5xx

# 3. Check DB slow queries
kubectl exec -it postgres-0 -- psql -U postgres -c "
  SELECT query, calls, mean_exec_time
  FROM pg_stat_statements
  ORDER BY mean_exec_time DESC LIMIT 10;
"

# 4. If specific tenant — suspend temporarily
curl -X POST https://api.myschoolapp.pk/tenants/<id>/suspend   -H "Authorization: Bearer $SUPER_ADMIN_TOKEN"
```

## 🔄 Kafka Consumer Lag

```bash
# 1. Check consumer group lag
kubectl exec -it kafka-0 -- kafka-consumer-groups.sh   --bootstrap-server localhost:9092   --describe --group myschoolapp-consumers

# 2. Scale consumers
kubectl scale deployment/myschoolapp-api --replicas=6

# 3. If DLQ is filling up
kubectl exec -it kafka-0 -- kafka-console-consumer.sh   --bootstrap-server localhost:9092   --topic myschoolapp.dlq   --from-beginning --max-messages 10
```

## 🌐 Region Failover (AWS ap-south-1 outage)

```bash
# 1. Update Route 53 failover
aws route53 change-resource-record-sets   --hosted-zone-id $ZONE_ID   --change-batch file://infrastructure/route53/failover-to-singapore.json

# 2. Verify Singapore cluster is healthy
kubectl --context=aws-ap-southeast-1 get pods

# 3. Scale up Singapore
kubectl --context=aws-ap-southeast-1 scale deployment/myschoolapp-api --replicas=5

# 4. Notify tenants via SMS
node infrastructure/scripts/notify-all-tenants.js "Temporary maintenance"
```

---

## SLO Definitions

| Service | Availability SLO | Latency SLO (p95) |
|---------|-----------------|-------------------|
| API (reads) | 99.9% | < 200ms |
| API (writes) | 99.9% | < 350ms |
| WebSocket | 99.5% | < 1s |
| Notifications | 99.0% | < 30s |
| Platform overall | 99.99% | — |
