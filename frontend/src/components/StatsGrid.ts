import type { AnalysisResult } from '../types'
import { formatPrice } from '../utils/formatters'

export function renderStatsGrid(data: AnalysisResult): string {
  const { sentiment, stock, sources } = data
  const changePositive = stock.change >= 0
  const overallLabel = sentiment.average_compound >= 0.05
    ? 'Bullish'
    : sentiment.average_compound <= -0.05
    ? 'Bearish'
    : 'Neutral'

  const overallStyle = overallLabel === 'Bullish'
    ? 'color:var(--chart-1)'
    : overallLabel === 'Bearish'
    ? 'color:var(--destructive)'
    : 'color:var(--muted-foreground)'

  const overallEmoji = overallLabel === 'Bullish'
    ? '📈 Bullish! EXCELLENT!'
    : overallLabel === 'Bearish'
    ? '📉 Bearish... CURSE YOU!'
    : '😐 Neutral (like my childhood)'

  const changeStyle = changePositive ? 'color:var(--chart-1)' : 'color:var(--destructive)'

  return `
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="card lab-panel p-5">
        <p class="inator-label mb-1">Intel Gathered</p>
        <p class="text-2xl font-bold text-foreground">${sources.reddit + sources.news}</p>
        <p class="text-muted-foreground text-xs mt-1">
          <span style="color:var(--chart-3)">${sources.reddit}</span> Lair Radio ·
          <span style="color:var(--chart-2)">${sources.news}</span> Tri-State Tribune
        </p>
      </div>
      <div class="card lab-panel p-5">
        <p class="inator-label mb-1">Mood-inator™ Reading</p>
        <p class="text-lg font-bold doof-heading" style="${overallStyle}">${overallEmoji}</p>
        <p class="text-muted-foreground text-xs mt-1">Score: ${sentiment.average_compound > 0 ? '+' : ''}${sentiment.average_compound.toFixed(3)}</p>
      </div>
      <div class="card lab-panel p-5">
        <p class="inator-label mb-1">Evil Budget (current)</p>
        ${stock.error
          ? `<p class="text-muted-foreground text-sm italic">Perry foiled the data feed 🦆</p>`
          : `
            <p class="text-2xl font-bold text-foreground">${formatPrice(stock.latest_close)}</p>
            <p class="text-xs mt-1" style="${changeStyle}">
              ${changePositive ? '▲' : '▼'} ${Math.abs(stock.change_pct).toFixed(2)}% today
            </p>
          `
        }
      </div>
      <div class="card lab-panel p-5">
        <p class="inator-label mb-1">Bull Army Size</p>
        <p class="text-2xl font-bold" style="color:var(--chart-1)">${sentiment.positive_pct}%</p>
        <p class="text-muted-foreground text-xs mt-1">${sentiment.positive} of ${sentiment.total} recruited</p>
      </div>
    </div>
  `
}
