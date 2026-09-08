import { readStructuredProtocolWidget, type StructuredProtocolWidgetFields } from '@/lib/protocol-widget'
import { toolNameOfPart } from '@/lib/tool-filters'
import type { DynamicToolUIPart, ToolUIPart, UIDataTypes, UIMessagePart, UITools } from 'ai'

const MAIN_CHAT_STRUCTURED_PROTOCOL_TOOLS = new Set(['delegate_task'])

type ToolPart = ToolUIPart | DynamicToolUIPart

export function structuredProtocolOfMainChatToolPart(
  part: UIMessagePart<UIDataTypes, UITools>,
): StructuredProtocolWidgetFields | null {
  const toolName = toolNameOfPart(part)
  if (toolName === null || !MAIN_CHAT_STRUCTURED_PROTOCOL_TOOLS.has(toolName)) return null
  if (!('state' in part) || part.state !== 'output-available') return null

  return readStructuredProtocolWidget((part as ToolPart).output)
}

export function isMainChatStructuredProtocolToolPart(part: UIMessagePart<UIDataTypes, UITools>): boolean {
  return structuredProtocolOfMainChatToolPart(part) !== null
}
