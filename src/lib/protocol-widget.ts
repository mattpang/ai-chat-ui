import { isRecord } from '@/lib/is-record'

export interface ProtocolWidgetFields {
  title?: string
  text: string
  citations?: string[]
}

export function readProtocolWidgetObject(value: unknown): ProtocolWidgetFields | null {
  if (!isRecord(value)) return null
  if (value.widget_name !== 'protocol') return null
  if (typeof value.text !== 'string' || value.text === '') return null

  return {
    ...(typeof value.title === 'string' && value.title !== '' ? { title: value.title } : {}),
    text: value.text,
    ...(Array.isArray(value.citations) ? { citations: value.citations.filter(isString) } : {}),
  }
}

export function readProtocolWidgetJson(value: string): ProtocolWidgetFields | null {
  try {
    return readProtocolWidgetObject(JSON.parse(value))
  } catch {
    return null
  }
}

function isString(value: unknown): value is string {
  return typeof value === 'string'
}
