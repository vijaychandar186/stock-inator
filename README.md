# The Stock-Inator

> *"You see, I've built a device that scans the entire internet and tells me how people feel about stocks. With this, I shall take over the Tri-State Area's financial markets! ...Or at least know when to buy TSLA."*

A Doofenshmirtz-themed stock sentiment analysis tool that scans Reddit and news sources to gauge investor mood — because why conquer the Tri-State Area when you can conquer the market?

## Tech Stack

**Frontend:** Vite · TypeScript · Tailwind CSS v4 · Chart.js
**Backend:** Flask · Reddit Public API · VADER Sentiment · Alpha Vantage

## Project Structure

```
stock-sentiment-analysis/
├── backend/
│   ├── app.py                      # Flask entry point
│   ├── config.py                   # Environment config
│   ├── api/
│   │   └── routes.py               # REST API endpoints
│   └── services/
│       ├── reddit.py               # Reddit integration
│       ├── news.py                 # News scraping
│       ├── sentiment.py            # VADER sentiment analysis
│       └── stock.py                # Alpha Vantage stock prices
├── frontend/
│   └── src/
│       ├── api/client.ts           # API client
│       ├── components/             # UI components
│       ├── types/index.ts          # TypeScript types
│       └── utils/formatters.ts
├── data/
│   ├── sentiment_log.jsonl         # Per-search summary log
│   └── posts.csv                   # Every post/article with individual sentiment scores
└── .env.example
```

## Setup

### 1. Backend
```bash
cd backend
pip install -r ../requirements.txt
cp ../.env.example ../.env
# Fill in your API keys in .env
python app.py
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

## API Keys

### Reddit API
No credentials required — uses Reddit's public JSON endpoints.

### Alpha Vantage
1. Go to [alphavantage.co/support/#api-key](https://www.alphavantage.co/support/#api-key)
2. Register for free — key is shown instantly and emailed to you

```env
ALPHA_VANTAGE_API_KEY=your_key_here
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/analyze?ticker=AAPL` | Full analysis: sentiment + stock data + posts + word cloud |
| `GET /api/health` | Health check |

## How Sentiment is Calculated

Each Reddit post and news article is scored using **VADER** (Valence Aware Dictionary and sEntiment Reasoner):

- **Compound score**: −1.0 (most negative) → +1.0 (most positive)
- **Label**: `positive` (≥ 0.05) · `neutral` (−0.05 to 0.05) · `negative` (≤ −0.05)
- Results are aggregated into percentages and an average compound score across all sources

Every search appends to `data/posts.csv` with each post's title, text, source, URL, and full sentiment breakdown — so you can inspect exactly what drove the score.

> \* Side effects may include world domination, excessive monologuing, and/or Perry the Platypus ruining everything.
