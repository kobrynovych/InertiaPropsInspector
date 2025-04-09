import React, { useState, useEffect } from 'react'
import './Popup.css'

export const Popup: React.FC = () => {
  const [status, setStatus] = useState<string>('')

  const handleClick = async () => {
    try {
      // We get the active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

      if (tab?.id) {
        // Sending a request to the content script
        const response = await chrome.tabs.sendMessage(tab.id, { type: 'LOG_PAGE_DATA' })

        const error = chrome.runtime.lastError
        if (error) {
          console.error('Failed to send message:', error.message)
          setStatus('Failed to send message. Try refreshing the page.')
          return
        }

        if (response?.data) {
          setStatus('Data logged in console! Please check console.')
        } else if (response?.warn) {
          console.warn('Warn: ', response.warn)
          setStatus(`Warn: ${response.warn}`)
        } else if (response?.error) {
          console.error('Error from content script:', response.error)
          setStatus(`Error: ${response.error}`)
        } else {
          setStatus('No data-page found on this page.')
        }
      }
    } catch (error) {
      console.error('Error:', error)
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
