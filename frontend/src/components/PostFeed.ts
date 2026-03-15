import type { RedditPost } from '../types'
import { formatDate, formatNumber } from '../utils/formatters'

function renderPost(post: RedditPost): string {
  const badgeClass = `badge-${post.sentiment.label}`
  const label = post.sentiment.label.charAt(0).toUpperCase() + post.sentiment.label.slice(1)
  const compound = post.sentiment.compound
  const compoundStr = `${compound >= 0 ? '+' : ''}${compound.toFixed(3)}`
  const isNews = post.source === 'news'

  const sourceBadge = isNews
    ? `<span class="source-news">Tri-State Tribune</span>`
    : `<span class="source-reddit">Lair Radio</span>`

  const meta = isNews
    ? `<span style="color:var(--chart-2)">${escapeHtml(post.subreddit)}</span>`
    : `<span style="color:var(--chart-3)">r/${post.subreddit}</span>`

  return `
    <article class="py-4 border-b border-border last:border-0 hover:bg-primary/5 px-4 -mx-4 rounded-md transition-colors">
      <div class="flex items-start justify-between gap-3">
        <div class="flex-1 min-w-0">
          <a href="${post.url}" target="_blank" rel="noopener noreferrer"
            class="text-foreground font-medium text-sm leading-snug hover:text-primary transition-colors line-clamp-2 block mb-1.5">
            ${escapeHtml(post.title)}
          </a>
          <div class="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
            ${sourceBadge}
            ${meta}
            ${!isNews ? `<span>↑ ${formatNumber(post.score)}</span><span>💬 ${formatNumber(post.num_comments)}</span>` : ''}
            <span>${formatDate(post.created_utc)}</span>
          </div>
        </div>
        <div class="flex flex-col items-end gap-1 shrink-0">
          <span class="${badgeClass}">${label}</span>
          <span class="text-xs text-muted-foreground font-mono">${compoundStr}</span>
        </div>
      </div>
    </article>
  `
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function renderPostFeed(posts: RedditPost[], sources: { reddit: number; news: number }): string {
  if (!posts.length) {
    return `
      <div class="card p-6">
        <h2 class="inator-label mb-4">🕵️ Intel from the Outside World</h2>
        <p class="text-muted-foreground text-sm text-center py-8 italic">"No intel found. Perry must have gotten here first." 🦆</p>
      </div>
    `
  }

  return `
    <div class="card p-6">
      <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 class="inator-label">🕵️ Intel from the Outside World</h2>
        <div class="flex items-center gap-3 text-xs text-muted-foreground">
          <span><span style="color:var(--chart-3);font-weight:500">${sources.reddit}</span> Lair Radio</span>
          <span><span style="color:var(--chart-2);font-weight:500">${sources.news}</span> Tri-State Tribune</span>
        </div>
      </div>
      <div>${posts.map(renderPost).join('')}</div>
    </div>
  `
}
