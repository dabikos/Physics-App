"""Railway cron: 07:00 UTC = 12:00 Kazakhstan. Never print the shared secret."""

import argparse
from datetime import datetime, timedelta, timezone
import json
import os
import sys
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit
from urllib.request import Request, urlopen


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true", help="Validate endpoint/auth and count recipients without sending")
    args = parser.parse_args()
    local = datetime.now(timezone(timedelta(hours=5)))
    if not args.dry_run and local.hour != 12:
        print(json.dumps({"skipped": "outside_noon_window", "date": local.date().isoformat()}))
        return 0
    endpoint = os.environ.get("DAILY_PUSH_URL", "").rstrip("/")
    secret = os.environ.get("CRON_SECRET", "")
    if not secret or urlsplit(endpoint).scheme != "https" or not endpoint.endswith("/api/cron/daily-push"):
        print("Daily push configuration is missing or invalid", file=sys.stderr)
        return 1
    if args.dry_run:
        endpoint += "?dry_run=true"
    request = Request(endpoint, method="POST", headers={"X-Cron-Secret": secret}, data=b"")
    try:
        # No automatic retries: server holds durable per-user/day dispatch claims.
        with urlopen(request, timeout=600) as response:
            result = json.load(response)
        print(json.dumps(result, ensure_ascii=False))
        return 0
    except HTTPError as error:
        print(f"Daily push HTTP error: {error.code}", file=sys.stderr)
    except (URLError, TimeoutError, ValueError):
        print("Daily push request failed", file=sys.stderr)
    return 1


if __name__ == "__main__":
    sys.exit(main())
