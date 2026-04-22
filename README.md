# AudioLift

> Real-time audio enhancement for any browser tab.

AudioLift is a Chrome extension (Manifest V3) that gives you professional-grade audio processing — EQ, compression, stereo width, and smart presets — on any website with audio or video.

## Features

- **10-Band Equalizer** — 32 Hz to 16 kHz, ±12 dB per band, with Preamp gain control
- **Stereo Width** — Mid-Side processing from mono to extra-wide
- **Dynamic Compression** — Adjustable threshold, ratio, and knee
- **20 Presets** — Movie, Dialogue, Music genres, Podcast, Gaming, and more
- **Quick Tools** — One-click Smart Volume, Mono mix, and Loudness enhancement
- **Per-Site Memory** — Settings saved automatically per domain
- **Domain Auto-Presets** — Spotify, YouTube, Netflix, and others get a sensible preset on first visit
- **Export / Import** — Save and restore your settings as JSON
- **Side Panel Support** — Pin the UI to the Chrome sidebar for persistent access

## Installation

### From Source

```bash
npm install
npm run build
```

Then in Chrome:
1. Go to `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `dist/` folder

## Usage

1. Click the AudioLift icon in the toolbar (or open via side panel)
2. The extension activates automatically — no page reload needed in most cases
3. If a reload banner appears, click **Yenile** to inject into already-loaded tabs
4. Adjust EQ, compression, or pick a preset
5. Settings are saved per domain automatically

## Privacy

AudioLift does not collect or transmit any data. All audio processing happens locally in your browser. Settings are stored only in `chrome.storage.local` on your device.

See [PRIVACY.md](PRIVACY.md) for the full policy.

## License

MIT
