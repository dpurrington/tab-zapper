'use strict';

// this is how you would add a handler for the action
chrome.action.onClicked.addListener((tab) => {
  chrome.action.setTitle({tabId: tab.id, title: `You are on tab: ${tab.id}`});
});

async function checkUrl(tab) {
  const result = await chrome.storage.sync.get(['sites']);
  const sites = result.sites;

  console.log(`checking to see if <${tab.url}> is in ${sites}`);
  if (tab.url) {
    sites.split(" ").forEach(s => {
      if (s === "") return;

      let re = new RegExp(s);
      if (re.test(tab.url)) {
        console.log(`matched ${s} with ${tab.url}`);
        chrome.tabs.remove(tab.id);
      }
    });
  }
}
chrome.tabs.onCreated.addListener(checkUrl);
chrome.tabs.onUpdated.addListener((id, changeInfo, tab) => checkUrl(tab));
