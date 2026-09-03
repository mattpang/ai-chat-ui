import { readProtocolWidgetJson, type ProtocolWidgetFields } from '@/lib/protocol-widget'

const CITATION_START = '\ue200cite\ue202'
const CITATION_END = '\ue201'
const MARKER_START = '\ue200'
const FOLLOW_UP_START = '\ue301'
const FOLLOW_UP_OPTION = '\ue302'
const FOLLOW_UP_END = '\ue304'
const PROTOCOL_FENCE = '```protocol'
const CODE_FENCE_END = '```'

export type AssistantMarkerSegment =
  | { type: 'text'; text: string }
  | { type: 'citation'; documentIds: string[] }
  | { type: 'follow-up'; query: string; options: string[] }
  | ({ type: 'protocol' } & ProtocolWidgetFields)

export function parseAssistantMarkers(text: string): AssistantMarkerSegment[] {
  const segments: AssistantMarkerSegment[] = []
  let cursor = 0

  while (cursor < text.length) {
    const citationIndex = text.indexOf(CITATION_START, cursor)
    const followUpIndex = text.indexOf(FOLLOW_UP_START, cursor)
    const protocolIndex = text.indexOf(PROTOCOL_FENCE, cursor)
    const nextIndex = firstMarkerIndex(citationIndex, followUpIndex, protocolIndex)

    if (nextIndex === -1) {
      appendText(segments, stripDanglingPrivateMarker(text.slice(cursor)))
      break
    }

    appendText(segments, text.slice(cursor, nextIndex))

    if (nextIndex === citationIndex) {
      const endIndex = text.indexOf(CITATION_END, nextIndex + CITATION_START.length)
      if (endIndex === -1) break

      const rawIds = text.slice(nextIndex + CITATION_START.length, endIndex)
      const documentIds = rawIds
        .split('\ue202')
        .map((id) => id.trim())
        .filter((id) => id && id !== 'document_id')

      if (documentIds.length > 0) {
        segments.push({ type: 'citation', documentIds })
      }
      cursor = endIndex + CITATION_END.length
    } else if (nextIndex === followUpIndex) {
      const endIndex = text.indexOf(FOLLOW_UP_END, nextIndex + FOLLOW_UP_START.length)
      if (endIndex === -1) break

      const rawParts = text
        .slice(nextIndex + FOLLOW_UP_START.length, endIndex)
        .split(FOLLOW_UP_OPTION)
        .map((part) => part.trim())
        .filter(Boolean)

      if (rawParts.length > 1) {
        const [query, ...options] = rawParts
        segments.push({ type: 'follow-up', query, options })
      }
      cursor = endIndex + FOLLOW_UP_END.length
    } else {
      const contentStart = lineContentStart(text, nextIndex + PROTOCOL_FENCE.length)
      const endIndex = text.indexOf(CODE_FENCE_END, contentStart)
      const contentEnd = endIndex === -1 ? text.length : trimFenceLineBreak(text, endIndex)
      const protocolText = text.slice(contentStart, contentEnd)
      const protocolWidget = readProtocolWidgetJson(protocolText)
      segments.push({ type: 'protocol', ...(protocolWidget ?? { text: protocolText }) })
      if (endIndex === -1) break
      cursor = endIndex + CODE_FENCE_END.length
    }
  }

  return segments
}

function firstMarkerIndex(...indices: number[]): number {
  const present = indices.filter((index) => index !== -1)
  return present.length === 0 ? -1 : Math.min(...present)
}

function appendText(segments: AssistantMarkerSegment[], text: string) {
  if (!text) return

  const last = segments.at(-1)
  if (last?.type === 'text') {
    last.text += text
  } else {
    segments.push({ type: 'text', text })
  }
}

function stripDanglingPrivateMarker(text: string): string {
  const citationIndex = text.indexOf(MARKER_START)
  const followUpIndex = text.indexOf(FOLLOW_UP_START)
  const protocolIndex = text.indexOf(PROTOCOL_FENCE)
  const index = firstMarkerIndex(citationIndex, followUpIndex, protocolIndex)

  return index === -1 ? text : text.slice(0, index)
}

function lineContentStart(text: string, index: number): number {
  if (text[index] === '\r' && text[index + 1] === '\n') return index + 2
  if (text[index] === '\n') return index + 1
  return index
}

function trimFenceLineBreak(text: string, index: number): number {
  if (text[index - 2] === '\r' && text[index - 1] === '\n') return index - 2
  if (text[index - 1] === '\n') return index - 1
  return index
}
