import { isRecord } from '@/lib/is-record'
import { readModelRepr, stripStringWrapper } from '@/lib/model-repr'

export interface ProtocolWidgetFields {
  title?: string
  text: string
  citations?: string[]
}

export interface ProtocolMaterial {
  name?: string
  productId?: string
  productIdType?: string
  quantity?: string
  unit_size?: string
}

export interface ProtocolStepDetails {
  stepName: string
  instruction: string
  optional: boolean
}

export interface ProtocolStage {
  stageName: string
  steps: ProtocolStepDetails[]
  materials: ProtocolMaterial[]
}

export interface ProtocolReference {
  title: string
  meta?: string
}

export interface StructuredProtocolWidgetFields {
  title: string
  stages: ProtocolStage[]
  materials: ProtocolMaterial[]
  references: ProtocolReference[]
  savedWidgetId?: string
}

const STRUCTURED_PROTOCOL_OUTPUT_KEYS = ['output', 'result', 'content', 'text', 'data', 'widget'] as const

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

export function readStructuredProtocolWidgetJson(value: string): StructuredProtocolWidgetFields | null {
  try {
    const parsed: unknown = JSON.parse(value)
    return typeof parsed === 'string'
      ? readStructuredProtocolWidgetObject(parseProtocolModelRepr(parsed))
      : readStructuredProtocolWidgetObject(parsed)
  } catch {
    return readStructuredProtocolWidgetObject(parseProtocolModelRepr(value))
  }
}

export function readStructuredProtocolWidgetObject(value: unknown): StructuredProtocolWidgetFields | null {
  if (!isRecord(value)) return null
  if (value.widget_name !== 'protocol') return null
  if (!Array.isArray(value.stages)) return null

  return {
    title: typeof value.title === 'string' && value.title !== '' ? value.title : 'Untitled protocol',
    stages: value.stages.map(readStage).filter(isProtocolStage),
    materials: Array.isArray(value.materials) ? value.materials.map(readMaterial).filter(isProtocolMaterial) : [],
    references: Array.isArray(value.references) ? value.references.map(readReference).filter(isProtocolReference) : [],
    ...(typeof value.saved_widget_id === 'string' && value.saved_widget_id !== ''
      ? { savedWidgetId: value.saved_widget_id }
      : {}),
  }
}

export function readStructuredProtocolWidget(value: unknown): StructuredProtocolWidgetFields | null {
  if (typeof value === 'string') return readStructuredProtocolWidgetJson(value)

  const direct = readStructuredProtocolWidgetObject(value)
  if (direct !== null) return direct

  if (!isRecord(value)) return null

  for (const key of STRUCTURED_PROTOCOL_OUTPUT_KEYS) {
    if (!(key in value)) continue
    const nested = readStructuredProtocolWidget(value[key])
    if (nested !== null) return nested
  }

  return null
}

function readStage(value: unknown, index: number): ProtocolStage | null {
  if (!isRecord(value)) return null

  return {
    stageName:
      typeof value.stage_name === 'string' && value.stage_name !== '' ? value.stage_name : `Stage ${index + 1}`,
    steps: Array.isArray(value.steps) ? value.steps.map(readStep).filter(isProtocolStep) : [],
    materials: Array.isArray(value.materials) ? value.materials.map(readMaterial).filter(isProtocolMaterial) : [],
  }
}

function readStep(value: unknown): ProtocolStepDetails | null {
  if (!isRecord(value)) return null

  return {
    stepName: typeof value.step_name === 'string' && value.step_name !== '' ? value.step_name : 'Untitled step',
    instruction:
      typeof value.instruction === 'string' && value.instruction !== ''
        ? value.instruction
        : 'No instruction provided.',
    optional: value.optional === true,
  }
}

function readMaterial(value: unknown): ProtocolMaterial | null {
  if (typeof value === 'string') return { name: value }
  if (!isRecord(value)) return null

  return {
    ...(typeof value.name === 'string' && value.name !== '' ? { name: value.name } : {}),
    ...(typeof value.product_id === 'string' && value.product_id !== '' ? { productId: value.product_id } : {}),
    ...(typeof value.product_id_type === 'string' && value.product_id_type !== ''
      ? { productIdType: value.product_id_type }
      : {}),
    ...(typeof value.quantity === 'number' || typeof value.quantity === 'string'
      ? { quantity: String(value.quantity) }
      : {}),
  }
}

function readReference(value: unknown, index: number): ProtocolReference | null {
  if (typeof value === 'string') return referenceFromText(value, index)
  if (!isRecord(value)) return null

  const text =
    typeof value.title === 'string'
      ? value.title
      : typeof value.name === 'string'
        ? value.name
        : typeof value.url === 'string'
          ? value.url
          : `Reference ${index + 1}`

  return referenceFromText(text, index)
}

function referenceFromText(text: string, index: number): ProtocolReference {
  const [title, ...meta] = text.split(',')
  const trimmedTitle = title.trim()
  const trimmedMeta = meta.join(',').trim()

  return {
    title: trimmedTitle === '' ? `Reference ${index + 1}` : trimmedTitle,
    ...(trimmedMeta !== '' ? { meta: trimmedMeta } : {}),
  }
}

function isProtocolStage(value: ProtocolStage | null): value is ProtocolStage {
  return value !== null
}

function isProtocolStep(value: ProtocolStepDetails | null): value is ProtocolStepDetails {
  return value !== null
}

function isProtocolMaterial(value: ProtocolMaterial | null): value is ProtocolMaterial {
  return value !== null
}

function isProtocolReference(value: ProtocolReference | null): value is ProtocolReference {
  return value !== null
}

function parseProtocolModelRepr(value: string): unknown {
  const trimmed = stripStringWrapper(value.trim())
  if (!trimmed.includes('widget_name=') || !trimmed.includes('stages=')) return null

  return readModelRepr(trimmed)
}
