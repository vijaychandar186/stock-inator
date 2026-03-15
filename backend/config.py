import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    ALPHA_VANTAGE_API_KEY: str = os.getenv("ALPHA_VANTAGE_API_KEY", "")
    ALPHA_VANTAGE_BASE_URL: str = "https://www.alphavantage.co/query"
    REDDIT_BASE_URL: str = "https://www.reddit.com"
    SUBREDDITS: list[str] = ["stocks", "investing", "wallstreetbets", "StockMarket"]
    POSTS_PER_SUB: int = 25


config = Config()
