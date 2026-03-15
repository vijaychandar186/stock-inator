import type { SentimentData } from '../types'
import { Chart, ArcElement, DoughnutController, Tooltip, Legend } from 'chart.js'

Chart.register(ArcElement, DoughnutController, Tooltip, Legend)

let sentimentChartInstance: Chart | null = null

function cssVar(prop: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(prop).trim()
}

export function renderSentimentChart(sentiment: SentimentData): string {
  return `
    <div class="card p-6 flex flex-col">
      <h2 class="inator-label mb-4">⚗️ Mood-inator™ Breakdown</h2>
      <div class="relative flex-1 flex items-center justify-center" style="min-height:200px">
        <canvas id="sentiment-chart"></canvas>
      </div>
      <div class="flex justify-around mt-4">
        <div class="text-center">
          <p class="font-bold text-lg" style="color:var(--chart-1)">${sentiment.positive_pct}%</p>
          <p class="text-muted-foreground text-xs">Bulls 📈</p>
        </div>
        <div class="text-center">
          <p class="font-bold text-lg" style="color:var(--muted-foreground)">${sentiment.neutral_pct}%</p>
          <p class="text-muted-foreground text-xs">On the Fence 😐</p>
        </div>
        <div class="text-center">
          <p class="font-bold text-lg" style="color:var(--destructive)">${sentiment.negative_pct}%</p>
          <p class="text-muted-foreground text-xs">Perry fans 📉</p>
        </div>
      </div>
    </div>
  `
}

export function mountSentimentChart(sentiment: SentimentData): void {
  const canvas = document.getElementById('sentiment-chart') as HTMLCanvasElement | null
  if (!canvas) return

  if (sentimentChartInstance) {
    sentimentChartInstance.destroy()
    sentimentChartInstance = null
  }

  const c1 = cssVar('--chart-1')
  const muted = cssVar('--muted-foreground')
  const destructive = cssVar('--destructive')
  const cardBg = cssVar('--card')
  const border = cssVar('--border')
  const fg = cssVar('--foreground')
  const mutedFg = cssVar('--muted-foreground')

  sentimentChartInstance = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: ['Bulls 📈', 'On the Fence 😐', 'Perry fans 📉'],
      datasets: [{
        data: [sentiment.positive, sentiment.neutral, sentiment.negative],
        backgroundColor: [c1, muted, destructive].map(c => `color-mix(in oklch, ${c} 70%, transparent)`),
        borderColor: [c1, muted, destructive],
        borderWidth: 1,
        hoverOffset: 4,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      cutout: '65%',
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: cardBg,
          borderColor: border,
          borderWidth: 1,
          titleColor: fg,
          bodyColor: mutedFg,
          callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.parsed} posts analyzed` },
        },
      },
    },
  })
}
