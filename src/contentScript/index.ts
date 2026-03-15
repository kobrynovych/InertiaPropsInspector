let pageData: unknown = null

document.addEventListener('DOMContentLoaded', () => {
  const el = document.querySelector<HTMLElement>('[data-page]')

  if (el?.dataset?.page) {
    try {
      pageData = JSON.parse(decodeURIComponent(el.dataset.page))
    } catch (error) {
      console.error('JSON parsing error: ', error)
    }
  }
})

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === 'LOG_PAGE_DATA') {
    if (pageData) {
      console.log('data-page: ', pageData)
      sendResponse({ data: pageData })
    } else {
      sendResponse({ warn: 'No data-page found on this page.' })
    }
  } else {
    sendResponse({ warn: 'Unknown message type' })
  }
  return true
})
