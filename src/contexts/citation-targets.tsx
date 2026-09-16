import { createContext, useContext, type ReactNode } from 'react'

const CitationScope = createContext('')

export function CitationTargetsProvider({ messageId, children }: { messageId: string; children: ReactNode }) {
  return <CitationScope.Provider value={messageId}>{children}</CitationScope.Provider>
}

export function useCitationCardId(documentId?: string): string | undefined {
  const messageId = useContext(CitationScope)
  return documentId ? `journal-card-${encodeURIComponent(JSON.stringify([messageId, documentId]))}` : undefined
}
