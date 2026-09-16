import { isRecord } from '@/lib/is-record'
import { readModelRepr } from '@/lib/model-repr'
import { toolNameOfPart } from '@/lib/tool-filters'
import type { UIDataTypes, UIMessagePart, UITools } from 'ai'

export interface JournalCardModel {
  card_type: 'Journal' | 'Document'
  title: string
  related_reason: string
  abstract?: string
  journal_name?: string
  url?: string
  doi?: string
}

const OUTPUT_KEYS = ['output', 'result', 'content', 'text', 'data', 'widget'] as const

export function readJournalResults(value: unknown, depth = 0): JournalCardModel[] | null {
  if (depth > 10) return null
  if (typeof value === 'string') {
    try {
      return readJournalResults(JSON.parse(value), depth + 1)
    } catch {
      return readJournalResults(readModelRepr(value), depth + 1)
    }
  }
  if (!isRecord(value)) return null
  if (Array.isArray(value.cards)) {
    const cards = value.cards.flatMap((card): JournalCardModel[] => {
      if (!isRecord(card)) return []
      if (card.card_type !== 'Journal' && card.card_type !== 'Document') return []
      if (typeof card.title !== 'string' || !card.title.trim()) return []
      if (typeof card.related_reason !== 'string') return []
      return [
        {
          card_type: card.card_type,
          title: card.title,
          related_reason: card.related_reason,
          abstract: readText(card.abstract),
          journal_name: readText(card.journal_name),
          url: readText(card.url),
          doi: readText(card.doi),
        },
      ]
    })
    return cards.length ? cards : null
  }
  for (const key of OUTPUT_KEYS) {
    const cards = readJournalResults(value[key], depth + 1)
    if (cards !== null) return cards
  }
  return null
}

function readText(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

export function journalCardHref(card: JournalCardModel): string | undefined {
  for (const source of [card.url, card.doi?.startsWith('10.') ? `https://doi.org/${card.doi}` : card.doi]) {
    if (!source) continue
    try {
      const url = new URL(source)
      if (url.protocol === 'https:' || url.protocol === 'http:') return url.href
    } catch {
      // Missing or invalid sources leave the card readable without a link.
    }
  }
  return undefined
}

export function journalResultsOfMainChatToolPart(
  part: UIMessagePart<UIDataTypes, UITools>,
): JournalCardModel[] | null {
  if (toolNameOfPart(part) !== 'delegate_task') return null
  if (!('state' in part) || part.state !== 'output-available') return null
  if (!isRecord(part.input) || part.input.agent_name !== 'retrivial_agent') return null
  return readJournalResults(part.output)
}

export function isMainChatJournalToolPart(part: UIMessagePart<UIDataTypes, UITools>): boolean {
  return journalResultsOfMainChatToolPart(part) !== null
}
