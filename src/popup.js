'use strict';

import './popup.css';

(function() {
  // We will make use of Storage API to get and store `count` value
  // More information on Storage API can we found at
  // https://developer.chrome.com/extensions/storage

  // To get storage access, we have to mention it in `permissions` property of manifest.json file
  // More information on Permissions can we found at
  // https://developer.chrome.com/extensions/declare_permissions
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

    document.getElementById('saveBtn').addEventListener('click', () => {
      const sites = document.getElementById('sites');
      updateSites(sites.value);
    });
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
