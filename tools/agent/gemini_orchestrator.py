"""
Gemini-powered lead extraction orchestrator for DevCRM.

Pipeline:
  raw text (stdin / --file)
    -> Gemini 2.5 Flash with structured JSON schema
    -> validate fields
    -> POST /api/opportunities via opportunity_ingest_client

Usage:
  python gemini_orchestrator.py < lead.txt
  python gemini_orchestrator.py --file path/to/lead.txt
  echo "..." | python gemini_orchestrator.py --dry-run
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
from pathlib import Path

from dotenv import load_dotenv
from google import genai
from google.genai import errors as genai_errors
from google.genai import types

from opportunity_ingest_client import OpportunityPayload, ingest


SYSTEM_PROMPT = """You extract sales lead data from raw input (email, message, transcript, web form).

Return ONLY the JSON object matching the schema. No prose, no markdown fences.

Rules:
- companyName: legal/brand name of the prospect company.
- contactName: full name of the human contact.
- contactEmail: lowercase, valid format. If absent, return empty string.
- developmentPossibility: markdown summary (2-6 lines) of what the client needs, scope hints, pain points. Use bullet lists when applicable. Spanish or English — match the input language.

If the input is not a lead (spam, irrelevant), set companyName="" so the caller can skip ingestion."""


RESPONSE_SCHEMA = {
    "type": "object",
    "properties": {
        "companyName":            {"type": "string"},
        "contactName":            {"type": "string"},
        "contactEmail":           {"type": "string"},
        "developmentPossibility": {"type": "string"},
    },
    "required": ["companyName", "contactName", "contactEmail", "developmentPossibility"],
}


def extract_lead(
    raw_text: str,
    *,
    api_key: str,
    model: str,
    fallback_model: str = "gemini-2.5-flash-lite",
    max_retries: int = 4,
    base_delay: float = 2.0,
) -> dict:
    client = genai.Client(api_key=api_key)
    config = types.GenerateContentConfig(
        system_instruction=SYSTEM_PROMPT,
        response_mime_type="application/json",
        response_schema=RESPONSE_SCHEMA,
        temperature=0.1,
    )

    models_to_try = [model] + ([fallback_model] if fallback_model != model else [])

    last_error: Exception | None = None
    for current_model in models_to_try:
        for attempt in range(max_retries):
            try:
                response = client.models.generate_content(
                    model=current_model, contents=raw_text, config=config
                )
                if current_model != model:
                    print(f"[gemini] fell back to {current_model}", file=sys.stderr)
                return json.loads(response.text)
            except genai_errors.ServerError as exc:
                last_error = exc
                delay = base_delay * (2 ** attempt)
                print(
                    f"[gemini] {current_model} 5xx attempt {attempt + 1}/{max_retries}; sleep {delay:.1f}s",
                    file=sys.stderr,
                )
                time.sleep(delay)
            except genai_errors.ClientError:
                raise

    raise RuntimeError("Gemini exhausted retries on all models") from last_error


def main() -> int:
    parser = argparse.ArgumentParser(description="Gemini lead extractor + DevCRM ingester")
    parser.add_argument("--file", type=Path, help="Read raw text from file instead of stdin")
    parser.add_argument("--dry-run", action="store_true", help="Extract only, do not POST")
    args = parser.parse_args()

    load_dotenv(Path(__file__).parent / ".env")

    gemini_key = os.getenv("GEMINI_API_KEY")
    if not gemini_key:
        print("ERROR: GEMINI_API_KEY not set (copy .env.example to .env)", file=sys.stderr)
        return 2

    model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    devcrm_url = os.getenv("DEVCRM_URL", "http://localhost:5297")
    devcrm_key = os.getenv("DEVCRM_API_KEY", "dev-replace-before-prod")

    raw = args.file.read_text(encoding="utf-8") if args.file else sys.stdin.read()
    if not raw.strip():
        print("ERROR: empty input", file=sys.stderr)
        return 2

    print(f"[gemini] model={model} input_chars={len(raw)}", file=sys.stderr)
    lead = extract_lead(raw, api_key=gemini_key, model=model)
    print(f"[gemini] extracted: {json.dumps(lead, ensure_ascii=False)}", file=sys.stderr)

    if not lead.get("companyName"):
        print("SKIP: Gemini classified input as non-lead", file=sys.stderr)
        return 0

    if args.dry_run:
        print(json.dumps(lead, indent=2, ensure_ascii=False))
        return 0

    payload = OpportunityPayload.with_deterministic_id(
        company_name=lead["companyName"],
        contact_name=lead["contactName"],
        contact_email=lead["contactEmail"],
        development_possibility=lead["developmentPossibility"],
    )

    result = ingest(payload, base_url=devcrm_url, api_key=devcrm_key)
    print(f"OK id={result['id']} status={result['status']} company={lead['companyName']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
