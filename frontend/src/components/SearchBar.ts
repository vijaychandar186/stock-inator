export function renderSearchBar(loading = false, currentTicker = ''): string {
  return `
    <section class="max-w-2xl mx-auto px-4 pt-24 pb-10 text-center">

      <h1 class="doof-heading text-5xl sm:text-6xl text-primary mb-1 evil-glow" style="text-shadow: 0 0 30px color-mix(in oklch, var(--primary) 60%, transparent)">
        THE STOCK-INATOR™
      </h1>
      <form id="search-form" class="flex gap-2">
        <div class="relative flex-1">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-sm doof-heading text-primary">$</span>
          <input
            id="ticker-input"
            type="text"
            value="${currentTicker}"
            placeholder="AAPL, TSLA, NVDA..."
            autocomplete="off"
            autocapitalize="characters"
            spellcheck="false"
            class="w-full bg-card border border-input rounded-md pl-8 pr-4 py-3 text-foreground text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition uppercase"
          />
        </div>
        <button
          type="submit"
          id="search-btn"
          ${loading ? 'disabled' : ''}
          class="bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed text-primary-foreground font-semibold px-5 py-3 rounded-md transition-all flex items-center gap-2 whitespace-nowrap doof-heading text-lg tracking-wide evil-pulse"
        >
          ${loading
            ? `<svg class="spin-evil h-4 w-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> CALCULATING EVIL...`
            : `ACTIVATE THE INATOR!`
          }
        </button>
      </form>

    </section>
  `
}
