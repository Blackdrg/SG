# Chaos Testing Playbook

This playbook outlines chaos experiments for the SpiceGarden backend system.

## Prerequisites

1. Chaos Mesh installed: `kubectl apply -f https://mirrors.chaos-mesh.org/v2.5.0/install/manifests/crd/crd.yaml`
2. Prometheus/Grafana for monitoring
3. PagerDuty/Slack alerts configured

## Chaos Scenarios

### 1. Redis Failures (Cache/Delivery Tracking)

**Pod Failure:**
```bash
kubectl apply -f chaos-redis-pod-failure.yaml
```

**Network Delay:**
```bash
kubectl apply -f chaos-redis-network-delay.yaml
```

**Expected System Behavior:**
- Orders should still be placed (database fallback)
- Driver locations update with delay
- Session management degrades gracefully
- Cache miss penalty acceptable (<3s additional latency)

### 2. PostgreSQL Failures (Primary Database)

**Pod Failure:**
```bash
kubectl apply -f chaos-postgres-pod-failure.yaml
```

**Network Partition:**
```bash
kubectl apply -f chaos-postgres-network-partition.yaml
```

**Expected System Behavior:**
- Read replicas handle read queries
- Write queue buffers in Redis
- API returns 503 with retry-after header
- No data loss on recovery

### 3. WebSocket Connection Issues

**Network Delay:**
```bash
kubectl apply -f chaos-websocket-delay.yaml
```

**Expected System Behavior:**
- HTTP polling fallback for tracking
- Reconnection logic kicks in
- Missed updates sync on reconnect
- Client shows appropriate offline status

### 4. Payment Provider Failures

**Timeout Simulation:**
```bash
kubectl apply -f chaos-payment-timeout.yaml
```

**Expected System Behavior:**
- Payment marked as pending
- Webhook retry on Stripe side
- User notified of delay
- Order remains in PENDING state

## Running Experiments

### Manual Execution

```bash
# 1. Verify system is healthy
kubectl get pods -n spicegarden

# 2. Run chaos experiment
kubectl apply -f test/chaos/chaos-<component>-<failure>.yaml

# 3. Monitor metrics
kubectl port-forward -n spicegarden svc/prometheus 9090:9090
kubectl port-forward -n spicegarden svc/grafana 3000:3000

# 4. Check application logs
kubectl logs -n spicegarden deployment/backend -f

# 5. After test, verify recovery
kubectl delete -f test/chaos/chaos-<component>-<failure>.yaml
```

### Automated Chaos Runner

```bash
# Run all chaos scenarios in sequence
for file in test/chaos/*.yaml; do
  echo "Running chaos: $file"
  kubectl apply -f "$file"
  sleep 300  # 5 minutes per experiment
  kubectl delete -f "$file"
  sleep 60   # Recovery time
done
```

## Success Criteria

| Component | Metric | Threshold |
|-----------|--------|-----------|
| Redis Down | API Error Rate | < 5% |
| Redis Down | Order Placement | 95% success |
| Postgres Down | Read Availability | 80% success |
| Postgres Down | Write Buffering | 100% retained |
| WebSocket Down | Order Tracking | Falls back to HTTP |
| Payment Timeout | User Error Rate | 0% (graceful handling) |

## Recovery Verification

After each chaos experiment, verify:

1. **Data Integrity**: No orders lost, all transactions accounted for
2. **Service Recovery**: All pods back to Running state
3. **Performance**: No degradation compared to baseline
4. **User Impact**: Minimal to zero based on expected criteria