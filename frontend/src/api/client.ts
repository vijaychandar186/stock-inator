import type { AnalysisResult } from '../types'

const BASE = '/api'

export async function analyze(ticker: string): Promise<AnalysisResult> {
  const res = await fetch(`${BASE}/analyze?ticker=${encodeURIComponent(ticker)}`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}
