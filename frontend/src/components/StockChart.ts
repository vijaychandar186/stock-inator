import type { StockData } from '../types'
import { Chart, LineElement, PointElement, LineController, CategoryScale, LinearScale, Tooltip, Filler } from 'chart.js'
import { formatPrice } from '../utils/formatters'

Chart.register(LineElement, PointElement, LineController, CategoryScale, LinearScale, Tooltip, Filler)

let stockChartInstance: Chart | null = null

function cssVar(prop: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(prop).trim()
}

export function renderStockChart(stock: StockData): string {
  if (stock.error || stock.prices.length === 0) {
    return `
      <div class="card p-6 flex flex-col">
        <h2 class="inator-label mb-4">
          📉 ${stock.symbol} Price Trajectory-inator
        </h2>
        <div class="flex-1 flex items-center justify-center text-muted-foreground text-sm" style="min-height:200px">
          ${stock.error || 'No price data available'}
        </div>
      </div>
    `
  }

  const changePositive = stock.change >= 0
  const changeStyle = changePositive ? 'color:var(--chart-1)' : 'color:var(--destructive)'

  return `
    <div class="card p-6 flex flex-col">
      <div class="flex items-start justify-between mb-4">
        <h2 class="inator-label">📈 ${stock.symbol} Price Trajectory-inator (30d)</h2>
        <div class="text-right">
          <p class="text-foreground font-bold">${formatPrice(stock.latest_close)}</p>
          <p class="text-xs" style="${changeStyle}">
            ${changePositive ? '▲' : '▼'} ${Math.abs(stock.change_pct).toFixed(2)}%
          </p>
        </div>
      </div>
      <div class="relative flex-1" style="min-height:200px">
        <canvas id="stock-chart"></canvas>
      </div>
    </div>
  `
}

export function mountStockChart(stock: StockData): void {
  const canvas = document.getElementById('stock-chart') as HTMLCanvasElement | null
  if (!canvas || !stock.prices.length) return

  if (stockChartInstance) {
    stockChartInstance.destroy()
    stockChartInstance = null
  }

  const changePositive = stock.change >= 0
  const lineColor = changePositive ? cssVar('--chart-1') : cssVar('--destructive')
  const gridColor = cssVar('--border')
  const mutedFg = cssVar('--muted-foreground')
  const cardBg = cssVar('--card')
  const fg = cssVar('--foreground')

  const labels = stock.prices.map(p => p.date.slice(5))
  const closes = stock.prices.map(p => p.close)

  stockChartInstance = new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        data: closes,
        borderColor: lineColor,
        backgroundColor: `color-mix(in oklch, ${lineColor} 10%, transparent)`,
        borderWidth: 2,
        fill: true,
        tension: 0.3,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: lineColor,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: 'index' },
      scales: {
        x: {
          grid: { color: gridColor },
          ticks: { color: mutedFg, font: { size: 11 }, maxTicksLimit: 8 },
        },
        y: {
          position: 'right',
          grid: { color: gridColor },
          ticks: { color: mutedFg, font: { size: 11 }, callback: (v) => formatPrice(v as number) },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: cardBg,
          borderColor: gridColor,
          borderWidth: 1,
          titleColor: fg,
          bodyColor: mutedFg,
          callbacks: { label: (ctx) => ` ${formatPrice(ctx.parsed.y)}` },
        },
      },
    },
  })
}
