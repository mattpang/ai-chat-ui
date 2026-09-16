import { ChevronRightIcon, ListOrderedIcon } from 'lucide-react'
import type { StructuredProtocolWidgetFields } from '@/lib/protocol-widget'
import { cn } from '@/lib/utils'

interface ProtocolSummaryCardProps {
  protocol: StructuredProtocolWidgetFields
  materialCount: number
  onViewSteps: () => void
  className?: string
}

export function ProtocolSummaryCard({ protocol, materialCount, onViewSteps, className }: ProtocolSummaryCardProps) {
  return (
    <section
      aria-label="Protocol"
      className={cn(
        'not-prose my-4 w-full max-w-md rounded-[24px] bg-[#2c302f] p-5 text-zinc-100 shadow-lg shadow-black/15 sm:p-6',
        className,
      )}
    >
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm">
          <ListOrderedIcon aria-hidden="true" className="size-5 shrink-0" />
          <span>Protocol</span>
        </div>
        <button
          type="button"
          onClick={onViewSteps}
          aria-expanded={false}
          className="flex shrink-0 items-center gap-2 rounded-full bg-zinc-300 px-4 py-2 text-sm text-zinc-900 hover:bg-zinc-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          View steps
          <ChevronRightIcon aria-hidden="true" className="size-4" />
        </button>
      </header>

      <h3 className="mt-9 text-2xl leading-tight font-normal break-words">{protocol.title}</h3>
      <p className="mt-2 text-sm text-zinc-300">
        {protocol.stages.length} {protocol.stages.length === 1 ? 'stage' : 'stages'} · {materialCount}{' '}
        {materialCount === 1 ? 'material' : 'materials'}
      </p>

      <ol className="mt-5 divide-y divide-white/20">
        {protocol.stages.slice(0, 3).map((stage, index) => (
          <li key={index} className="flex items-start gap-4 py-3 text-sm">
            <span className="text-lg tabular-nums">{index + 1}</span>
            <span className="min-w-0 flex-1 break-words">{stage.stageName}</span>
            <span className="shrink-0 text-xs text-zinc-300">
              {stage.steps.length} {stage.steps.length === 1 ? 'step' : 'steps'}
            </span>
          </li>
        ))}
      </ol>
      {protocol.stages.length > 3 && (
        <p className="mt-2 text-xs text-zinc-300">+{protocol.stages.length - 3} more stages</p>
      )}
      {protocol.references.length > 0 && (
        <p className="mt-7 text-xs leading-relaxed break-words text-zinc-300">
          {protocol.references[0].title}
          {protocol.references[0].meta ? ` · ${protocol.references[0].meta}` : ''}
        </p>
      )}
    </section>
  )
}
