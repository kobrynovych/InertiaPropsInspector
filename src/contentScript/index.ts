function getPageData(): unknown {
  const el = document.querySelector<HTMLElement>('[data-page]')
  if (!el?.dataset?.page) return null

  try {
    return JSON.parse(el.dataset.page)
  } catch {
    try {
      return JSON.parse(decodeURIComponent(el.dataset.page))
    } catch (error) {
      console.error('JSON parsing error: ', error)
      return null
    }
  }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === 'LOG_PAGE_DATA') {
    const data = getPageData()
    if (data) {
      console.log('data-page: ', data)
      sendResponse({ data })
    } else {
      sendResponse({ warn: 'No data-page found on this page.' })
    }
  } else {
    sendResponse({ warn: 'Unknown message type' })
  }
  return true
})
