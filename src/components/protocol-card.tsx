import { Markdown } from '@/components/markdown'
import { StructuredProtocolCard } from '@/components/structured-protocol-card'
import { readProtocolWidgetJson, readStructuredProtocolWidgetJson } from '@/lib/protocol-widget'
import { cn } from '@/lib/utils'
import { ExternalLinkIcon, ListOrderedIcon } from 'lucide-react'

interface ProtocolCardProps {
  text: string
  title?: string
  citations?: string[]
  className?: string
}

export function ProtocolCard({ text, title, citations, className }: ProtocolCardProps) {
  const structuredProtocol = readStructuredProtocolWidgetJson(text)
  if (structuredProtocol !== null) {
    return <StructuredProtocolCard protocol={structuredProtocol} className={className} />
  }

  const parsedProtocol = readProtocolWidgetJson(text)
  const cardTitle = title ?? parsedProtocol?.title ?? 'Protocol'
  const cardText = parsedProtocol?.text ?? text
  const cardCitations = citations ?? parsedProtocol?.citations

  return (
    <section
      className={cn(
        'not-prose my-4 overflow-hidden rounded-[28px] bg-zinc-900 p-6 text-zinc-50 shadow-xl shadow-black/15 sm:p-8',
        className,
      )}
      aria-label="Protocol"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <ListOrderedIcon className="size-6 shrink-0 text-zinc-100" />
          <span className="truncate text-2xl font-medium">{cardTitle}</span>
        </div>
        <ExternalLinkIcon className="size-6 shrink-0 text-zinc-100" />
      </div>

      <Markdown className="mt-10 h-auto text-xl leading-8 text-zinc-100 sm:text-2xl">{cardText}</Markdown>

      {cardCitations !== undefined && cardCitations.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {cardCitations.map((citation) => (
            <span key={citation} className="rounded-full bg-zinc-50/10 px-2.5 py-1 text-xs text-zinc-200">
              {citation}
            </span>
          ))}
        </div>
      )}
    </section>
  )
}
