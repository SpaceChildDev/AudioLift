import { AudioLiftSettings, defaultSettings } from '../types';
import contentScriptPath from '../content/index?script';

// AudioLift - Background Service Worker

// Handle keyboard shortcut
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'toggle-audiolift') {
    // Get active tab
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs.length === 0) return;

    const tab = tabs[0];
    const tabId = tab.id;
    if (!tabId || !tab.url) return;

    let domain;
    try {
      domain = new URL(tab.url).hostname;
    } catch (e) {
      return; // Invalid URL
    }

    // Get current settings
    const result = await chrome.storage.local.get(['globalSettings', `domainSettings_${domain}`]);
    const currentSettings: AudioLiftSettings = {
      ...defaultSettings,
      ...result.globalSettings,
      ...result[`domainSettings_${domain}`]
    };

    // Toggle enabled state
    currentSettings.enabled = !currentSettings.enabled;

    // Save to storage
    await chrome.storage.local.set({
      [`domainSettings_${domain}`]: currentSettings
    });

    // Send message to content script
    try {
      chrome.tabs.sendMessage(tabId, {
        type: 'updateSettings',
        settings: currentSettings
      }, () => {
        // Ignore errors if tab is closed or script not ready
        const err = chrome.runtime.lastError; 
        if (err) {
           console.log('AudioLift: Could not send message to tab ' + tabId, err.message);
        }
      });

      // Update badge
      updateBadge(tabId, currentSettings.enabled);

    } catch (error) {
      console.error('Error toggling AudioLift:', error);
    }
  }
});

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'getTabId') {
    sendResponse({ tabId: sender.tab?.id || null });
  } else if (message.type === 'injectContentScript') {
    chrome.scripting.executeScript({
      target: { tabId: message.tabId },
      files: [contentScriptPath]
    })
      .then(() => sendResponse({ success: true }))
      .catch(() => sendResponse({ success: false }));
    return true;
  }
  return true;
});

// Update badge when tab changes
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tabId = activeInfo.tabId;
  try {
    const tab = await chrome.tabs.get(tabId);
    if (!tab.url) return;

    const domain = new URL(tab.url).hostname;
    const result = await chrome.storage.local.get([`domainSettings_${domain}`, 'globalSettings']);

    const settings: AudioLiftSettings = {
      ...defaultSettings,
      ...result.globalSettings,
      ...result[`domainSettings_${domain}`]
    };

    updateBadge(tabId, settings.enabled);
  } catch (error) {
    // Tab might be closed or restricted
  }
});

// Update badge on tab update (URL change)
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    try {
      const domain = new URL(tab.url).hostname;
      const result = await chrome.storage.local.get([`domainSettings_${domain}`, 'globalSettings']);

      const settings: AudioLiftSettings = {
        ...defaultSettings,
        ...result.globalSettings,
        ...result[`domainSettings_${domain}`]
      };

      updateBadge(tabId, settings.enabled);
    } catch (e) {
      // Ignore invalid URLs
    }
  }
});

// Update badge and icon
function updateBadge(tabId: number, enabled: boolean) {
  // No badge (too large, covers icon)
  chrome.action.setBadgeText({ text: '', tabId });

  // Change icon color based on state
  // Assuming the paths are relative to the root/dist which is handled by manifest
  const iconPath = enabled ? {
    "16": "icons/icon-active-16.png",
    "48": "icons/icon-active-48.png",
    "128": "icons/icon-active-128.png"
  } : {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  };

  chrome.action.setIcon({ path: iconPath, tabId });
}

// Initialize
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    // Set default settings
    await chrome.storage.local.set({
      globalSettings: defaultSettings
    });
  }

  // Enable side panel on all sites
  if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
    await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {
      console.log('Side panel API not available or failed');
    });
  }
  
  // Inject scripts on install/update as well
  // await injectContentScripts();
});

// Auto-inject content script into existing tabs when the extension is enabled/started
async function injectContentScripts() {
  try {
    const tabs = await chrome.tabs.query({ url: ["http://*/*", "https://*/*"] });
    for (const tab of tabs) {
      // Skip restricted internal chrome pages to avoid console errors
      if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('edge://') || tab.url.startsWith('about:')) {
        continue;
      }

      if (tab.id) {
        try {
          // Check if we can inject
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: [contentScriptPath]
          });
        } catch (err) {
          // Ignore errors (e.g. script already injected or cannot access tab)
        }
      }
    }
  } catch (e) {
    console.error('Error auto-injecting scripts:', e);
  }
}

// Call injection on startup
injectContentScripts();

// Also set up side panel when extension starts
if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {
    console.log('Side panel API not available');
  });
}
