export function renderHeader(): string {
  return `
    <header class="border-b border-border bg-background/90 backdrop-blur-sm sticky top-0 z-50 evil-glow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <img src="/logo.png" alt="Doofenshmirtz Evil Inc." class="h-9 w-auto" />
          <div class="flex flex-col leading-tight">
            <span class="doof-heading text-xl text-primary flicker">THE STOCK-INATOR™</span>
            <span class="text-[10px] text-muted-foreground tracking-widest uppercase">Doofenshmirtz Evil Inc.</span>
          </div>
        </div>
        <span class="text-xs text-muted-foreground hidden sm:block italic">"Aren't you a little young to be analyzing stocks?"</span>
      </div>
    </header>
  `
}
