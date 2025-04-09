// console.log('background is running')

// chrome.commands.onCommand.addListener((command) => {
//   if (command === 'open_popup') {
//     chrome.tabs.create({ url: 'popup.html' });
//   }
// });

// chrome.commands.onCommand.addListener((command) => {
//   if (command === 'open_popup') {
//     console.log('Command received: open_popup');

//     chrome.tabs.create({ url: chrome.runtime.getURL('popup.html') });
//   }
// });

// chrome.commands.onCommand.addListener(async (command) => {
//   if (command === 'open_popup') {
//     console.log('Command received: open_popup');

//     chrome.tabs.create({ url: chrome.runtime.getURL('popup.html') });

//     const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

//     if (tab?.id) {
//       chrome.tabs.sendMessage(tab.id, { type: 'LOG_PAGE_DATA' });
//     }
//   }
// });

chrome.commands.onCommand.addListener((command) => {
  console.log(`Command: ${command}`)
})
