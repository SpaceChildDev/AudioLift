import { useState, useEffect, useCallback } from 'react';
import { AudioLiftSettings, defaultSettings, AudioInfo } from '../../types';
import { presets } from '../presets';
import { getDefaultPresetForDomain } from '../domainPresets';

export const useAudioSettings = () => {
  const [settings, setSettings] = useState<AudioLiftSettings>(defaultSettings);
  const [domain, setDomain] = useState<string>('unknown');
  const [tabId, setTabId] = useState<number | null>(null);
  const [audioInfo, setAudioInfo] = useState<AudioInfo>({
    sampleRate: null, channels: null, bitDepth: null, codec: null, bitrate: null, duration: null
  });
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [contentScriptReady, setContentScriptReady] = useState<boolean | null>(null);

  useEffect(() => {
    const updateActiveTab = async () => {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tabs.length || !tabs[0].id) return;

      const currentTabId = tabs[0].id;
      setTabId(currentTabId);
      setContentScriptReady(null);

      let currentDomain = 'unknown';
      try { if (tabs[0].url) currentDomain = new URL(tabs[0].url).hostname; } catch {}
      setDomain(currentDomain);

      const result = await chrome.storage.local.get([
        'globalSettings',
        `domainSettings_${currentDomain}`,
        `domainPreset_${currentDomain}`,
      ]);

      let finalSettings: AudioLiftSettings;
      let finalPreset: string | null = result[`domainPreset_${currentDomain}`] || null;
      const hasDomainSettings = !!result[`domainSettings_${currentDomain}`];

      if (!hasDomainSettings) {
        const autoPresetKey = getDefaultPresetForDomain(currentDomain);
        if (autoPresetKey && presets[autoPresetKey]) {
          const { name: _name, ...presetSettings } = presets[autoPresetKey];
          finalSettings = { ...defaultSettings, ...result.globalSettings, ...presetSettings };
          finalPreset = autoPresetKey;
          await chrome.storage.local.set({
            [`domainSettings_${currentDomain}`]: finalSettings,
            [`domainPreset_${currentDomain}`]: autoPresetKey
          });
        } else {
          finalSettings = { ...defaultSettings, ...result.globalSettings };
        }
      } else {
        finalSettings = { ...defaultSettings, ...result.globalSettings, ...result[`domainSettings_${currentDomain}`] };
      }

      setSettings(finalSettings);
      setActivePreset(finalPreset);

      try {
        await chrome.tabs.sendMessage(currentTabId, { type: 'getStatus' });
        setContentScriptReady(true);
      } catch {
        const resp = await chrome.runtime.sendMessage({ type: 'injectContentScript', tabId: currentTabId }).catch(() => null);
        setContentScriptReady(resp?.success ?? false);
      }

      chrome.tabs.sendMessage(currentTabId, { type: 'updateSettings', settings: finalSettings }).catch(() => {});
    };

    updateActiveTab();

    const onActivated = () => updateActiveTab();
    chrome.tabs.onActivated.addListener(onActivated);

    const onUpdated = (updatedTabId: number, changeInfo: chrome.tabs.TabChangeInfo) => {
      if (changeInfo.status === 'complete' || changeInfo.url) {
        chrome.tabs.query({ active: true, currentWindow: true }).then(tabs => {
          if (tabs[0]?.id === updatedTabId) updateActiveTab();
        });
      }
    };
    chrome.tabs.onUpdated.addListener(onUpdated);

    return () => {
      chrome.tabs.onActivated.removeListener(onActivated);
      chrome.tabs.onUpdated.removeListener(onUpdated);
    };
  }, []);

  const updateSettings = useCallback(async (newSettings: Partial<AudioLiftSettings>) => {
    if (newSettings.smartVolume === true || newSettings.mono === true || newSettings.loudnessMode === true) {
      setActivePreset(null);
      if (domain !== 'unknown') chrome.storage.local.remove(`domainPreset_${domain}`);
    }
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      if (domain !== 'unknown') chrome.storage.local.set({ [`domainSettings_${domain}`]: updated });
      if (tabId) chrome.tabs.sendMessage(tabId, { type: 'updateSettings', settings: updated }).catch(() => {});
      return updated;
    });
  }, [domain, tabId]);

  // Applying a preset always disables conflicting auto modes
  const applyPreset = useCallback(async (presetName: string, presetSettings: Partial<AudioLiftSettings>) => {
    setActivePreset(presetName);
    if (domain !== 'unknown') await chrome.storage.local.set({ [`domainPreset_${domain}`]: presetName });
    updateSettings({ ...presetSettings, loudnessMode: false, smartVolume: false, mono: false });
  }, [domain, updateSettings]);

  // Export / Import
  const exportSettings = useCallback(() => {
    const blob = new Blob(
      [JSON.stringify({ version: 1, domain, settings }, null, 2)],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), {
      href: url, download: `audiolift-${domain || 'settings'}.json`
    });
    a.click();
    URL.revokeObjectURL(url);
  }, [settings, domain]);

  const importSettings = useCallback((file: File) => {
    file.text().then(text => {
      try {
        const parsed = JSON.parse(text);
        updateSettings({ ...defaultSettings, ...parsed.settings });
      } catch {}
    });
  }, [updateSettings]);

  // Poll Audio Info
  useEffect(() => {
    if (!tabId) return;
    const fetchInfo = () => {
      chrome.tabs.sendMessage(tabId, { type: 'getAudioInfo' })
        .then(r => { if (r?.audioInfo) setAudioInfo(r.audioInfo); })
        .catch(() => {});
    };
    fetchInfo();
    const interval = setInterval(fetchInfo, 2000);
    return () => clearInterval(interval);
  }, [tabId]);

  return {
    settings, updateSettings, audioInfo, activePreset, applyPreset,
    domain, tabId, contentScriptReady,
    exportSettings, importSettings
  };
};
