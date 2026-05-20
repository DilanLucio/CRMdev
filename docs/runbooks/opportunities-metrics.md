# Runbook: Opportunities Metrics

**Endpoint:** `GET /metrics` (Prometheus text format, port shared with API).
**Source:** OpenTelemetry .NET SDK + Prometheus AspNetCore exporter, registered in `Program.cs`.

---

## Exposed metrics

| Metric | Type | Labels | Meaning |
|---|---|---|---|
| `opportunities_ingested_total` | counter | `status` | Total leads accepted via `POST /api/opportunities`. |
| `opportunities_status_changed_total` | counter | `from`, `to` | Human transitions on the review screen. |
| `opportunities_ingest_duration_ms` | histogram | — | Latency of the persist + audit insert path. |
| `http_server_request_duration` | histogram | `http.route`, `http.response.status_code`, `http.request.method` | ASP.NET Core auto-instrumentation. |

Meter source name: `DevCRM.Opportunities` (defined in `OpportunityMetrics.cs`).

---

## Prometheus scrape config

```yaml
scrape_configs:
  - job_name: devcrm-api
    metrics_path: /metrics
    scrape_interval: 15s
    static_configs:
      - targets: ['devcrm-api.internal:5000']
```

No auth on `/metrics` by default — restrict at the network layer (private subnet, mTLS sidecar, or reverse proxy ACL). Do NOT expose `/metrics` to the public internet.

---

## Useful queries

```promql
# Ingest rate (per minute) by current status
sum by (status) (rate(opportunities_ingested_total[5m])) * 60

# p95 ingest latency
histogram_quantile(0.95, rate(opportunities_ingest_duration_ms_bucket[5m]))

# Discard ratio over last hour
sum(rate(opportunities_status_changed_total{to="Discarded"}[1h]))
  / sum(rate(opportunities_status_changed_total[1h]))
```

---

## Smoke check

```powershell
Invoke-RestMethod http://localhost:5000/metrics | Select-String 'opportunities_'
```

Expected: at least the three `opportunities_*` series printed in Prometheus text format. If empty, verify `AddMeter("DevCRM.Opportunities")` is present in `Program.cs` and that `OpportunityMetrics` was resolved (i.e. at least one ingest has fired).
