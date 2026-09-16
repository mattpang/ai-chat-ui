import { BookOpenIcon, ChevronDownIcon, ExternalLinkIcon, FileTextIcon } from 'lucide-react'
import { useId, useState } from 'react'
import { journalCardHref, type JournalCardModel } from '@/lib/journal-widget'

export function JournalCards({ cards }: { cards: JournalCardModel[] }) {
  return (
    <section aria-label="Sources" className="not-prose my-4 grid grid-cols-1 items-start gap-3 sm:grid-cols-3">
      {cards.map((card, index) => (
        <JournalCard key={index} card={card} />
      ))}
    </section>
  )
}

function JournalCard({ card }: { card: JournalCardModel }) {
  const [expanded, setExpanded] = useState(false)
  const detailsId = useId()
  const isJournal = card.card_type === 'Journal'
  const Icon = isJournal ? BookOpenIcon : FileTextIcon
  const href = journalCardHref(card)
  const details = [
    ['Why this is relevant', card.related_reason],
    ['Abstract', card.abstract],
    ['Journal', card.journal_name],
    ['Source URL', card.url],
    ['DOI', card.doi],
  ].filter(([, value]) => value)

  return (
    <article className="relative flex min-h-60 min-w-0 flex-col rounded-[18px] bg-zinc-100 p-4 text-zinc-900 shadow-lg shadow-black/10 dark:text-zinc-100">
      <div className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
        <Icon aria-hidden="true" className="size-4 shrink-0" />
        <span>{isJournal ? 'Journal article' : 'Document'}</span>
        <ChevronDownIcon
          aria-hidden="true"
          className={`ml-auto size-4 shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}
        />
      </div>
      <h3 className="mt-6 mb-8 text-lg leading-snug font-normal break-words">
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={detailsId}
          onClick={() => {
            setExpanded((value) => !value)
          }}
          className="cursor-pointer text-left after:absolute after:inset-0 after:rounded-[16px] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-4"
        >
          {card.title}
        </button>
      </h3>
      <div className="mt-auto flex items-end justify-between gap-2 text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
        <span className="min-w-0 break-words">{isJournal ? card.journal_name : null}</span>
        {href && (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${card.title}`}
            className="relative z-10 shrink-0 rounded p-1 hover:bg-zinc-200 focus-visible:outline-2 focus-visible:outline-offset-4 dark:hover:bg-zinc-800"
          >
            <ExternalLinkIcon aria-hidden="true" className="size-4" />
          </a>
        )}
      </div>
      <div
        id={detailsId}
        hidden={!expanded}
        className="relative z-10 mt-4 pt-4"
      >
        <dl className="space-y-4 text-sm leading-relaxed">
          {details.map(([label, value]) => (
            <div key={label}>
              <dt className="mb-1 font-medium">{label}</dt>
              <dd className="break-words whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </article>
  )
}
