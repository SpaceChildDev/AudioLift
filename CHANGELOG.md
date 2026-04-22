# Changelog

All notable changes to AudioLift will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.2.0] - 2025-10-26

### Changed - BREAKING
- **Upgraded from 3-band to 10-band equalizer** - More precise frequency control
- Complete audio processing chain rewrite for 10 independent frequency bands
- Settings structure changed (removed bass/mid/treble, added eq32-eq16k)

### Added
- **10-band parametric equalizer** with frequencies:
  - 32 Hz (lowshelf)
  - 64 Hz, 125 Hz, 250 Hz, 500 Hz (peaking)
  - 1 kHz, 2 kHz, 4 kHz, 8 kHz (peaking)
  - 16 kHz (highshelf)
- **Real-time spectrum analyzer** - Visual frequency display (visible in popup)
- Canvas-based spectrum visualization (512 FFT, 20fps)
- Dark mode support for spectrum analyzer
- All 20 presets updated with 10-band values

### Advanced Features (Side Panel Only)
- **Custom preset save/load** - Save your favorite settings
- Advanced button (⚙️) in popup to open side panel
- Popup-only and advanced-only UI sections

### Technical
- Added AnalyserNode to audio processing chain
- `getSpectrumData` message handler for real-time spectrum data
- 10 BiquadFilterNodes with optimized Q values (1.0)
- Updated storage schema for 10-band settings
- Spectrum data serialization for popup display
- Mode detection (popup vs side panel)

### UI/UX
- Spectrum analyzer visible in main popup (60px height)
- Compact 10-band EQ layout with vertical sliders
- Each band shows frequency label and value
- Removed duplicate 5-band EQ from advanced section
- Advanced features (custom presets) only in side panel

## [2.1.0] - 2025-10-26

### Added
- **Bit depth display** - Estimated from codec (24-bit for FLAC/WAV, 16-bit for others)
- **Chrome Side Panel support** - Open AudioLift in sidebar
- Right-click icon to open in side panel
- Responsive width for side panel (360-480px)

### Changed - UI Compactness
- **Audio info panel** - Redesigned as compact 3x2 grid (was 5 rows)
- **30-40% less vertical space** - Minimal scrolling needed
- Shortened labels: "Sample Rate" → "Rate"
- Compact values: "48000 Hz" → "48.0k"
- Section padding: 12px → 8px
- Preset buttons: 8px → 6px padding
- EQ slider height: 100px → 80px
- Font sizes reduced (11px → 10px, 12px → 9px)
- Footer padding: 12px → 8px

### Design
- Container border-radius: 8px (rounded corners)
- Subtle box shadow for depth
- Background: #f1f3f4 (light gray)
- More professional, compact look

## [2.0.0] - 2025-10-26

### Changed - BREAKING
- **Complete UI redesign** to Chrome's minimal design language
- Popup width reduced from 400px to 360px
- Removed gradient backgrounds in favor of flat design
- Removed emoji icons from presets and UI elements
- New color scheme based on Chrome's Material Design
- System fonts (Segoe UI) instead of custom fonts

### Added
- **Audio information panel** displaying real-time metadata:
  - Sample rate (from AudioContext)
  - Channel configuration (Mono/Stereo)
  - Codec detection (MP3, AAC, Opus, Vorbis, FLAC, etc.)
  - Bitrate estimation
  - Duration display (mm:ss format)
- **8 new presets** (total now 20):
  - Electronic - Heavy bass + treble for EDM
  - Hip Hop - Maximum bass with heavy compression
  - Metal - Aggressive bass and treble boost
  - Acoustic - Natural sound, minimal processing
  - Vocal - Extreme mid-range boost for vocals
  - Cinematic - Wide soundstage for movies
  - Radio - Speech optimized with compression
  - Lo-Fi - Warm sound with reduced treble
- Audio info auto-updates every 2 seconds
- Audio info panel auto-shows when enabled
- Codec detection from file extension and MIME type
- Network state-based bitrate estimation

### Technical
- New `getAudioInfo()` method in content script
- Codec detection algorithm with extension mapping
- Channel count detection from AudioContext source node
- Duration formatting utility
- Message handler for `getAudioInfo` requests
- Periodic updates with cleanup on popup unload
- Chrome-style toggle switch component

### Design System
- Primary color: #1a73e8 (Chrome blue)
- Text colors: #202124 (primary), #5f6368 (secondary)
- Border colors: #e8eaed, #dadce0
- Background: #fff, #f8f9fa
- Monospace font for technical values (Consolas, Monaco)
- Reduced border radius (8px → 4px)
- Subtle hover states
- Material Design-inspired shadows

## [1.0.0] - 2025-10-25

### Added
- Initial release of AudioLift
- Real-time audio enhancement for browser tabs using Web Audio API
- 3-band equalizer (Bass, Mid, Treble) with ±12dB range
- Preamp/gain control with ±10dB range
- Dynamic range compression with adjustable threshold, ratio, and knee
- Four built-in presets:
  - **Flat**: No processing, neutral sound
  - **Movie**: Enhanced for film content with reduced mids and boosted bass/treble
  - **Dialogue**: Optimized for speech clarity with boosted mids and compression
  - **Bass Boost**: Enhanced low frequencies for music
- Per-site settings memory
- Global default settings
- Keyboard shortcut (Cmd+Shift+A / Ctrl+Shift+A) to toggle on/off
- Visual badge indicator when active
- Minimal, modern UI with gradient design
- Collapsible advanced controls section
- Real-time value display for all controls
- Settings persistence across browser sessions

### Technical Features
- Manifest V3 compliance
- Web Audio API integration
- BiquadFilterNode for EQ (lowshelf, peaking, highshelf)
- DynamicsCompressorNode for dynamic range control
- Automatic detection of audio/video elements
- MutationObserver for dynamically loaded media
- Chrome Storage API for settings persistence
- Tab-specific and domain-specific settings

### Browser Support
- Chrome 88+
- Edge 88+
- Any Chromium-based browser with Manifest V3 support

## [1.1.0] - 2025-10-25

### Added
- Completely redesigned UI - wider, more compact, Boom-style
- Interactive compression help modal with detailed explanations
- Tooltips for compression controls (hover to see tips)
- Vertical EQ sliders with visual grid layout
- Emoji icons for presets and actions
- Improved visual feedback and animations

### Fixed
- **Audio processing now works without page reload!** 🎉
- Toggle on/off applies instantly to playing media
- Settings changes (EQ, compression) apply in real-time
- Bypass mode instead of disconnect for smoother toggling
- Auto-save eliminates need for manual save buttons

### Changed
- Popup width increased from 320px to 400px
- Removed scrolling - everything fits in view
- Simplified compression controls layout
- Better contrast and modern gradient design
- Improved slider visual design
- Replaced manual save buttons with auto-save notification

### Technical
- **Implemented "always connected" architecture** - audio chain stays connected, toggle uses bypass mode
- **WeakMap/WeakSet for memory management** - automatic cleanup when elements removed from DOM
- **Graceful error handling** - handles InvalidStateError when element already connected
- **AudioContext auto-resume** - handles browser autoplay policy
- **DOM verification** - checks if element still exists before processing
- **Reprocessing on toggle** - ensures new elements are captured when enabled
- Better CORS error detection and logging

## [1.0.0] - 2025-10-25

### Added
- Initial release of AudioLift
- Real-time audio enhancement for browser tabs using Web Audio API
- 3-band equalizer (Bass, Mid, Treble) with ±12dB range
- Preamp/gain control with ±10dB range
- Dynamic range compression with adjustable threshold, ratio, and knee
- Four built-in presets:
  - **Flat**: No processing, neutral sound
  - **Movie**: Enhanced for film content with reduced mids and boosted bass/treble
  - **Dialogue**: Optimized for speech clarity with boosted mids and compression
  - **Bass Boost**: Enhanced low frequencies for music
- Per-site settings memory
- Global default settings
- Keyboard shortcut (Cmd+Shift+A / Ctrl+Shift+A) to toggle on/off
- Visual badge indicator when active
- Minimal, modern UI with gradient design
- Collapsible advanced controls section
- Real-time value display for all controls
- Settings persistence across browser sessions

### Technical Features
- Manifest V3 compliance
- Web Audio API integration
- BiquadFilterNode for EQ (lowshelf, peaking, highshelf)
- DynamicsCompressorNode for dynamic range control
- Automatic detection of audio/video elements
- MutationObserver for dynamically loaded media
- Chrome Storage API for settings persistence
- Tab-specific and domain-specific settings

### Browser Support
- Chrome 88+
- Edge 88+
- Any Chromium-based browser with Manifest V3 support

## [Unreleased]

### Planned Features
- Volume normalization
- Custom preset saving
- Import/export settings
- 3D audio effects (ambient, night mode)
- More preset options
- Advanced filter options (parametric EQ)
- Stereo width control
- Visual audio analyzer
- Dark mode for UI
- Side panel support
