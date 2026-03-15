from __future__ import annotations
import requests
import logging
from datetime import datetime
from config import config

logger = logging.getLogger(__name__)

_SENTIMENT_MAP = {
    "Bullish": "positive",
    "Somewhat-Bullish": "positive",
    "Bearish": "negative",
    "Somewhat-Bearish": "negative",
    "Neutral": "neutral",
}


def fetch_news(ticker: str) -> list[dict]:
    try:
        resp = requests.get(
            config.ALPHA_VANTAGE_BASE_URL,
            params={
                "function": "NEWS_SENTIMENT",
                "tickers": ticker.upper(),
                "limit": 50,
                "sort": "LATEST",
                "apikey": config.ALPHA_VANTAGE_API_KEY,
            },
            timeout=15,
        )
        resp.raise_for_status()
        data = resp.json()

        if "feed" not in data:
            logger.warning("AV news no feed: %s", data)
            return []

        articles = []
        for item in data["feed"]:
            av_label = item.get("overall_sentiment_label", "Neutral")
            score = float(item.get("overall_sentiment_score", 0))
            label = _SENTIMENT_MAP.get(av_label, "neutral")

            # Parse date: "20240115T120000" -> "2024-01-15"
            raw_date = item.get("time_published", "")
            try:
                created_date = datetime.strptime(raw_date[:8], "%Y%m%d").strftime("%Y-%m-%d")
                created_utc = int(datetime.strptime(raw_date[:15], "%Y%m%dT%H%M%S").timestamp())
            except ValueError:
                created_date = ""
                created_utc = 0

            articles.append({
                "id": item.get("url", "")[-16:],
                "title": item["title"],
                "text": item.get("summary", "")[:300],
                "score": 0,
                "url": item.get("url", ""),
                "subreddit": item.get("source", "News"),
                "num_comments": 0,
                "created_utc": created_utc,
                "created_date": created_date,
                "source": "news",
                "sentiment": {
                    "compound": round(score, 4),
                    "positive": round(score, 4) if score > 0 else 0,
                    "negative": round(abs(score), 4) if score < 0 else 0,
                    "neutral": round(1 - abs(score), 4),
                    "label": label,
                },
            })

        logger.info("AV news returned %d articles for %s", len(articles), ticker)
        return articles

    except Exception as e:
        logger.warning("AV news fetch failed: %s", e)
        return []
