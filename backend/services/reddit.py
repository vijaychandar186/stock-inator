from __future__ import annotations
import requests
import xml.etree.ElementTree as ET
import logging
import hashlib
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from config import config

logger = logging.getLogger(__name__)

_NS = "http://www.w3.org/2005/Atom"

_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept": "application/rss+xml, application/xml, text/xml",
}


def fetch_posts(ticker: str) -> list[dict]:
    posts: list[dict] = []

    for sub_name in config.SUBREDDITS:
        try:
            resp = requests.get(
                f"{config.REDDIT_BASE_URL}/r/{sub_name}/search.rss",
                headers=_HEADERS,
                params={
                    "q": ticker,
                    "sort": "relevance",
                    "restrict_sr": "on",
                    "t": "month",
                    "limit": config.POSTS_PER_SUB,
                },
                timeout=10,
            )
            resp.raise_for_status()
            root = ET.fromstring(resp.content)
            entries = root.findall(f"{{{_NS}}}entry")
            logger.info("r/%s returned %d posts for %s", sub_name, len(entries), ticker)
            for entry in entries:
                title = entry.findtext(f"{{{_NS}}}title", "").strip()
                url = ""
                for link in entry.findall(f"{{{_NS}}}link"):
                    if link.get("rel") == "alternate":
                        url = link.get("href", "")
                        break
                content = entry.findtext(f"{{{_NS}}}content", "")
                updated = entry.findtext(f"{{{_NS}}}updated", "")
                try:
                    dt = datetime.fromisoformat(updated.replace("Z", "+00:00"))
                except Exception:
                    dt = datetime.now(tz=timezone.utc)
                created_utc = int(dt.timestamp())
                post_id = hashlib.md5(url.encode()).hexdigest()[:8]
                posts.append({
                    "id": post_id,
                    "title": title,
                    "text": content[:300],
                    "score": 0,
                    "url": url,
                    "subreddit": sub_name,
                    "num_comments": 0,
                    "created_utc": created_utc,
                    "created_date": dt.strftime("%Y-%m-%d"),
                })
        except Exception as e:
            logger.warning("r/%s fetch failed: %s", sub_name, e)
            continue

    posts.sort(key=lambda p: p["created_utc"], reverse=True)
    return posts
