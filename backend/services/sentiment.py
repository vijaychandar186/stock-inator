from __future__ import annotations
from nltk.sentiment.vader import SentimentIntensityAnalyzer
import nltk

try:
    nltk.data.find("sentiment/vader_lexicon.zip")
except LookupError:
    nltk.download("vader_lexicon", quiet=True)


_analyzer = SentimentIntensityAnalyzer()


def analyze_post(text: str) -> dict:
    scores = _analyzer.polarity_scores(text)
    compound = scores["compound"]
    if compound >= 0.05:
        label = "positive"
    elif compound <= -0.05:
        label = "negative"
    else:
        label = "neutral"
    return {
        "compound": round(compound, 4),
        "positive": round(scores["pos"], 4),
        "negative": round(scores["neg"], 4),
        "neutral": round(scores["neu"], 4),
        "label": label,
    }


def analyze_posts(posts: list[dict]) -> list[dict]:
    for post in posts:
        combined = f"{post['title']} {post['text']}"
        post["sentiment"] = analyze_post(combined)
    return posts


def aggregate_sentiment(posts: list[dict]) -> dict:
    if not posts:
        return {"positive": 0, "negative": 0, "neutral": 0, "positive_pct": 0.0, "negative_pct": 0.0, "neutral_pct": 0.0, "average_compound": 0.0, "total": 0}

    counts = {"positive": 0, "negative": 0, "neutral": 0}
    compound_sum = 0.0

    for post in posts:
        label = post["sentiment"]["label"]
        counts[label] += 1
        compound_sum += post["sentiment"]["compound"]

    total = len(posts)
    return {
        "positive": counts["positive"],
        "negative": counts["negative"],
        "neutral": counts["neutral"],
        "positive_pct": round(counts["positive"] / total * 100, 1),
        "negative_pct": round(counts["negative"] / total * 100, 1),
        "neutral_pct": round(counts["neutral"] / total * 100, 1),
        "average_compound": round(compound_sum / total, 4),
        "total": total,
    }


_STOP_WORDS = {
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "is", "are", "was", "be", "has", "have",
    "it", "its", "this", "that", "their", "they", "we", "i", "you", "he",
    "she", "as", "not", "no", "so", "do", "did", "will", "would", "can",
    "could", "should", "may", "might", "what", "which", "who", "how",
    "stock", "stocks", "share", "shares", "market", "trading", "trade",
    "price", "up", "down", "like", "just", "more", "about", "about",
    "new", "get", "got", "one", "two", "into", "out", "than", "then",
    "when", "if", "my", "your", "our", "buy", "sell", "year", "week",
    "today", "now", "after", "before", "been", "also", "s", "re", "t",
}


def extract_word_frequencies(posts: list[dict]) -> list[dict]:
    import re
    freq: dict[str, int] = {}
    for post in posts:
        text = f"{post['title']} {post.get('text', '')}"
        words = re.findall(r"[a-zA-Z]{3,}", text.lower())
        for word in words:
            if word not in _STOP_WORDS:
                freq[word] = freq.get(word, 0) + 1
    sorted_words = sorted(freq.items(), key=lambda x: x[1], reverse=True)[:60]
    return [{"word": w, "count": c} for w, c in sorted_words]


def generate_wordcloud_image(word_frequencies: list[dict]) -> str:
    import io, base64
    from wordcloud import WordCloud

    if not word_frequencies:
        return ""

    freq_dict = {item["word"]: item["count"] for item in word_frequencies}

    wc = WordCloud(
        width=900,
        height=380,
        background_color="#0f172a",
        colormap="plasma",
        max_words=60,
        prefer_horizontal=0.85,
        min_font_size=10,
    ).generate_from_frequencies(freq_dict)

    buf = io.BytesIO()
    wc.to_image().save(buf, format="PNG")
    buf.seek(0)
    return base64.b64encode(buf.read()).decode()
