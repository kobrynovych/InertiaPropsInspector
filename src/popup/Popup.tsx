import { useState } from 'preact/hooks'
import './Popup.css'

type Status = { text: string; type: 'success' | 'warn' | 'error' } | null

export const Popup = () => {
  const [status, setStatus] = useState<Status>(null)

  const handleClick = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

      if (tab?.id) {
        const response = await chrome.tabs.sendMessage(tab.id, { type: 'LOG_PAGE_DATA' })

        const error = chrome.runtime.lastError
        if (error) {
          setStatus({ text: 'Could not connect to the page. Try refreshing.', type: 'error' })
          return
        }

        if (response?.data) {
          setStatus({ text: '✓ Props logged — check DevTools console (F12)', type: 'success' })
        } else if (response?.warn) {
          setStatus({ text: 'No Inertia props found on this page.', type: 'warn' })
        } else if (response?.error) {
          setStatus({ text: `Error: ${response.error}`, type: 'error' })
        } else {
          setStatus({ text: 'No Inertia props found on this page.', type: 'warn' })
        }
      }
    } catch {
      setStatus({ text: 'Could not connect to the page. Try refreshing.', type: 'error' })
    }
  }

  return (
    <main>
      <h3>Inertia Props Inspector</h3>
      <button onClick={handleClick}>Log Props to Console</button>
      {status && <p class={`status ${status.type}`}>{status.text}</p>}
      <a
        title="Support the developer"
        class="donate"
        href="https://ko-fi.com/S6S81VYZ0O"
        target="_blank"
        rel="noopener noreferrer"
      >
        ☕ Buy me a coffee
      </a>
    </main>
  )
}
