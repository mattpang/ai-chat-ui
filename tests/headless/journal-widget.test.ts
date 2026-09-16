import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { createElement } from 'react'
import { JournalCards } from '@/components/journal-cards'
import { journalCardHref, journalResultsOfMainChatToolPart, readJournalResults } from '@/lib/journal-widget'

const journal = {
  card_type: 'Journal' as const,
  title: 'Epigenetic regulation of TP53',
  related_reason: 'Examines radio resistance',
  journal_name: 'Signal Transduction and Targeted Therapy',
  doi: '10.1234/example',
}
const document = {
  card_type: 'Document' as const,
  title: 'Research notes',
  related_reason: 'Background',
  url: 'https://example.com/notes',
}

describe('journal widgets', () => {
  it('reads the Pydantic repr returned by the live retrieval agent', () => {
    const output =
      "cards=[JournalCard(card_type='Journal', related_reason='Relevant method', title='Antibody labeling', abstract=None, journal_name='Journal of Visualized Experiments', url='https://pubmed.ncbi.nlm.nih.gov/27685323/', doi=None), DocumentCard(card_type='Document', related_reason='Background', title='Research notes', url='https://example.com/notes')]"
    const cards = readJournalResults(output)
    expect(cards).toHaveLength(2)
    expect(cards?.[0]).toMatchObject({
      card_type: 'Journal',
      title: 'Antibody labeling',
      journal_name: 'Journal of Visualized Experiments',
    })
    expect(cards?.[1]).toMatchObject({ card_type: 'Document', title: 'Research notes' })
    expect(readJournalResults(JSON.stringify(output))).toEqual(cards)
  })

  it('reads mixed cards from JSON and nested tool output', () => {
    const cards = readJournalResults({ result: JSON.stringify({ cards: [journal, document] }) })
    expect(cards).toEqual([journal, document])
    expect(readJournalResults({ cards: [{ ...journal, abstract: null, url: null }] })?.[0].url).toBeUndefined()
  })

  it('leaves empty and malformed results to the standard tool renderer', () => {
    for (const value of ['not json', { cards: null }, { cards: [] }, { cards: [{ title: 'Invalid' }] }]) {
      expect(readJournalResults(value)).toBeNull()
    }
    expect(readJournalResults({ cards: [null, journal] })).toHaveLength(1)
  })

  it('only promotes completed retrieval delegate results for dynamic and static tools', () => {
    const part = {
      type: 'dynamic-tool' as const,
      toolName: 'delegate_task',
      toolCallId: 'call-1',
      state: 'output-available' as const,
      input: { agent_name: 'retrivial_agent' },
      output: { cards: [journal] },
    }
    expect(journalResultsOfMainChatToolPart(part)).toHaveLength(1)
    expect(journalResultsOfMainChatToolPart({ ...part, type: 'tool-delegate_task' })).toHaveLength(1)
    expect(journalResultsOfMainChatToolPart({ ...part, toolName: 'other' })).toBeNull()
    expect(journalResultsOfMainChatToolPart({ ...part, input: { agent_name: 'other' } })).toBeNull()
    expect(journalResultsOfMainChatToolPart({ ...part, state: 'input-available', output: undefined })).toBeNull()
  })

  it('uses safe source URLs with DOI fallback', () => {
    expect(journalCardHref(journal)).toBe('https://doi.org/10.1234/example')
    expect(journalCardHref({ ...journal, url: 'https://example.com/paper' })).toBe('https://example.com/paper')
    expect(journalCardHref({ ...document, url: 'javascript:alert(1)' })).toBeUndefined()
    expect(journalCardHref({ ...journal, url: 'invalid' })).toBe('https://doi.org/10.1234/example')
  })

  it('renders article and document labels, available metadata and accessible links', () => {
    const html = renderToStaticMarkup(createElement(JournalCards, { cards: [journal, document] }))
    expect(html).toContain('Journal article')
    expect(html).toContain('Document')
    expect(html).toContain(journal.title)
    expect(html).toContain(journal.journal_name)
    expect(html).toContain(`aria-label="Open ${journal.title}"`)
    expect(html).toContain('rel="noopener noreferrer"')
    const unlinked = renderToStaticMarkup(createElement(JournalCards, { cards: [{ ...journal, doi: undefined }] }))
    expect(unlinked).not.toContain('<a ')
  })
})
