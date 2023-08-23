'use strict';

import './popup.css';

(function() {
  const sitesStorage = {
    get: cb => {
      chrome.storage.sync.get(['sites'], result => {
        cb(result.sites);
      });
    },
    set: (value, cb) => {
      chrome.storage.sync.set(
        {
          sites: value,
        },
        () => {
          cb();
        }
      );
    },
  };

  function setupSites(initialValue = "") {
    console.log("Setting up sites: " + initialValue);
    document.getElementById('sites').value = initialValue;

    document.getElementById('zapBtn').addEventListener('click', async () => {
      chrome.tabs.query({active: true}, async (tabs) => {
        console.log(tabs);
        const url = tabs[0].url;
        // get permission
        if (await getPermissions(url)) {
          const sites = document.getElementById('sites')
          addSite(sites.value, url);
        }
      });
    });

    document.getElementById('saveBtn').addEventListener('click', () => {
      const sites = document.getElementById('sites');
      updateSites(sites.value);
    });
  }

  function addSite(sites, site) {
    updateSites(sites + " " + site);
  }

  function updateSites(sites) {
    console.log("Updating sites: " + sites);
    sitesStorage.set(sites, () => {
      document.getElementById('sites').innerHTML = sites;

      // Communicate with content script of
      // active tab by sending a message
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        const tab = tabs[0];

        chrome.tabs.sendMessage(
          tab.id,
          {
            type: 'SITES',
            payload: {
              sites: sites
            },
          },
          response => {
            console.log('Current sites value passed to contentScript file');
          }
        );
      });
    });
  }

  function restoreSites() {
    // Restore value
    sitesStorage.get(sites => {
      console.log("Restoring sites: " + sites);
      if (typeof sites === 'undefined') {
        // Set counter value as 0
        sitesStorage.set("", () => {
          setupSites("");
        });
      } else {
        setupSites(sites);
      }
    });
  }

  document.addEventListener('DOMContentLoaded', restoreSites);

  // Communicate with background file by sending a message
  chrome.runtime.sendMessage(
    {
      type: 'GREETINGS',
      payload: {
        message: 'Hello, my name is Pop. I am from Popup.',
      },
    },
    response => {
      console.log(response.message);
    }
  );
})();

async function getPermissions(url) {
  // Permissions must be requested from inside a user gesture, like a button's
  // click handler.
  return chrome.permissions.request({
    permissions: ['tabs'],
    origins: [url]
  });
}