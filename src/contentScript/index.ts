export {}

const SOURCE = '__INERTIA_INSPECTOR__'
const RESPONSE_TIMEOUT_MS = 500

const injectMainWorldScript = () => {
  try {
    const url = chrome.runtime.getURL('mainWorld.js')
    const existing = document.querySelector(`script[data-inertia-inspector-src="${url}"]`)
    if (existing) return
    const script = document.createElement('script')
    script.src = url
    script.async = false
    script.dataset.inertiaInspectorSrc = url
    const target = document.documentElement || document.head || document.body
    if (!target) return
    target.appendChild(script)
    script.addEventListener('load', () => script.remove(), { once: true })
    script.addEventListener('error', () => script.remove(), { once: true })
  } catch {
    // chrome.runtime.getURL can throw if the extension context is invalid; ignore.
  }
}

injectMainWorldScript()

type InertiaPage = {
  component?: string
  props?: Record<string, unknown>
  url?: string
  version?: string | number | null
  [key: string]: unknown
}

type ResponseMessage = {
  source: typeof SOURCE
  type: 'RESPONSE'
  id: string
  page: InertiaPage | null
}

const isResponseMessage = (value: unknown): value is ResponseMessage => {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return v.source === SOURCE && v.type === 'RESPONSE' && typeof v.id === 'string'
}

const readDataPageFromDom = (): InertiaPage | null => {
  const el = document.querySelector<HTMLElement>('[data-page]')
  const raw = el?.dataset?.page
  if (!raw) return null
  try {
    return JSON.parse(raw) as InertiaPage
  } catch {
    try {
      return JSON.parse(decodeURIComponent(raw)) as InertiaPage
    } catch (error) {
      console.error('JSON parsing error: ', error)
      return null
    }
  }
}

const newRequestId = (): string => {
  const cryptoApi = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto
  if (cryptoApi?.randomUUID) return cryptoApi.randomUUID()
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

const requestPageFromMainWorld = (): Promise<InertiaPage | null> =>
  new Promise((resolve) => {
    const id = newRequestId()
    let settled = false

    const settle = (page: InertiaPage | null) => {
      if (settled) return
      settled = true
      window.removeEventListener('message', onMessage)
      clearTimeout(timer)
      resolve(page)
    }

    const onMessage = (event: MessageEvent) => {
      if (event.source !== window) return
      if (!isResponseMessage(event.data)) return
      if (event.data.id !== id) return
      settle(event.data.page)
    }

    window.addEventListener('message', onMessage)

    const timer = setTimeout(() => settle(readDataPageFromDom()), RESPONSE_TIMEOUT_MS)

    window.postMessage({ source: SOURCE, type: 'GET', id }, '*')
  })

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== 'LOG_PAGE_DATA') {
    sendResponse({ warn: 'Unknown message type' })
    return false
  }

  requestPageFromMainWorld()
    .then((page) => {
      const data = page ?? readDataPageFromDom()
      if (data) {
        console.log('data-page: ', data)
        sendResponse({ data })
      } else {
        sendResponse({ warn: 'No Inertia props found on this page.' })
      }
    })
    .catch((error) => {
      console.error('Inertia Props Inspector error: ', error)
      sendResponse({ error: error instanceof Error ? error.message : String(error) })
    })

  return true
})
