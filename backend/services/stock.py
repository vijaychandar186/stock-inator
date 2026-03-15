from __future__ import annotations
import logging
import yfinance as yf

logger = logging.getLogger(__name__)


def fetch_stock_data(symbol: str) -> dict:
    try:
        ticker = yf.Ticker(symbol.upper())
        hist = ticker.history(period="30d")

        if hist.empty:
            return {"symbol": symbol.upper(), "prices": [], "error": "No price data found"}

        prices = [
            {
                "date": str(date.date()),
                "close": round(float(row["Close"]), 2),
                "open": round(float(row["Open"]), 2),
                "high": round(float(row["High"]), 2),
                "low": round(float(row["Low"]), 2),
                "volume": int(row["Volume"]),
            }
            for date, row in hist.iterrows()
        ]

        latest = prices[-1]
        prev = prices[-2] if len(prices) > 1 else latest
        change = round(latest["close"] - prev["close"], 2)
        change_pct = round(change / prev["close"] * 100, 2) if prev["close"] else 0

        return {
            "symbol": symbol.upper(),
            "prices": prices,
            "latest_close": latest["close"],
            "change": change,
            "change_pct": change_pct,
        }
    except Exception as e:
        logger.warning("Stock fetch failed for %s: %s", symbol, e)
        return {"symbol": symbol.upper(), "prices": [], "error": str(e)}
