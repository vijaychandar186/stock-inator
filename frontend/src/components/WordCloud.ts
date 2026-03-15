export function renderWordCloud(image: string): string {
  return `
    <div class="card lab-panel p-6">
      <h2 class="inator-label mb-4">☁️ The Buzzword-inator™</h2>
      ${image
        ? `<img src="data:image/png;base64,${image}" alt="Buzzword-inator output" class="w-full rounded-md" />`
        : `<p class="text-muted-foreground text-sm text-center py-8 italic">"No words found... which is honestly more words than Perry ever says." 🦆</p>`
      }
    </div>
  `
}
