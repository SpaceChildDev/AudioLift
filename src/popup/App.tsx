import Header from './components/Header';
import AudioInfoPanel from './components/AudioInfo';
import QuickTools from './components/QuickTools';
import PresetGrid from './components/PresetGrid';
import Equalizer from './components/Equalizer';
import Compressor from './components/Compressor';
import Footer from './components/Footer';
import { useAudioSettings } from './hooks/useAudioSettings';
import { presets } from './presets';

function App() {
  const {
    settings, updateSettings, audioInfo, activePreset, applyPreset,
    tabId, contentScriptReady,
    exportSettings, importSettings
  } = useAudioSettings();

  const handleReload = () => { if (tabId) chrome.tabs.reload(tabId); };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const n = parseInt(e.key);
    if (n >= 1 && n <= 9) {
      const entry = Object.entries(presets)[n - 1];
      if (entry) applyPreset(entry[0], entry[1]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-bg-primary outline-none" onKeyDown={handleKeyDown} tabIndex={0}>
      <Header
        enabled={settings.enabled}
        onToggle={(v) => updateSettings({ enabled: v })}
        onExport={exportSettings}
        onImport={importSettings}
      />

      {/* Reload banner */}
      {contentScriptReady === false && (
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border-primary bg-bg-secondary flex-shrink-0">
          <svg className="w-3.5 h-3.5 text-accent flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
          <span className="flex-1 text-[11px] text-text-secondary">Sayfayı yenileyin</span>
          <button onClick={handleReload} className="text-[11px] font-medium text-accent hover:text-accent-dark transition-colors px-2 py-0.5 rounded hover:bg-accent-bg">
            Yenile
          </button>
        </div>
      )}

      {settings.enabled && <AudioInfoPanel info={audioInfo} />}

      <div className={`flex-1 overflow-y-auto scrollbar-thin ${!settings.enabled ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
        <QuickTools settings={settings} updateSettings={updateSettings} />
        <PresetGrid activePreset={activePreset} onSelect={applyPreset} />
        <Equalizer settings={settings} updateSettings={updateSettings} disabled={settings.loudnessMode} />
        <Compressor settings={settings} updateSettings={updateSettings} disabled={settings.smartVolume} />
        <Footer />
      </div>
    </div>
  );
}

export default App;
