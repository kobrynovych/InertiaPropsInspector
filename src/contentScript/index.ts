// console.info('contentScript is running')

let pageData2: any = null

;(() => {
  document.addEventListener('DOMContentLoaded', () => {
    const el: HTMLElement | null = document.querySelector('[data-page]')

    if (el?.dataset?.page) {
      try {
        // const pageData: any = JSON.parse(decodeURIComponent(el.dataset.page));
        // // console.log('data-page: ', pageData);

        // // Save to Chrome storage
        // chrome.storage.local.set({ pageData }, () => {
        //   // console.log('Data saved:', pageData);
        // });

        pageData2 = JSON.parse(decodeURIComponent(el.dataset.page))
      } catch (error) {
        console.error('JSON parsing error: ', error)
      }
    }
  })
})()

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  try {
    if (message?.type === 'LOG_PAGE_DATA') {
      // chrome.storage.local.get('pageData', (result) => {
      //   const error = chrome.runtime.lastError;
      //   if (error) {
      //     console.error('chrome.storage error:', error);
      //     sendResponse({ error: error.message });
      //     return;
      //   }

      //   console.log('data-page: ', result.pageData);
      //   sendResponse({ data: result.pageData });
      // });

      if (pageData2) {
        console.log('data-page: ', pageData2)
        sendResponse({ data: pageData2 })
      } else {
        console.warn('No data-page found on this page.')
        sendResponse({ warn: 'No data-page found on this page.' })
      }
    } else {
      console.warn('Unknown message type:', message.type)
      sendResponse({ warn: 'Unknown message type' })
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    sendResponse({ error: 'Unexpected error occurred' })
  }

  // Required when sendResponse is used asynchronously
  return true
})
