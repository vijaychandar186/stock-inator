export interface SentimentData {
  positive: number
  negative: number
  neutral: number
  positive_pct: number
  negative_pct: number
  neutral_pct: number
  average_compound: number
  total: number
}

export interface PricePoint {
  date: string
  close: number
  open: number
  high: number
  low: number
  volume: number
}

export interface StockData {
  symbol: string
  prices: PricePoint[]
  latest_close: number
  change: number
  change_pct: number
  error?: string
}

export interface PostSentiment {
  compound: number
  positive: number
  negative: number
  neutral: number
  label: 'positive' | 'negative' | 'neutral'
}

export interface RedditPost {
  id: string
  title: string
  text: string
  score: number
  url: string
  subreddit: string
  num_comments: number
  created_utc: number
  created_date: string
  sentiment: PostSentiment
  source: 'reddit' | 'news'
}

export interface WordFreq {
  word: string
  count: number
}

export interface AnalysisResult {
  ticker: string
  sentiment: SentimentData
  stock: StockData
  posts: RedditPost[]
  word_frequencies: WordFreq[]
  wordcloud_image: string
  sources: {
    reddit: number
    news: number
  }
}
