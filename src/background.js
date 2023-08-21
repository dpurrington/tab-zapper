'use strict';

// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GREETINGS') {
    const message = `Hi ${
      sender.tab ? 'Con' : 'Pop'
    }, my name is Bac. I am from Background. It's great to hear from you.`;

    // Log message coming from the `request` parameter
    console.log(request.payload.message);
    // Send a response message
    sendResponse({
      message,
    });
  }
});

function checkUrl(tab) {
  chrome.storage.sync.get(['sites'], function (result) {
    const sites = result.sites;
    console.log(`checking to see if <${tab.url}> is in ${sites}`);
    if (tab.url) {
      sites.split(" ").forEach(s => {
        if (s === "") return;

        let re = new RegExp(s);
        if (re.test(tab.url)) {
          console.log(`matched ${s} with ${tab.url}`);
          chrome.tabs.remove(tab.id);
          return;
        }
      });
    }
  });
}
chrome.tabs.onCreated.addListener(checkUrl);
chrome.tabs.onUpdated.addListener((id, changeInfo, tab) => checkUrl(tab));
