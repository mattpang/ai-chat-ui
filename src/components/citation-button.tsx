import { Button } from '@/components/ui/button'
import { useCitationCardId } from '@/contexts/citation-targets'

export function CitationButton({
  documentId,
  disabled,
  fallbackUrl,
}: {
  documentId: string
  disabled?: boolean
  fallbackUrl?: string
}) {
  const targetId = useCitationCardId(documentId)
  const className = 'h-6 rounded-full px-2 text-xs'
  if (disabled) {
    return (
      <Button disabled variant="secondary" size="sm" className={className} aria-label={`Citation ${documentId}`}>
        {documentId}
      </Button>
    )
  }
  return (
    <Button asChild variant="secondary" size="sm" className={className}>
      <a
        href={fallbackUrl ?? `#${encodeURIComponent(targetId ?? '')}`}
        target={fallbackUrl ? '_blank' : undefined}
        rel={fallbackUrl ? 'noopener noreferrer' : undefined}
        aria-label={`Citation ${documentId}`}
        onClick={(event) => {
          if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
          const card = targetId ? document.getElementById(targetId) : null
          if (!card && fallbackUrl) return
          event.preventDefault()
          if (!card) return
          card.focus({ preventScroll: true })
          card.scrollIntoView({ block: 'center', behavior: 'instant' })
        }}
      >
        {documentId}
      </a>
    </Button>
  )
}
