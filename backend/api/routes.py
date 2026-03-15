from __future__ import annotations
import csv
import time
import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from flask import Blueprint, jsonify, request

DATA_DIR = Path(__file__).parent.parent.parent / "data"
RESULTS_FILE = DATA_DIR / "sentiment_log.jsonl"
POSTS_CSV = DATA_DIR / "posts.csv"

_CSV_HEADERS = ["timestamp", "ticker", "source", "title", "text", "url",
                "label", "compound", "positive", "negative", "neutral"]


def _save_result(ticker: str, sentiment: dict, stock: dict, sources: dict) -> None:
    entry = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "ticker": ticker,
        "sentiment": sentiment,
        "stock": {k: stock.get(k) for k in ("price", "change_pct", "currency")},
        "sources": sources,
    }
    with RESULTS_FILE.open("a") as f:
        f.write(json.dumps(entry) + "\n")


def _save_posts_csv(ticker: str, posts: list[dict]) -> None:
    write_header = not POSTS_CSV.exists() or POSTS_CSV.stat().st_size == 0
    ts = datetime.now(timezone.utc).isoformat()
    with POSTS_CSV.open("a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=_CSV_HEADERS)
        if write_header:
            writer.writeheader()
        for p in posts:
            s = p.get("sentiment", {})
            writer.writerow({
                "timestamp": ts,
                "ticker": ticker,
                "source": p.get("source", ""),
                "title": p.get("title", ""),
                "text": (p.get("text") or "")[:500],  # cap long bodies
                "url": p.get("url", ""),
                "label": s.get("label", ""),
                "compound": s.get("compound", ""),
                "positive": s.get("positive", ""),
                "negative": s.get("negative", ""),
                "neutral": s.get("neutral", ""),
            })
from services.reddit import fetch_posts
from services.news import fetch_news
from services.sentiment import analyze_posts, aggregate_sentiment, extract_word_frequencies, generate_wordcloud_image
from services.stock import fetch_stock_data

bp = Blueprint("api", __name__)
logger = logging.getLogger(__name__)

_cache: dict[str, tuple[float, dict]] = {}
CACHE_TTL = 600  # 10 minutes


def _get_cache(ticker: str) -> dict | None:
    entry = _cache.get(ticker)
    if entry and time.time() - entry[0] < CACHE_TTL:
        return entry[1]
    return None


def _set_cache(ticker: str, data: dict) -> None:
    _cache[ticker] = (time.time(), data)


@bp.get("/analyze")
def analyze():
    ticker = request.args.get("ticker", "").strip().upper()
    if not ticker or len(ticker) > 10:
        return jsonify({"error": "Invalid ticker symbol"}), 400

    cached = _get_cache(ticker)
    if cached:
        logger.info("Cache hit for %s", ticker)
        return jsonify(cached)

    reddit_posts = fetch_posts(ticker)
    news_articles = fetch_news(ticker)

    for p in reddit_posts:
        p.setdefault("source", "reddit")

    all_posts = reddit_posts + news_articles
    all_posts = analyze_posts(all_posts)

    sentiment = aggregate_sentiment(all_posts)
    stock = fetch_stock_data(ticker)
    word_frequencies = extract_word_frequencies(all_posts)
    wordcloud_image = generate_wordcloud_image(word_frequencies)

    top_posts = sorted(all_posts, key=lambda p: p["created_utc"], reverse=True)[:30]

    result = {
        "ticker": ticker,
        "sentiment": sentiment,
        "stock": stock,
        "posts": top_posts,
        "word_frequencies": word_frequencies,
        "wordcloud_image": wordcloud_image,
        "sources": {
            "reddit": len(reddit_posts),
            "news": len(news_articles),
        },
    }
    _set_cache(ticker, result)
    _save_result(ticker, sentiment, stock, result["sources"])
    _save_posts_csv(ticker, all_posts)
    return jsonify(result)


@bp.get("/health")
def health():
    return jsonify({"status": "ok"})
