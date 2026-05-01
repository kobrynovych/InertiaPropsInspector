export {}

type InertiaPage = {
  component?: string
  props?: Record<string, unknown>
  url?: string
  version?: string | number | null
  [key: string]: unknown
}

;(() => {
  const SOURCE = '__INERTIA_INSPECTOR__'
  let latestPage: InertiaPage | null = null
  let receivedAuthoritativePage = false

  const isPageObject = (value: unknown): value is InertiaPage => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return false
    const v = value as Record<string, unknown>
    return 'component' in v || 'props' in v || 'url' in v
  }

  const readDataPage = (): InertiaPage | null => {
    const el = document.querySelector<HTMLElement>('[data-page]')
    const raw = el?.dataset?.page
    if (!raw) return null
    try {
      const parsed = JSON.parse(raw)
      return isPageObject(parsed) ? parsed : null
    } catch {
      try {
        const parsed = JSON.parse(decodeURIComponent(raw))
        return isPageObject(parsed) ? parsed : null
      } catch {
        return null
      }
    }
  }

  const setPage = (page: InertiaPage | null, authoritative: boolean) => {
    if (!isPageObject(page)) return
    latestPage = page
    if (authoritative) receivedAuthoritativePage = true
  }

  const seed = readDataPage()
  if (seed) setPage(seed, false)

  const onInertiaEvent = (event: Event) => {
    const detail = (event as CustomEvent).detail
    if (!detail || typeof detail !== 'object') return
    const page = (detail as { page?: unknown }).page
    if (isPageObject(page)) setPage(page, true)
  }

  document.addEventListener('inertia:success', onInertiaEvent, true)
  document.addEventListener('inertia:navigate', onInertiaEvent, true)
  document.addEventListener('inertia:finish', onInertiaEvent, true)

  const refreshFromDom = () => {
    if (receivedAuthoritativePage) return
    const fresh = readDataPage()
    if (fresh) setPage(fresh, false)
  }

  const tryAdoptHistoryStatePage = (state: unknown) => {
    if (!state || typeof state !== 'object') return
    const candidate = (state as { page?: unknown }).page
    if (isPageObject(candidate)) setPage(candidate, true)
  }

  try {
    const origPushState = history.pushState
    history.pushState = function (state, ...rest) {
      const result = origPushState.call(
        this,
        state,
        ...(rest as [string, (string | URL | null)?]),
      )
      tryAdoptHistoryStatePage(state)
      if (!receivedAuthoritativePage) {
        queueMicrotask(refreshFromDom)
        setTimeout(refreshFromDom, 0)
      }
      return result
    }
    const origReplaceState = history.replaceState
    history.replaceState = function (state, ...rest) {
      const result = origReplaceState.call(
        this,
        state,
        ...(rest as [string, (string | URL | null)?]),
      )
      tryAdoptHistoryStatePage(state)
      if (!receivedAuthoritativePage) {
        queueMicrotask(refreshFromDom)
        setTimeout(refreshFromDom, 0)
      }
      return result
    }
  } catch {
    // Some pages freeze history; ignore — Inertia events still cover us.
  }

  window.addEventListener('popstate', (event) => {
    tryAdoptHistoryStatePage(event.state)
    if (!receivedAuthoritativePage) {
      queueMicrotask(refreshFromDom)
      setTimeout(refreshFromDom, 0)
    }
  })

  const observer = new MutationObserver((mutations) => {
    if (receivedAuthoritativePage) {
      observer.disconnect()
      return
    }
    for (const m of mutations) {
      if (m.type === 'attributes' && m.attributeName === 'data-page') {
        refreshFromDom()
        return
      }
      if (m.type === 'childList') {
        for (const node of Array.from(m.addedNodes)) {
          if (!(node instanceof Element)) continue
          if (node.matches?.('[data-page]') || node.querySelector?.('[data-page]')) {
            refreshFromDom()
            return
          }
        }
      }
    }
  })

  const startObserver = () => {
    const target = document.documentElement || document.body
    if (!target) return
    observer.observe(target, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['data-page'],
    })
  }

  if (document.documentElement) {
    startObserver()
  } else {
    document.addEventListener('readystatechange', startObserver, { once: true })
  }

  type GetMessage = { source: typeof SOURCE; type: 'GET'; id: string }
  type ResponseMessage = {
    source: typeof SOURCE
    type: 'RESPONSE'
    id: string
    page: InertiaPage | null
  }

  const isGetMessage = (value: unknown): value is GetMessage => {
    if (!value || typeof value !== 'object') return false
    const v = value as Record<string, unknown>
    return v.source === SOURCE && v.type === 'GET' && typeof v.id === 'string'
  }

  const safeClone = (value: unknown): InertiaPage | null => {
    if (!value) return null
    try {
      return JSON.parse(JSON.stringify(value))
    } catch {
      return null
    }
  }

  const pickFreshestPage = (): InertiaPage | null => {
    if (!receivedAuthoritativePage) {
      try {
        const state = history.state
        if (state && typeof state === 'object') {
          const candidate = (state as { page?: unknown }).page
          if (isPageObject(candidate)) return candidate
        }
      } catch {
        // history.state may throw under strict CSP — fall through.
      }
    }
    try {
      const exposed = (window as unknown as { Inertia?: { page?: unknown } }).Inertia
      if (exposed && isPageObject(exposed.page)) return exposed.page
    } catch {
      // window.Inertia may throw under strict CSP / proxies — fall through.
    }
    if (latestPage) return latestPage
    return readDataPage()
  }

  window.addEventListener('message', (event) => {
    if (event.source !== window) return
    if (!isGetMessage(event.data)) return

    const fresh = pickFreshestPage()
    const response: ResponseMessage = {
      source: SOURCE,
      type: 'RESPONSE',
      id: event.data.id,
      page: safeClone(fresh),
    }
    try {
      window.postMessage(response, '*')
    } catch {
      window.postMessage(
        { source: SOURCE, type: 'RESPONSE', id: event.data.id, page: null },
        '*',
      )
    }
  })
})()
