import { isRecord } from '@/lib/is-record'

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
  unit_size?:string
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

  const parser = new ModelReprParser(trimmed)
  return parser.parseTopLevelFields()
}

function stripStringWrapper(value: string): string {
  if (value.length < 2) return value
  const quote = value[0]
  if ((quote !== "'" && quote !== '"') || value.at(-1) !== quote) return value

  try {
    if (quote === '"') {
      const parsed: unknown = JSON.parse(value)
      return typeof parsed === 'string' ? parsed : value
    }
  } catch {
    // Fall through to a simple trim. Pydantic reprs are not JSON strings when
    // they contain unescaped single quotes, but they are still useful to parse.
  }

  return value.slice(1, -1)
}

class ModelReprParser {
  private cursor = 0
  private readonly source: string

  constructor(source: string) {
    this.source = source
  }

  parseTopLevelFields(): Record<string, unknown> | null {
    const fields = this.parseFields()
    this.skipWhitespace()
    return fields !== null && this.cursor === this.source.length ? fields : null
  }

  private parseFields(until?: string): Record<string, unknown> | null {
    const fields: Record<string, unknown> = {}

    while (this.cursor < this.source.length) {
      this.skipSeparators()
      if (until && this.source[this.cursor] === until) {
        this.cursor += 1
        return fields
      }

      const key = this.parseIdentifier()
      if (key === null) return null

      this.skipWhitespace()
      if (this.source[this.cursor] !== '=') return null
      this.cursor += 1

      const value = this.parseValue()
      if (value === INVALID_VALUE) return null
      fields[key] = value

      this.skipWhitespace()
      if (this.source[this.cursor] === ',') this.cursor += 1
    }

    return until ? null : fields
  }

  private parseValue(): unknown {
    this.skipWhitespace()

    const char = this.source[this.cursor]
    if (char === "'" || char === '"') return this.parseQuotedString(char)
    if (char === '[') return this.parseList()
    if (this.source.startsWith('None', this.cursor)) {
      this.cursor += 'None'.length
      return null
    }
    if (this.source.startsWith('True', this.cursor)) {
      this.cursor += 'True'.length
      return true
    }
    if (this.source.startsWith('False', this.cursor)) {
      this.cursor += 'False'.length
      return false
    }
    if (char === '-' || isDigit(char)) return this.parseNumber()

    const identifier = this.parseIdentifier()
    if (identifier === null) return INVALID_VALUE

    this.skipWhitespace()
    if (this.source[this.cursor] === '(') {
      this.cursor += 1
      return this.parseFields(')')
    }

    return identifier
  }

  private parseList(): unknown {
    this.cursor += 1
    const items: unknown[] = []

    while (this.cursor < this.source.length) {
      this.skipSeparators()
      if (this.source[this.cursor] === ']') {
        this.cursor += 1
        return items
      }

      const item = this.parseValue()
      if (item === INVALID_VALUE) return INVALID_VALUE
      items.push(item)

      this.skipWhitespace()
      if (this.source[this.cursor] === ',') this.cursor += 1
    }

    return INVALID_VALUE
  }

  private parseQuotedString(quote: string): unknown {
    this.cursor += 1
    let result = ''

    while (this.cursor < this.source.length) {
      const char = this.source[this.cursor]
      if (char === quote) {
        this.cursor += 1
        return result
      }
      if (char === '\\') {
        result += this.source[this.cursor + 1]
        this.cursor += 2
        continue
      }

      result += char
      this.cursor += 1
    }

    return INVALID_VALUE
  }

  private parseNumber(): unknown {
    const match = /^-?\d+(?:\.\d+)?/.exec(this.source.slice(this.cursor))
    if (!match) return INVALID_VALUE

    this.cursor += match[0].length
    return Number(match[0])
  }

  private parseIdentifier(): string | null {
    const match = /^[A-Za-z_][A-Za-z0-9_]*/.exec(this.source.slice(this.cursor))
    if (!match) return null

    this.cursor += match[0].length
    return match[0]
  }

  private skipWhitespace() {
    while (/\s/.test(this.source[this.cursor] ?? '')) this.cursor += 1
  }

  private skipSeparators() {
    while (/[\s,]/.test(this.source[this.cursor] ?? '')) this.cursor += 1
  }
}

const INVALID_VALUE = Symbol('invalid protocol model repr value')

function isDigit(value: string | undefined): boolean {
  return value !== undefined && value >= '0' && value <= '9'
}
