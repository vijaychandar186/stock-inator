import './style.css'
import { analyze } from './api/client'
import { renderHeader } from './components/Header'
import { renderSearchBar } from './components/SearchBar'
import { renderStatsGrid } from './components/StatsGrid'
import { renderSentimentChart, mountSentimentChart } from './components/SentimentChart'
import { renderStockChart, mountStockChart } from './components/StockChart'
import { renderPostFeed } from './components/PostFeed'
import { renderWordCloud } from './components/WordCloud'
import { renderFooter } from './components/Footer'
import type { AnalysisResult } from './types'

const app = document.getElementById('app')!

let currentTicker = ''
let loading = false

function renderIdleState(): string {
  return `
    <div class="flex flex-col sm:flex-row items-center sm:items-end justify-center gap-6 mt-8 select-none">
      <img src="/balloony.svg" alt="Balloony" id="balloony-img" class="h-56 sm:h-72 object-contain drop-shadow-lg cursor-pointer pointer-events-auto" title="Click me!" />
      <img src="/doofenshmirtz.svg" alt="" class="h-64 sm:h-80 object-contain" />
    </div>
  `
}

function renderShell(resultsHtml = ''): string {
  return `
    ${renderHeader()}
    <main class="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
      ${renderSearchBar(loading, currentTicker)}
      ${resultsHtml || (!loading ? renderIdleState() : '')}
    </main>
    ${renderFooter()}
  `
}

function renderResults(data: AnalysisResult): string {
  return `
    <div id="results" class="space-y-6">
      <div class="flex items-center gap-2 pt-2 flex-wrap">
        <h2 class="doof-heading text-3xl text-primary evil-glow">$${data.ticker} — INITIATED!</h2>
        <span class="text-muted-foreground text-sm italic">— ${data.sentiment.total} subjects analyzed (Perry not included)</span>
      </div>
      ${renderStatsGrid(data)}
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        ${renderSentimentChart(data.sentiment)}
        ${renderStockChart(data.stock)}
      </div>
      ${renderWordCloud(data.wordcloud_image)}
      ${renderPostFeed(data.posts, data.sources)}
    </div>
  `
}

function renderError(message: string): string {
  return `
    <div class="max-w-md mx-auto mt-4">
      <div class="card p-5 flex items-start gap-3" style="border-color:color-mix(in oklch,var(--destructive) 40%,transparent);background:color-mix(in oklch,var(--destructive) 8%,var(--card))">
        <span class="text-2xl shrink-0">🦆</span>
        <div>
          <p class="doof-heading text-xl" style="color:var(--destructive)">CURSE YOU, PERRY THE PLATYPUS!!!</p>
          <p class="text-muted-foreground text-xs mt-1 italic">"...and also: ${message}"</p>
          <p class="text-muted-foreground text-xs mt-2 opacity-60">— Dr. H. Doofenshmirtz</p>
        </div>
      </div>
    </div>
  `
}

function bindBalloony(): void {
  document.getElementById('balloony-img')?.addEventListener('click', () => {
    const existing = document.getElementById('balloony-speech')
    if (existing) { existing.remove(); return }
    const bubble = document.createElement('div')
    bubble.id = 'balloony-speech'
    bubble.style.cssText = `
      position: fixed;
      bottom: 5rem;
      left: 50%;
      transform: translateX(-50%);
      z-index: 50;
      max-width: 22rem;
      width: calc(100vw - 2rem);
      background: color-mix(in oklch, var(--primary) 12%, var(--card));
      border: 1px solid color-mix(in oklch, var(--primary) 50%, transparent);
      border-radius: var(--radius);
      box-shadow: 0 0 32px color-mix(in oklch, var(--primary) 30%, transparent), 0 8px 24px rgba(0,0,0,0.3);
      padding: 1.25rem 1.25rem 1rem;
      animation: bubble-in 0.2s ease-out;
    `
    bubble.innerHTML = `
      <style>
        @keyframes bubble-in { from { opacity:0; transform:translateX(-50%) translateY(8px) scale(0.96); } to { opacity:1; transform:translateX(-50%) translateY(0) scale(1); } }
      </style>
      <div style="display:flex;align-items:flex-start;gap:0.75rem">
        <span style="font-size:1.5rem;line-height:1;flex-shrink:0">🧪</span>
        <div style="flex:1">
          <p style="font-family:'Bangers',cursive;letter-spacing:0.05em;color:var(--primary);font-size:0.7rem;text-transform:uppercase;margin-bottom:0.4rem">Dr. Doofenshmirtz speaks:</p>
          <p style="font-size:0.875rem;font-style:italic;color:var(--foreground);line-height:1.5">"You see, I've built a device that scans the entire internet and tells me how people <em>feel</em> about stocks. With this, I shall take over the Tri-State Area's financial markets! ...Or at least know when to buy TSLA."</p>
        </div>
        <button id="balloony-close" style="flex-shrink:0;color:var(--muted-foreground);line-height:1;padding:0.1rem 0.25rem;border-radius:4px;font-size:0.75rem;cursor:pointer;background:transparent;border:none" onmouseover="this.style.color='var(--foreground)'" onmouseout="this.style.color='var(--muted-foreground)'">✕</button>
      </div>
    `
    document.body.appendChild(bubble)
    document.getElementById('balloony-close')?.addEventListener('click', () => bubble.remove())
    setTimeout(() => bubble.remove(), 6000)
  })
}

function mount(): void {
  app.innerHTML = renderShell()
  bindSearch()
  bindBalloony()
}

function bindSearch(): void {
  const form = document.getElementById('search-form')
  const input = document.getElementById('ticker-input') as HTMLInputElement | null

  form?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const ticker = input?.value.trim().toUpperCase() ?? ''
    if (!ticker) return
    await runAnalysis(ticker)
  })
}

async function runAnalysis(ticker: string): Promise<void> {
  currentTicker = ticker
  loading = true
  app.innerHTML = renderShell()
  bindSearch()
  bindBalloony()

  try {
    const data = await analyze(ticker)
    loading = false
    app.innerHTML = renderShell(renderResults(data))
    bindSearch()

    requestAnimationFrame(() => {
      mountSentimentChart(data.sentiment)
      mountStockChart(data.stock)
    })
  } catch (err) {
    loading = false
    const msg = err instanceof Error ? err.message : 'Unknown error'
    app.innerHTML = renderShell(renderError(msg))
    bindSearch()
  }
}

mount()
