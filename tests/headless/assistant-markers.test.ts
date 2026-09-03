import { describe, expect, it } from 'vitest'

import { parseAssistantMarkers } from '@/lib/assistant-markers'

describe('parseAssistantMarkers', () => {
  it('turns a citation marker into document ids', () => {
    expect(parseAssistantMarkers('Answer\ue200cite\ue202doc-1\ue201 done')).toEqual([
      { type: 'text', text: 'Answer' },
      { type: 'citation', documentIds: ['doc-1'] },
      { type: 'text', text: ' done' },
    ])
  })

  it('keeps multiple citation ids in one marker', () => {
    expect(parseAssistantMarkers('\ue200cite\ue202doc-1\ue202doc-2\ue201')).toEqual([
      { type: 'citation', documentIds: ['doc-1', 'doc-2'] },
    ])
  })

  it('erases placeholder citations', () => {
    expect(parseAssistantMarkers('Before \ue200cite\ue202document_id\ue201 after')).toEqual([
      { type: 'text', text: 'Before  after' },
    ])
  })

  it('hides a dangling citation while text is streaming', () => {
    expect(parseAssistantMarkers('Before \ue200cite\ue202doc')).toEqual([{ type: 'text', text: 'Before ' }])
  })

  it('turns a follow-up marker into a prompt and options', () => {
    expect(parseAssistantMarkers('\n\ue301Choose one?\ue302Alpha \ue302 Beta\ue304\n')).toEqual([
      { type: 'text', text: '\n' },
      { type: 'follow-up', query: 'Choose one?', options: ['Alpha', 'Beta'] },
      { type: 'text', text: '\n' },
    ])
  })

  it('hides a dangling follow-up while text is streaming', () => {
    expect(parseAssistantMarkers('Before \ue301Question?\ue302A')).toEqual([{ type: 'text', text: 'Before ' }])
  })

  it('turns a closed protocol code block into a protocol segment', () => {
    expect(parseAssistantMarkers('Before\n```protocol\nTitle\n1. Step -> output\n```\nAfter')).toEqual([
      { type: 'text', text: 'Before\n' },
      { type: 'protocol', text: 'Title\n1. Step -> output' },
      { type: 'text', text: '\nAfter' },
    ])
  })

  it('parses protocol code block json into card fields', () => {
    expect(
      parseAssistantMarkers(
        [
          'Before',
          '```protocol',
          '{',
          '  "widget_name": "protocol",',
          '  "title": "On-bead labeling of antibodies using magnetic Protein G beads",',
          '  "text": "some text here",',
          '  "citations": ["antibody-labelling", "immuno-with-protein-g"]',
          '}',
          '```',
          'After',
        ].join('\n'),
      ),
    ).toEqual([
      { type: 'text', text: 'Before\n' },
      {
        type: 'protocol',
        title: 'On-bead labeling of antibodies using magnetic Protein G beads',
        text: 'some text here',
        citations: ['antibody-labelling', 'immuno-with-protein-g'],
      },
      { type: 'text', text: '\nAfter' },
    ])
  })

  it('treats an unclosed protocol code block as a streaming protocol segment', () => {
    expect(parseAssistantMarkers('Before\n```protocol\nTitle\n1. Step')).toEqual([
      { type: 'text', text: 'Before\n' },
      { type: 'protocol', text: 'Title\n1. Step' },
    ])
  })
})
