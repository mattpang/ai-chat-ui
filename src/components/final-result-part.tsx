import { AssistantText } from '@/components/assistant-text'
import { ProtocolCard } from '@/components/protocol-card'
import { Button } from '@/components/ui/button'
import { finalResultPayloadOfPart } from '@/lib/final-result'
import type { DynamicToolUIPart, ToolUIPart } from 'ai'
import { ExternalLinkIcon } from 'lucide-react'

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
            {widget.url ? (
              <Button asChild variant="secondary" size="sm" className="h-7 rounded-full px-3 text-xs">
                <a href={widget.url} rel="noreferrer" target="_blank" aria-label={`Citation ${widget.documentId}`}>
                  {widget.documentId}
                  <ExternalLinkIcon className="size-3" />
                </a>
              </Button>
            ) : (
              <Button type="button" variant="secondary" size="sm" className="h-7 rounded-full px-3 text-xs">
                {widget.documentId}
              </Button>
            )}
          </div>
        )
      })}
    </div>
  )
}
