import {
  EllipsisIcon,
  ExternalLinkIcon,
  ListOrderedIcon,
  Maximize2Icon,
  X,
} from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { ProtocolSummaryCard } from '@/components/protocol-summary-card'
import type { ProtocolMaterial, StructuredProtocolWidgetFields } from '@/lib/protocol-widget'
import { cn } from '@/lib/utils'

interface StructuredProtocolCardProps {
  protocol: StructuredProtocolWidgetFields
  className?: string
}

interface MaterialRecord {
  material: ProtocolMaterial
  stages: { index: number; name: string }[]
}

export function StructuredProtocolCard({ protocol, className }: StructuredProtocolCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [expandedStages, setExpandedStages] = useState<Set<number>>(() => new Set())
  const materials = useMemo(() => collectMaterials(protocol), [protocol])

  if (!showDetails) {
    return (
      <ProtocolSummaryCard
        protocol={protocol}
        materialCount={materials.length}
        className={className}
        onViewSteps={() => {
          setShowDetails(true)
        }}
      />
    )
  }

  return (
    <section
      className={cn(
        'not-prose my-4 overflow-hidden rounded-[10px] bg-[#f8f8f8] text-[#191919] shadow-xl shadow-black/20',
        className,
      )}
      aria-label="Protocol"
    >
      <header className="flex h-16 items-center justify-between border-b border-[#dedede] px-5 sm:px-7">
        <div className="flex min-w-0 items-center gap-3 text-lg font-medium text-[#222222]">
          <ListOrderedIcon className="size-5 shrink-0" />
          <span className="truncate">Protocol</span>
        </div>
        <div className="flex items-center gap-6 text-[#202020]">
          <button
            type="button"
            aria-label="Return to compact protocol"
            title="Return to compact protocol"
            aria-expanded={true}
            onClick={() => {
              setShowDetails(false)
            }}
            className="rounded p-1 hover:bg-zinc-200 focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <Maximize2Icon className="size-5" aria-hidden="true" />
          </button>
          <EllipsisIcon className="hidden size-5 sm:block" aria-hidden="true" />
          <button
            type="button"
            aria-label="Collapse protocol"
            aria-expanded={true}
            onClick={() => {
              setShowDetails(false)
            }}
            className="rounded p-1 hover:bg-zinc-200 focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
      </header>

      <div className="px-5 py-10 sm:px-9 sm:py-12">
        <h3 className="m-0 max-w-[560px] text-[2rem] leading-[1.08] font-medium tracking-normal text-[#191919] sm:text-[2.3125rem]">
          {protocol.title}
        </h3>
        <p className="mt-2 mb-10 text-[1.1875rem] text-[#545454] sm:mb-12 sm:text-[1.3125rem]">
          {protocol.stages.length} Stages / {materials.length} Materials
        </p>

        <div className="mb-12 grid gap-3 sm:grid-cols-2">
          <Button
            type="button"
            variant="secondary"
            className="h-16 justify-center rounded-lg bg-[#ebebeb] px-4 text-base font-normal text-[#4a4a4a] hover:bg-[#e1e1e1]"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M14.8806 1.59509C16.0487 3.4077 13.91 7.75006 10.1097 11.2886C6.30941 14.8271 2.28703 16.222 1.11897 14.4015C-0.0490837 12.5889 2.08961 8.24656 5.8899 4.70804C9.69019 1.17741 13.7208 -0.217509 14.8806 1.59509Z" stroke="#383B3C" stroke-width="1.125" stroke-miterlimit="10"/>
<path d="M14.4005 14.8815C12.5879 16.0498 8.24558 13.9107 4.70707 10.1096C1.17643 6.30852 -0.218485 2.28528 1.59412 1.11698C3.40672 -0.0430904 7.74909 2.08783 11.2876 5.88892C14.8261 9.69001 16.221 13.7132 14.4005 14.8815Z" stroke="#383B3C" stroke-width="1.125" stroke-miterlimit="10"/>
</svg>

            <span className="min-w-0 truncate">View in chat</span>
          </Button>
          <Button
            type="button"
            className="h-16 justify-center rounded-lg bg-[#151515] px-4 text-base font-normal text-white"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12.3064 13.0731C12.7197 13.7993 13.9762 14.5073 14.3043 15.3488C14.4516 15.7265 13.3633 16.3517 13.1451 16.5287C12.1794 17.3119 11.0147 17.7021 9.82742 17.8884C8.21214 18.1521 6.55984 17.9432 5.04774 17.2842C4.30185 16.9658 3.81126 16.6498 3.20402 16.0943C2.94124 15.854 2.62296 15.6772 2.38592 15.3884C2.22999 15.1984 2.0949 15.0174 1.95768 14.8127C1.21617 13.8419 0.576589 12.6594 0.282176 11.4424C0.251921 11.3172 0.0477564 10.3265 0.0431895 10.2352C0.0075879 9.52449 -0.0411692 8.324 0.0621583 7.62567C0.180848 6.82328 0.488987 5.68652 0.819054 4.94866C0.896511 4.77549 0.989441 4.63523 1.07582 4.47503C1.15748 4.35067 1.32684 3.97189 1.40972 3.87125C1.73468 3.52082 2.00922 2.95765 2.35161 2.64324C2.82915 2.20474 3.4365 1.69632 3.96242 1.32232C4.39581 1.01413 5.01096 0.810287 5.49268 0.588457C5.83941 0.428787 6.22779 0.290089 6.59276 0.195617C7.66078 -0.0458041 8.69104 -0.0501086 9.7659 0.108071C10.6265 0.234713 11.355 0.541221 12.1379 0.939746C12.5605 1.1549 13.055 1.42295 13.448 1.6927C13.6754 1.84878 14.306 2.40968 14.3577 2.68526C14.3105 2.86328 12.5626 4.66633 12.3105 4.94435C11.8652 5.47264 11.3645 5.96233 10.8905 6.46036C10.35 7.03274 9.81489 7.61097 9.28543 8.19497C9.07875 8.41988 8.7102 8.77758 8.53714 8.99203C8.75139 9.23721 9.02627 9.59594 9.25288 9.81041C9.92212 10.4437 10.5128 11.0893 11.1182 11.788C11.5023 12.2313 12.0015 12.5158 12.3064 13.0731Z" fill="white"/>
<path d="M12.32 13.0141C11.3616 13.883 10.5364 14.3992 9.27434 14.5939C6.26928 15.0577 3.52606 12.9376 3.12907 9.72851C2.94702 8.16812 3.34572 6.59385 4.24008 5.34166C4.52761 4.9455 4.77149 4.76133 5.13187 4.46383C5.95295 3.78601 6.74971 3.38226 7.78979 3.23341C8.82018 3.08594 10.0349 3.31883 10.9464 3.85422C11.3917 4.11579 11.9119 4.54572 12.3241 4.8854C11.8788 5.41368 11.3781 5.90335 10.9041 6.40141C10.3635 6.97378 9.82848 7.55199 9.29903 8.13599C9.09232 8.36092 8.7238 8.7186 8.55074 8.93307C8.76496 9.17824 9.03987 9.53698 9.26648 9.75146C9.93569 10.3847 10.5264 11.0304 11.1317 11.729C11.5159 12.1723 12.0151 12.4568 12.32 13.0141Z" fill="white"/>
<path d="M14.9305 5.69629C15.027 5.78465 14.994 6.04121 15.0359 6.19008C15.3421 7.27671 15.8313 8.24313 16.8257 8.74866C17.2861 8.98268 17.4709 9.08715 17.9858 9.22866C17.5376 9.34892 17.156 9.45763 16.7799 9.73232C15.9774 10.3116 15.2797 11.1008 15.0739 12.1388C15.0519 12.2493 15.0018 12.6615 14.9464 12.7001L14.9219 12.655C14.8877 12.2895 14.8159 12.3075 14.707 12.0108C14.5313 11.528 14.3613 11.0926 14.0441 10.6886C13.413 9.88457 12.7546 9.39909 11.7861 9.26033C12.4222 9.0125 12.458 9.03028 13.0867 8.66C13.8247 8.27072 14.2341 7.48469 14.5799 6.72814C14.7708 6.31064 14.8113 6.13018 14.9305 5.69629Z" fill="white"/>
</svg>
            <span>Export to Labguru</span>

          </Button>
        </div>

        <ProtocolSection title="Stages">
          <div className="grid gap-3.5">
            {protocol.stages.map((stage, stageIndex) => {
              const expanded = expandedStages.has(stageIndex)

              return (
                <article key={`${stage.stageName}-${stageIndex}`} className="overflow-hidden rounded-lg bg-[#ececec]">
                  <button
                    type="button"
                    className="flex min-h-[5.5rem] w-full items-center justify-between gap-4 bg-transparent px-5 text-left text-lg text-[#202020] sm:px-7 sm:text-xl"
                    aria-expanded={expanded}
                    aria-controls={`protocol-stage-${stageIndex}`}
                    onClick={() => {
                      setExpandedStages((current) => {
                        const next = new Set(current)
                        if (next.has(stageIndex)) next.delete(stageIndex)
                        else next.add(stageIndex)
                        return next
                      })
                    }}
                  >
                    <span className="min-w-0 truncate">
                      Stage {stageIndex + 1} · {stage.stageName}
                    </span>
                    <span
                      aria-hidden="true"
                      className={cn(
                        'size-3.5 shrink-0 rotate-45 border-t-2 border-r-2 border-[#1f1f1f] transition-transform',
                        expanded && 'rotate-[135deg]',
                      )}
                    />
                  </button>

                  {expanded && (
                    <div id={`protocol-stage-${stageIndex}`} className="px-5 pb-6 text-[#2a2a2a] sm:px-7">
                      {stage.steps.length > 0 ? (
                        <ol className="m-0 grid list-none gap-4 p-0 pt-1">
                          {stage.steps.map((step, stepIndex) => (
                            <li key={`${step.stepName}-${stepIndex}`} className="border-t border-[#cfcfcf] pt-4">
                              <p className="m-0 mb-1.5 flex items-center gap-2.5 text-[1.0625rem] font-bold text-[#202020]">
                                {step.stepName}
                                {step.optional && (
                                  <span className="shrink-0 rounded-full border border-[#b7b7b7] px-2 py-0.5 text-xs font-medium text-[#565656]">
                                    Optional
                                  </span>
                                )}
                              </p>
                              <p className="m-0 text-base leading-6 text-[#545454]">{step.instruction}</p>
                            </li>
                          ))}
                        </ol>
                      ) : (
                        <p className="m-0 text-base leading-6 text-[#545454]">No steps are listed for this stage.</p>
                      )}

                      {stage.materials.length > 0 && (
                        <div className="mt-5 rounded-lg border border-[#cfcfcf] bg-[#f6f6f6] px-4 py-3.5 text-[0.9375rem] leading-6 text-[#545454]">
                          <p className="m-0 mb-2 font-bold text-[#303030]">Materials</p>
                          <ul className="m-0 list-disc pl-5">
                            {stage.materials.map((material, materialIndex) => (
                              <li key={`${materialKey(material)}-${materialIndex}`}>{formatMaterial(material)}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        </ProtocolSection>

        <ProtocolSection
          title="Materials for this protocol"
          action={
            <Button
              type="button"
              disabled={materials.length === 0}
              className="h-10 rounded-full bg-[#ee3134] px-4 text-base font-normal text-white hover:bg-[#d6292c] disabled:bg-[#d8d8d8] disabled:text-[#777777]"
            >
              Add all to cart
            </Button>
          }
        >
          {materials.length === 0 ? (
            <div className="min-h-24 rounded-lg border border-[#cfcfcf] bg-[#fafafa] p-6 text-[1.0625rem] text-[#545454]">
              No materials are listed in this protocol.
            </div>
          ) : (
            <div className="grid gap-3.5">
              {materials.map((materialRecord, index) => (
                <MaterialCard
                  key={`${materialKey(materialRecord.material)}-${index}`}
                  materialRecord={materialRecord}
                />
              ))}
            </div>
          )}
        </ProtocolSection>

        <ProtocolSection title="Sources referenced">
          <div className="grid gap-0">
            {protocol.references.length === 0 ? (
              <div className="min-h-20 border-b border-[#cfcfcf] py-6 text-[#545454]">No sources are listed.</div>
            ) : (
              protocol.references.map((reference, index) => (
                <article
                  key={`${reference.title}-${index}`}
                  className="grid min-h-20 grid-cols-[minmax(0,1fr)_24px] items-center gap-4 border-b border-[#cfcfcf]"
                >
                  <div className="min-w-0">
                    <p className="m-0 truncate text-xl font-medium text-[#222222]">{reference.title}</p>
                    <p className="m-0 text-[0.9375rem] text-[#545454]">{reference.meta ?? 'Reference'}</p>
                  </div>
                  <ExternalLinkIcon className="size-5 text-[#141414]" />
                </article>
              ))
            )}
          </div>
        </ProtocolSection>

        <ProtocolSection title="Notes">
          <div className="min-h-24 rounded-lg border border-[#bdbdbd] p-4 text-lg text-[#545454]">
            Add any notes to capture context that lives with this card...
          </div>
          <Button
            type="button"
            variant="outline"
            className="mt-4 h-10 rounded-full border-[#bdbdbd] bg-white px-4 text-base font-normal text-[#4a4a4a]"
          >
            Add Note
          </Button>
        </ProtocolSection>
      </div>
    </section>
  )
}

function ProtocolSection({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="border-t border-[#cfcfcf] pt-7 not-first:mt-12">
      <div className={cn('mb-4 flex items-center gap-4', action ? 'justify-between' : 'justify-start')}>
        <h4 className="m-0 text-lg font-medium text-[#4a4a4a]">{title}</h4>
        {action}
      </div>
      {children}
    </section>
  )
}

function MaterialCard({ materialRecord }: { materialRecord: MaterialRecord }) {
  const { material, stages } = materialRecord

  return (
    <article className="grid gap-3 rounded-lg border border-[#cfcfcf] bg-[#fafafa] p-4.5">
      <p className="m-0 text-[1.1875rem] leading-tight font-bold text-[#202020]">
        {material.name ?? 'Unnamed product'}
      </p>

      <dl className="m-0 grid gap-x-4 gap-y-2.5 sm:grid-cols-2">
        <MaterialDetail label="Product ID" value={material.productId} />
        {/* <MaterialDetail label="ID Type" value={formatProductIdType(material.productIdType)} /> */}
        <MaterialDetail label="Quantity" value={material.quantity} />
        <MaterialDetail label="Unit size" value={material.unit_size} />
      </dl>

      {stages.length > 0 && (
        <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
          {stages.map((stage) => (
            <li
              key={`${stage.index}-${stage.name}`}
              className="rounded-full border border-[#c9c9c9] px-2.5 py-1 text-xs text-[#4a4a4a]"
            >
              Stage {stage.index}: {stage.name}
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}

function MaterialDetail({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="min-w-0">
      <dt className="m-0 mb-0.5 text-xs font-bold text-[#545454] uppercase">{label}</dt>
      <dd className="m-0 text-[0.9375rem] break-words text-[#2d2d2d]">{value ?? 'Not specified'}</dd>
    </div>
  )
}

function collectMaterials(protocol: StructuredProtocolWidgetFields): MaterialRecord[] {
  const materialMap = new Map<string, MaterialRecord>()

  protocol.materials.forEach((material) => {
    materialMap.set(materialKey(material), { material, stages: [] })
  })

  protocol.stages.forEach((stage, stageIndex) => {
    stage.materials.forEach((material) => {
      const key = materialKey(material)
      const existing = materialMap.get(key) ?? { material, stages: [] }
      existing.stages.push({ index: stageIndex + 1, name: stage.stageName })
      materialMap.set(key, existing)
    })
  })

  return [...materialMap.values()]
}

function materialKey(material: ProtocolMaterial): string {
  return material.productId ?? material.name ?? JSON.stringify(material)
}

function formatMaterial(material: ProtocolMaterial): string {
  return [
    material.name ?? 'Unknown material',
    material.productId ? `${formatProductIdType(material.productIdType) ?? 'ID'}: ${material.productId}` : '',
    material.quantity ? `Qty: ${material.quantity}` : '',
  ]
    .filter(Boolean)
    .join(' · ')
}

function formatProductIdType(value?: string): string | null {
  if (!value) return null

  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
