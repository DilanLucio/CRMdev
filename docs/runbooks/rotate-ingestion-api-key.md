# Runbook: Rotate Ingestion API Key

**Scope:** `Ingestion:ApiKeys` in `appsettings.json` / environment variables.  
**Risk:** Low (zero-downtime if done correctly). Duration: ~5 min.

---

## When to rotate

- Suspected key leak (check git history, CI logs, Slack).
- Scheduled rotation (every 90 days recommended).
- Offboarding an AI agent that had access.

---

## Zero-downtime rotation procedure

ASP.NET Core reads `Ingestion:ApiKeys` as a **list** — multiple keys are valid simultaneously.

### Step 1 — Generate new key

```powershell
[System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

Copy the output (e.g. `abc123...`).

### Step 2 — Add new key alongside the old one

In `appsettings.Production.json` (or environment variable override):

```json
"Ingestion": {
  "ApiKeys": [
    "OLD_KEY_STILL_VALID",
    "NEW_KEY_abc123"
  ]
}
```

Deploy / restart the app. Both keys now accepted.

### Step 3 — Update the AI agent

Set `DEVCRM_API_KEY=NEW_KEY_abc123` in the agent's environment / secrets store.  
Verify with the smoke test:

```powershell
.\tools\smoke\opportunity-ingest.ps1 -ApiKey "NEW_KEY_abc123"
```

Expected: `PASS  status=AiGenerated`.

### Step 4 — Remove the old key

Remove `OLD_KEY_STILL_VALID` from the key list. Deploy again.

```json
"Ingestion": {
  "ApiKeys": [ "NEW_KEY_abc123" ]
}
```

### Step 5 — Verify

Run smoke test again. Run `dotnet test` locally.

---

## CORS note

`POST /api/opportunities` is protected by `[ApiKeyAuth]`. Even if the browser origin is in the CORS allow-list, a request without a valid `X-Api-Key` header returns `401`. The agent (server-side) is the only caller; the frontend never POSTs to this endpoint.

---

## Emergency revocation (immediate)

Set `Ingestion:ApiKeys` to an empty list `[]` and redeploy. All ingestion halts instantly. No leads are lost — the agent will retry on `5xx` equivalent (actually gets `401`/`403` — **does not retry 4xx**; queue the leads manually).

---

## Audit

After rotation, query the audit log to confirm no suspicious activity with the old key:

```sql
SELECT * FROM OpportunityAuditLogs
WHERE Action = 'Ingested'
  AND At > DATEADD(day, -7, GETUTCDATE())
ORDER BY At DESC;
```
