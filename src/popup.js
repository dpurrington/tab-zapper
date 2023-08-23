'use strict';

import './popup.css';

(function() {
  const sitesStorage = {
    get: async function() {
      const result = await chrome.storage.sync.get(['sites']);
      return result.sites;
    },
    set: async function (value) {
      chrome.storage.sync.set(
        {
          sites: value,
        });
    },
  };

  function setupSites(initialValue = "") {
    console.log("Setting up sites: " + initialValue);
    document.getElementById('sites').value = initialValue;

    document.getElementById('zapBtn').addEventListener('click', async () => {
      const tabs = await chrome.tabs.query({active: true});
      console.log(tabs);
      const url = tabs[0].url;
      // get permission
      const result = await getPermissions(url)
      console.log("Permission result: " + result);
      if (result) {
        const sites = document.getElementById('sites')
        addSite(sites.value, url);
        chrome.tabs.remove(tabs[0].id);
      }
      window.close();
    });

    document.getElementById('saveBtn').addEventListener('click', () => {
      const sites = document.getElementById('sites');
      updateSites(sites.value);
      window.close();
    });
  }

  async function addSite(sites, site) {
    updateSites(sites + " " + site);
  }

  async function updateSites(sites) {
    console.log("Updating sites: " + sites);
    await sitesStorage.set(sites)
    document.getElementById('sites').innerHTML = sites;

    // Communicate with content script of
    // active tab by sending a message
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const tab = tabs[0];

    const response = await chrome.tabs.sendMessage(
      tab.id,
      {
        type: 'SITES',
        payload: {
          sites: sites
        },
      });

    console.log('Current sites value passed to contentScript file');
  }

  async function restoreSites() {
    const sites = await sitesStorage.get();

    console.log("Restoring sites: " + sites);
    if (typeof sites === 'undefined') {
      // Set html value
      await sitesStorage.set("");
      setupSites("");
    } else {
      setupSites(sites);
    }
  }

  document.addEventListener('DOMContentLoaded', restoreSites);
})();

async function getPermissions(url) {
  // Permissions must be requested from inside a user gesture, like a button's
  // click handler.
  return chrome.permissions.request({
    permissions: ['tabs'],
    origins: [url]
  });
}