import { AssistantText } from '@/components/assistant-text'
import { ProtocolCard } from '@/components/protocol-card'
import { CitationButton } from '@/components/citation-button'
import { finalResultPayloadOfPart } from '@/lib/final-result'
import type { DynamicToolUIPart, ToolUIPart } from 'ai'

interface FinalResultPartProps {
  part: ToolUIPart | DynamicToolUIPart
  disabled?: boolean
  onFollowUp?: (text: string) => void
}

export function FinalResultPart({ part, disabled, onFollowUp }: FinalResultPartProps) {
  const payload = finalResultPayloadOfPart(part)
  if (payload === null) return null

  return (
    <div className="space-y-3">
      {payload.responseText !== '' && (
        <AssistantText text={payload.responseText} disabled={disabled} onFollowUp={onFollowUp} />
      )}

      {payload.widgets.map((widget, index) => {
        if (widget.widgetName === 'protocol') {
          return <ProtocolCard key={index} title={widget.title} text={widget.text} citations={widget.citations} />
        }

        return (
          <div key={index} className="not-prose">
            <CitationButton documentId={widget.documentId} disabled={disabled} fallbackUrl={widget.url} />
          </div>
        )
      })}
    </div>
  )
}
