import { useState } from 'preact/hooks'
import './Popup.css'

export const Popup = () => {
  const [status, setStatus] = useState('')

  const handleClick = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

      if (tab?.id) {
        const response = await chrome.tabs.sendMessage(tab.id, { type: 'LOG_PAGE_DATA' })

        const error = chrome.runtime.lastError
        if (error) {
          setStatus('Failed to send message. Try refreshing the page.')
          return
        }

        if (response?.data) {
          setStatus('Data logged in console! Please check console.')
        } else if (response?.warn) {
          setStatus(`Warn: ${response.warn}`)
        } else if (response?.error) {
          setStatus(`Error: ${response.error}`)
        } else {
          setStatus('No data-page found on this page.')
        }
      }
    } catch {
      setStatus('Error getting data. Make sure content script is running. Try reloading the page.')
    }
  }

  return (
    <main>
      <h3>Inertia Props Inspector</h3>
      <button onClick={handleClick}>Print Data to Console</button>
      {status && <p className="status">{status}</p>}
    </main>
  )
}

export default Popup
