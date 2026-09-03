import { describe, expect, it } from 'vitest'

import { conversationHref, readConversationIdFromUrl } from '@/hooks/useConversationIdFromUrl'

describe('conversation url helpers', () => {
  it('reads the conversation id from the query parameter', () => {
    const url = new URL('http://localhost:9000/?conversation=JB4eyW9wMVhqFzD_Fmj9a')

    expect(readConversationIdFromUrl(url)).toBe('/JB4eyW9wMVhqFzD_Fmj9a')
  })

  it('falls back to legacy path conversation ids when the query parameter is absent', () => {
    const url = new URL('http://localhost:9000/JB4eyW9wMVhqFzD_Fmj9a')

    expect(readConversationIdFromUrl(url)).toBe('/JB4eyW9wMVhqFzD_Fmj9a')
  })

  it('builds conversation links with a backend-safe app path', () => {
    expect(conversationHref('/JB4eyW9wMVhqFzD_Fmj9a')).toBe('/?conversation=JB4eyW9wMVhqFzD_Fmj9a')
    expect(conversationHref('/')).toBe('/')
  })
})
