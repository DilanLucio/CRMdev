"""
AI agent HTTP client for opportunity ingestion.
POST /api/opportunities with X-Api-Key header.
Retry with exponential backoff on 5xx. Never retries on 4xx.
"""

import hashlib
import json
import time
import urllib.error
import urllib.request
from dataclasses import dataclass
from typing import Optional


@dataclass
class OpportunityPayload:
    company_name: str
    contact_name: str
    contact_email: str
    development_possibility: str
    external_lead_id: Optional[str] = None

    def to_dict(self) -> dict:
        return {
            "companyName": self.company_name,
            "contactName": self.contact_name,
            "contactEmail": self.contact_email,
            "developmentPossibility": self.development_possibility,
            "externalLeadId": self.external_lead_id,
        }

    @classmethod
    def with_deterministic_id(cls, company_name: str, contact_email: str, **kwargs) -> "OpportunityPayload":
        """Produce a stable externalLeadId so retries are idempotent."""
        raw = f"{company_name}:{contact_email}".encode()
        lead_id = hashlib.sha256(raw).hexdigest()[:32]
        return cls(company_name=company_name, contact_email=contact_email, external_lead_id=lead_id, **kwargs)


def ingest(
    payload: OpportunityPayload,
    *,
    base_url: str,
    api_key: str,
    max_retries: int = 3,
    base_delay: float = 1.0,
) -> dict:
    """
    POST the payload to /api/opportunities.
    Returns the parsed response JSON on 201.
    Raises on 4xx (no retry) or after exhausting retries on 5xx.
    """
    url = f"{base_url.rstrip('/')}/api/opportunities"
    body = json.dumps(payload.to_dict()).encode()
    headers = {
        "Content-Type": "application/json",
        "X-Api-Key": api_key,
    }

    last_error: Optional[Exception] = None
    for attempt in range(max_retries):
        req = urllib.request.Request(url, data=body, headers=headers, method="POST")
        try:
            with urllib.request.urlopen(req) as resp:
                return json.loads(resp.read())
        except urllib.error.HTTPError as exc:
            if 400 <= exc.code < 500:
                raise RuntimeError(f"Client error {exc.code} — not retrying: {exc.read().decode()}") from exc
            last_error = exc
            delay = base_delay * (2 ** attempt)
            print(f"[attempt {attempt + 1}/{max_retries}] server error {exc.code}, retrying in {delay:.1f}s")
            time.sleep(delay)
        except urllib.error.URLError as exc:
            last_error = exc
            delay = base_delay * (2 ** attempt)
            print(f"[attempt {attempt + 1}/{max_retries}] connection error, retrying in {delay:.1f}s")
            time.sleep(delay)

    raise RuntimeError(f"Ingestion failed after {max_retries} attempts") from last_error


if __name__ == "__main__":
    import os

    payload = OpportunityPayload.with_deterministic_id(
        company_name="Demo Corp",
        contact_name="Demo User",
        contact_email="demo@example.com",
        development_possibility="## ERP\nNeeds full integration.",
    )

    result = ingest(
        payload,
        base_url=os.getenv("DEVCRM_URL", "http://localhost:5000"),
        api_key=os.getenv("DEVCRM_API_KEY", "dev-replace-before-prod"),
    )
    print(f"Ingested: id={result['id']} status={result['status']}")
