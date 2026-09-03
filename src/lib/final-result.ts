import { isRecord } from '@/lib/is-record'
import { readProtocolWidgetObject } from '@/lib/protocol-widget'
import type { DynamicToolUIPart, ToolUIPart, UIDataTypes, UIMessagePart, UITools } from 'ai'

const FINAL_RESULT_TOOL_NAMES = new Set(['final_result', 'final_tool'])

export interface FinalResultPayload {
  responseText: string
  widgets: FinalResultWidget[]
}

export type FinalResultWidget = CitationWidget | ProtocolWidget

export interface CitationWidget {
  widgetName: 'citation'
  documentId: string
  url?: string
}

export interface ProtocolWidget {
  widgetName: 'protocol'
  title?: string
  text: string
  citations?: string[]
}

type ToolPart = ToolUIPart | DynamicToolUIPart

export function isFinalResultToolPart(part: UIMessagePart<UIDataTypes, UITools>): boolean {
  if (part.type === 'dynamic-tool') return FINAL_RESULT_TOOL_NAMES.has(part.toolName)
  if (!('toolCallId' in part)) return false
  return part.type.startsWith('tool-') && FINAL_RESULT_TOOL_NAMES.has(part.type.slice('tool-'.length))
}

export function finalResultPayloadOfPart(part: ToolPart): FinalResultPayload | null {
  const payload =
    part.state === 'output-available' ? (readPayload(part.output) ?? readPayload(part.input)) : readPayload(part.input)
  if (payload === null || (payload.responseText === '' && payload.widgets.length === 0)) return null
  return payload
}

function readPayload(value: unknown): FinalResultPayload | null {
  if (!isRecord(value)) return null

  const responseText = typeof value.response_text === 'string' ? value.response_text : ''
  const widgets = readWidgets(value.widget)

  return { responseText, widgets }
}

function readWidgets(value: unknown): FinalResultWidget[] {
  if (Array.isArray(value)) return value.map(readWidget).filter(isFinalResultWidget)

  const widget = readWidget(value)
  return widget === null ? [] : [widget]
}

function readWidget(value: unknown): FinalResultWidget | null {
  if (!isRecord(value)) return null

  if (value.widget_name === 'citation') {
    if (typeof value.document_id !== 'string' || value.document_id === '') return null

    return {
      widgetName: 'citation',
      documentId: value.document_id,
      ...(typeof value.url === 'string' && value.url !== '' ? { url: value.url } : {}),
    }
  }

  if (value.widget_name === 'protocol') {
    const protocolWidget = readProtocolWidgetObject(value)
    return protocolWidget === null
      ? null
      : {
          widgetName: 'protocol',
          ...protocolWidget,
        }
  }

  return null
}

function isFinalResultWidget(value: FinalResultWidget | null): value is FinalResultWidget {
  return value !== null
}
