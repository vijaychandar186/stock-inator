export function formatNumber(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

export function formatDate(utc: number): string {
  return new Date(utc * 1000).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatPrice(price: number): string {
  return price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}
