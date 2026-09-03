import { useState, useEffect } from 'react'
import { stripBasePath, withBasePath } from '@/lib/base-path'

const CONVERSATION_PARAM = 'conversation'

export function useConversationIdFromUrl(): [string, (id: string) => void] {
  const [conversationId, setConversationId] = useState(() => {
    return readConversationIdFromUrl()
  })

  useEffect(() => {
    const handlePopState = () => {
      const newId = readConversationIdFromUrl()
      setConversationId(newId)
      canonicalizeLegacyConversationPath(newId)
    }

    canonicalizeLegacyConversationPath(conversationId)
    window.addEventListener('popstate', handlePopState)
    // local event to handle same-tab updates
    window.addEventListener('history-state-changed', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('history-state-changed', handlePopState)
    }
  }, [conversationId])

  const setConversationIdAndUrl = (id: string) => {
    setConversationId(id)
    window.history.pushState({}, '', conversationUrl(id))
    // Notify other hook instances (e.g. the sidebar's active marker) to re-read the URL.
    window.dispatchEvent(new Event('history-state-changed'))
  }

  return [conversationId, setConversationIdAndUrl]
}

export function readConversationIdFromUrl(url = new URL(window.location.toString())): string {
  const fromParam = normalizeConversationId(url.searchParams.get(CONVERSATION_PARAM))
  if (fromParam !== '/') return fromParam

  return normalizeConversationId(stripBasePath(url.pathname))
}

export function conversationUrl(id: string): string {
  const url = new URL(window.location.toString())
  url.pathname = withBasePath('/')
  url.searchParams.delete(CONVERSATION_PARAM)

  const normalized = normalizeConversationId(id)
  if (normalized !== '/') {
    url.searchParams.set(CONVERSATION_PARAM, normalized.slice(1))
  }

  return url.toString()
}

export function conversationHref(id: string): string {
  const normalized = normalizeConversationId(id)
  const base = withBasePath('/')
  if (normalized === '/') return base

  const params = new URLSearchParams({ [CONVERSATION_PARAM]: normalized.slice(1) })
  return `${base}?${params.toString()}`
}

function normalizeConversationId(id: string | null): string {
  const trimmed = id?.trim() ?? ''
  if (trimmed === '' || trimmed === '/') return '/'
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
}

function canonicalizeLegacyConversationPath(id: string): void {
  const url = new URL(window.location.toString())
  if (url.searchParams.has(CONVERSATION_PARAM)) return
  if (normalizeConversationId(stripBasePath(url.pathname)) === '/') return
  window.history.replaceState({}, '', conversationUrl(id))
}
