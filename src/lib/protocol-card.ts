export interface ProtocolStep {
  label: string
  output?: string
}

export interface ProtocolCardModel {
  title: string
  summary?: string
  steps: ProtocolStep[]
  footer?: string
}

const STEP_NUMBER_PATTERN = /^\d+[.)]?\s+/
const STEP_OUTPUT_PATTERN = /\s*(?:->|=>|→)\s*/

export function parseProtocolCard(text: string): ProtocolCardModel {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  const title = lines[0] ?? 'Protocol'
  const footerIndex = lines.findIndex((line) => /^created by\b/i.test(line) || /\bPub\.\s*/i.test(line))
  const bodyEnd = footerIndex === -1 ? lines.length : footerIndex
  const body = lines.slice(1, bodyEnd)
  const footer = footerIndex === -1 ? undefined : lines.slice(footerIndex).join(' ')
  const firstStepIndex = body.findIndex((line) => /^\d+[.)]?\s+/.test(line))
  const summaryLines = firstStepIndex === -1 ? body.slice(0, 1) : body.slice(0, firstStepIndex)
  const stepLines = firstStepIndex === -1 ? body.slice(summaryLines.length) : body.slice(firstStepIndex)
  const steps = stepLines.map(parseProtocolStep).filter((step) => step.label)

  return {
    title,
    summary: summaryLines.join(' '),
    steps,
    footer,
  }
}

function parseProtocolStep(line: string): ProtocolStep {
  const numbered = line.replace(STEP_NUMBER_PATTERN, '')
  const [label, output] = numbered.split(STEP_OUTPUT_PATTERN, 2).map((part) => part.trim())

  return {
    label,
    output,
  }
}
