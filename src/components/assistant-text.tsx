import { Markdown } from '@/components/markdown'
import { CitationButton } from '@/components/citation-button'
import { ProtocolCard } from '@/components/protocol-card'
import { Button } from '@/components/ui/button'
import { parseAssistantMarkers } from '@/lib/assistant-markers'
import { cn } from '@/lib/utils'

interface AssistantTextProps {
  text: string
  className?: string
  disabled?: boolean
  onFollowUp?: (text: string) => void
}

export function AssistantText({ text, className, disabled, onFollowUp }: AssistantTextProps) {
  const segments = parseAssistantMarkers(text)

  return (
    <div className={cn('space-y-3', className)}>
      {segments.map((segment, index) => {
        if (segment.type === 'text') {
          return (
            <Markdown key={index} className="h-auto text-[0.9375rem] leading-7">
              {segment.text}
            </Markdown>
          )
        }

        if (segment.type === 'citation') {
          return (
            <span key={index} className="not-prose inline-flex flex-wrap gap-1 align-baseline">
              {segment.documentIds.map((documentId) => (
                <CitationButton key={documentId} documentId={documentId} disabled={disabled} />
              ))}
            </span>
          )
        }

        if (segment.type === 'protocol') {
          return <ProtocolCard key={index} title={segment.title} text={segment.text} citations={segment.citations} />
        }

        return (
          <div key={index} className="not-prose space-y-2">
            <p className="text-sm font-medium leading-6">{segment.query}</p>
            <div className="flex flex-wrap gap-2">
              {segment.options.map((option) => (
                <Button
                  key={option}
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={disabled}
                  className="h-auto min-h-8 rounded-full whitespace-normal px-3 py-1.5 text-left"
                  onClick={() => {
                    onFollowUp?.(option)
                  }}
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
