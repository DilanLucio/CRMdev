# DevCRM Lead Ingestion Agent

Two scripts:

| File | Purpose |
|---|---|
| `opportunity_ingest_client.py` | Low-level HTTP client. POST `/api/opportunities` with retry/backoff. Reusable library. |
| `gemini_orchestrator.py` | LLM orchestrator. Gemini 2.5 Flash extracts structured lead from raw text → calls ingest client. |

## Setup

```powershell
# 1. install deps
cd tools/agent
python -m pip install -r requirements.txt

# 2. configure secrets
copy .env.example .env
# edit .env: paste your GEMINI_API_KEY (from https://aistudio.google.com/apikey)
```

## Run

```powershell
# stdin input
echo "Hola, soy Ana de Acme. Necesitamos un ERP para 50 usuarios. ana@acme.com" `
  | python gemini_orchestrator.py

# file input
python gemini_orchestrator.py --file leads/inbound-1.txt

# dry run (extract only, no POST)
python gemini_orchestrator.py --dry-run < lead.txt
```

## Output

```
[gemini] model=gemini-2.5-flash input_chars=180
[gemini] extracted: {"companyName":"Acme","contactName":"Ana","contactEmail":"ana@acme.com","developmentPossibility":"## ERP\n- 50 users\n- ..."}
OK id=a1b2c3... status=0 company=Acme
```

`status=0` = `AiGenerated` (DevCRM enum).

## Idempotency

`OpportunityPayload.with_deterministic_id` hashes `company:email` → `externalLeadId`. Re-running with the same lead returns the same `id` (no duplicate row). Safe to retry.

## Non-leads

If Gemini classifies input as spam/irrelevant, it returns `companyName=""` and the script exits 0 without POSTing.
