export function readModelRepr(value: string): unknown {
  const parser = new ModelReprParser(stripStringWrapper(value.trim()))
  return parser.parseTopLevelFields()
}

export function stripStringWrapper(value: string): string {
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

const INVALID_VALUE = Symbol('invalid model repr value')

function isDigit(value: string | undefined): boolean {
  return value !== undefined && value >= '0' && value <= '9'
}
