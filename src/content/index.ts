import { AudioLiftSettings, defaultSettings, AudioInfo } from '../types';

interface AudioLiftInstance {
  cleanup: () => void;
}

declare global {
  interface Window {
    audioLiftInstance?: AudioLiftInstance;
    audioLiftInjected?: boolean;
    webkitAudioContext: typeof AudioContext;
  }
}

if (window.audioLiftInstance && typeof window.audioLiftInstance.cleanup === 'function') {
  try { window.audioLiftInstance.cleanup(); } catch (e) {}
}

interface AudioSourceData {
  source: MediaElementAudioSourceNode;
  nodes: AudioChain;
  mediaElement: HTMLMediaElement;
}

interface AudioChain {
  preamp: GainNode;
  monoNode: GainNode;
  eq32: BiquadFilterNode;
  eq64: BiquadFilterNode;
  eq125: BiquadFilterNode;
  eq250: BiquadFilterNode;
  eq500: BiquadFilterNode;
  eq1k: BiquadFilterNode;
  eq2k: BiquadFilterNode;
  eq4k: BiquadFilterNode;
  eq8k: BiquadFilterNode;
  eq16k: BiquadFilterNode;
  compressor: DynamicsCompressorNode;
  widthSplitter: ChannelSplitterNode;
  gainLL: GainNode;
  gainRR: GainNode;
  gainRL: GainNode;
  gainLR: GainNode;
  widthMerger: ChannelMergerNode;
  analyser: AnalyserNode;
}

class AudioLift implements AudioLiftInstance {
  audioContext: AudioContext | null = null;
  audioSources: Map<HTMLMediaElement, AudioSourceData> = new Map();
  processedElements: WeakSet<HTMLMediaElement> = new WeakSet();
  observer: MutationObserver | null = null;
  settings: AudioLiftSettings = { ...defaultSettings };

  constructor() { this.init(); }

  cleanup() {
    if (this.observer) { this.observer.disconnect(); this.observer = null; }
    if (this.audioContext) { this.audioContext.close(); this.audioContext = null; }
    window.audioLiftInjected = false;
  }

  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.start());
    } else {
      this.start();
    }
  }

  start() {
    if (!chrome.runtime?.id) {
      console.warn('AudioLift: Extension context is invalid.');
      return;
    }

    this.loadSettings();

    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message.type === 'updateSettings') {
        this.settings = { ...this.settings, ...message.settings };
        this.updateAllSources();
        sendResponse({ success: true });
      } else if (message.type === 'getAudioInfo') {
        sendResponse({ audioInfo: this.getAudioInfo() });
      } else if (message.type === 'getStatus') {
        sendResponse({ enabled: this.settings.enabled });
      } else if (message.type === 'getSpectrumData') {
        const src = this.audioSources.values().next().value;
        if (src?.nodes.analyser) {
          const data = new Float32Array(src.nodes.analyser.frequencyBinCount);
          src.nodes.analyser.getFloatFrequencyData(data);
          sendResponse({ data: Array.from(data) });
        } else {
          sendResponse({ data: null });
        }
        return true;
      } else if (message.type === 'getLevelData') {
        const src = this.audioSources.values().next().value;
        if (src?.nodes.analyser) {
          const td = new Float32Array(src.nodes.analyser.fftSize);
          src.nodes.analyser.getFloatTimeDomainData(td);
          const rms = Math.sqrt(td.reduce((s, v) => s + v * v, 0) / td.length);
          sendResponse({ db: 20 * Math.log10(Math.max(rms, 1e-10)) });
        } else {
          sendResponse({ db: -Infinity });
        }
        return true;
      }
      return true;
    });

    this.scanForMedia();
    this.observeDOM();
  }

  async loadSettings() {
    if (!chrome.runtime?.id) return;
    try {
      const domain = window.location.hostname;
      const result = await chrome.storage.local.get(['globalSettings', `domainSettings_${domain}`]);
      this.settings = { ...this.settings, ...result.globalSettings, ...result[`domainSettings_${domain}`] };
      if (this.settings.enabled) this.scanForMedia();
    } catch (error) {
      console.warn('AudioLift: Error loading settings:', error);
    }
  }

  scanForMedia() {
    document.querySelectorAll<HTMLMediaElement>('video, audio').forEach(el => this.processMediaElement(el));
  }

  observeDOM() {
    if (!document.body) return;
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            const el = node as HTMLElement;
            if (el.tagName === 'VIDEO' || el.tagName === 'AUDIO') this.processMediaElement(el as HTMLMediaElement);
            el.querySelectorAll?.('video, audio').forEach(e => this.processMediaElement(e as HTMLMediaElement));
          }
        });
      });
    });
    this.observer.observe(document.body, { childList: true, subtree: true });
  }

  createAudioChain(): AudioChain {
    if (!this.audioContext) throw new Error('AudioContext not initialized');
    const ctx = this.audioContext;

    const preamp = ctx.createGain();
    const monoNode = ctx.createGain();

    const createFilter = (type: BiquadFilterType, freq: number) => {
      const f = ctx.createBiquadFilter();
      f.type = type; f.frequency.value = freq; f.Q.value = 1.0;
      return f;
    };

    const eq32  = createFilter('lowshelf', 32);
    const eq64  = createFilter('peaking', 64);
    const eq125 = createFilter('peaking', 125);
    const eq250 = createFilter('peaking', 250);
    const eq500 = createFilter('peaking', 500);
    const eq1k  = createFilter('peaking', 1000);
    const eq2k  = createFilter('peaking', 2000);
    const eq4k  = createFilter('peaking', 4000);
    const eq8k  = createFilter('peaking', 8000);
    const eq16k = createFilter('highshelf', 16000);

    const compressor = ctx.createDynamicsCompressor();

    // Stereo width: L' = L - w·R,  R' = R - w·L
    // gainRL and gainLR carry the cross-feed; gainLL/gainRR are always 1
    const widthSplitter = ctx.createChannelSplitter(2);
    const gainLL = ctx.createGain(); gainLL.gain.value = 1;
    const gainRR = ctx.createGain(); gainRR.gain.value = 1;
    const gainRL = ctx.createGain(); gainRL.gain.value = 0;
    const gainLR = ctx.createGain(); gainLR.gain.value = 0;
    const widthMerger = ctx.createChannelMerger(2);

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.8;

    return {
      preamp, monoNode,
      eq32, eq64, eq125, eq250, eq500, eq1k, eq2k, eq4k, eq8k, eq16k,
      compressor,
      widthSplitter, gainLL, gainRR, gainRL, gainLR, widthMerger,
      analyser
    };
  }

  processMediaElement(mediaElement: HTMLMediaElement) {
    if (!mediaElement) return;
    if (this.audioSources.has(mediaElement)) return;
    if (this.processedElements.has(mediaElement)) return;

    const setupAudio = () => {
      if (!document.contains(mediaElement)) return;

      if (!mediaElement.crossOrigin && mediaElement.src && !mediaElement.src.startsWith('blob:') && !mediaElement.src.startsWith('data:')) {
        try { mediaElement.crossOrigin = 'anonymous'; } catch {}
      }

      try {
        if (!this.audioContext) {
          this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        let source: MediaElementAudioSourceNode;
        try {
          source = this.audioContext.createMediaElementSource(mediaElement);
        } catch (e: any) {
          if (e.name === 'InvalidStateError') {
            this.processedElements.add(mediaElement);
            return;
          }
          throw e;
        }

        const nodes = this.createAudioChain();

        // Main chain
        source.connect(nodes.monoNode);
        nodes.monoNode.connect(nodes.preamp);
        nodes.preamp.connect(nodes.eq32);
        nodes.eq32.connect(nodes.eq64);
        nodes.eq64.connect(nodes.eq125);
        nodes.eq125.connect(nodes.eq250);
        nodes.eq250.connect(nodes.eq500);
        nodes.eq500.connect(nodes.eq1k);
        nodes.eq1k.connect(nodes.eq2k);
        nodes.eq2k.connect(nodes.eq4k);
        nodes.eq4k.connect(nodes.eq8k);
        nodes.eq8k.connect(nodes.eq16k);
        nodes.eq16k.connect(nodes.compressor);

        // Stereo width chain: splitter → 4 gain nodes → merger
        nodes.compressor.connect(nodes.widthSplitter);
        nodes.widthSplitter.connect(nodes.gainLL, 0); // L → gainLL (direct L)
        nodes.widthSplitter.connect(nodes.gainRL, 1); // R → gainRL (cross R→L)
        nodes.widthSplitter.connect(nodes.gainLR, 0); // L → gainLR (cross L→R)
        nodes.widthSplitter.connect(nodes.gainRR, 1); // R → gainRR (direct R)
        // Both gainLL and gainRL sum into merger L port
        nodes.gainLL.connect(nodes.widthMerger, 0, 0);
        nodes.gainRL.connect(nodes.widthMerger, 0, 0);
        // Both gainRR and gainLR sum into merger R port
        nodes.gainRR.connect(nodes.widthMerger, 0, 1);
        nodes.gainLR.connect(nodes.widthMerger, 0, 1);

        nodes.widthMerger.connect(nodes.analyser);
        nodes.analyser.connect(this.audioContext.destination);

        this.audioSources.set(mediaElement, { source, nodes, mediaElement });
        this.processedElements.add(mediaElement);
        this.applySettingsToNodes(nodes);

        if (this.audioContext.state === 'suspended') this.audioContext.resume();

      } catch (error) {
        console.warn('AudioLift connection error:', error);
      }
    };

    if (mediaElement.readyState >= 2) {
      setupAudio();
    } else {
      mediaElement.addEventListener('loadedmetadata', setupAudio, { once: true });
    }
  }

  applySettingsToNodes(nodes: AudioChain) {
    if (!this.settings.enabled) {
      nodes.monoNode.channelCount = 2;
      nodes.monoNode.channelCountMode = 'max';
      nodes.preamp.gain.value = 1;
      [nodes.eq32, nodes.eq64, nodes.eq125, nodes.eq250, nodes.eq500,
       nodes.eq1k, nodes.eq2k, nodes.eq4k, nodes.eq8k, nodes.eq16k]
        .forEach(n => n.gain.value = 0);
      nodes.compressor.threshold.value = -24;
      nodes.compressor.ratio.value = 1;
      nodes.gainRL.gain.value = 0;
      nodes.gainLR.gain.value = 0;
      return;
    }

    // Mono
    if (this.settings.mono) {
      nodes.monoNode.channelCount = 1;
      nodes.monoNode.channelCountMode = 'explicit';
    } else {
      nodes.monoNode.channelCount = 2;
      nodes.monoNode.channelCountMode = 'max';
    }

    // Preamp
    let finalPreamp = this.settings.preamp;
    if (this.settings.smartVolume) finalPreamp += 4;
    else if (this.settings.loudnessMode) finalPreamp += 3;
    nodes.preamp.gain.value = this.dbToGain(finalPreamp);

    // EQ
    if (this.settings.loudnessMode) {
      nodes.eq32.gain.value  = 6;  nodes.eq64.gain.value  = 4;
      nodes.eq125.gain.value = 2;  nodes.eq250.gain.value = 0;
      nodes.eq500.gain.value = -1; nodes.eq1k.gain.value  = 0;
      nodes.eq2k.gain.value  = 2;  nodes.eq4k.gain.value  = 4;
      nodes.eq8k.gain.value  = 5;  nodes.eq16k.gain.value = 6;
    } else {
      nodes.eq32.gain.value  = this.settings.eq32;
      nodes.eq64.gain.value  = this.settings.eq64;
      nodes.eq125.gain.value = this.settings.eq125;
      nodes.eq250.gain.value = this.settings.eq250;
      nodes.eq500.gain.value = this.settings.eq500;
      nodes.eq1k.gain.value  = this.settings.eq1k;
      nodes.eq2k.gain.value  = this.settings.eq2k;
      nodes.eq4k.gain.value  = this.settings.eq4k;
      nodes.eq8k.gain.value  = this.settings.eq8k;
      nodes.eq16k.gain.value = this.settings.eq16k;
    }

    // Compressor
    if (this.settings.smartVolume) {
      nodes.compressor.threshold.value = -35;
      nodes.compressor.ratio.value     = 8;
      nodes.compressor.knee.value      = 10;
      nodes.compressor.attack.value    = 0.05;
      nodes.compressor.release.value   = 0.25;
    } else {
      nodes.compressor.threshold.value = this.settings.compressionThreshold;
      nodes.compressor.ratio.value     = this.settings.compressionRatio;
      nodes.compressor.knee.value      = this.settings.compressionKnee;
      nodes.compressor.attack.value    = this.settings.compressionAttack;
      nodes.compressor.release.value   = this.settings.compressionRelease;
    }

    // Stereo width: cross-feed gain = -stereoWidth
    // w=0 → no cross-feed (normal), w>0 → wider, w<0 → narrower
    nodes.gainRL.gain.value = -this.settings.stereoWidth;
    nodes.gainLR.gain.value = -this.settings.stereoWidth;
  }

  updateAllSources() {
    for (const [el, data] of this.audioSources.entries()) {
      if (!el.isConnected) { this.audioSources.delete(el); continue; }
      if (data?.nodes) this.applySettingsToNodes(data.nodes);
    }
    if (this.audioContext?.state === 'suspended' && this.settings.enabled) {
      this.audioContext.resume();
    }
  }

  dbToGain(db: number) { return Math.pow(10, db / 20); }

  getAudioInfo(): AudioInfo {
    const info: AudioInfo = { sampleRate: null, channels: null, bitDepth: null, codec: null, bitrate: null, duration: null };

    if (this.audioContext) info.sampleRate = this.audioContext.sampleRate;

    const mediaElements = document.querySelectorAll('video, audio');
    if (mediaElements.length > 0) {
      const first = mediaElements[0] as HTMLMediaElement;
      const audioData = this.audioSources.get(first);
      if (audioData?.source) info.channels = audioData.source.channelCount === 2 ? 'Stereo' : 'Mono';
      if (first.duration && isFinite(first.duration)) {
        const m = Math.floor(first.duration / 60);
        const s = Math.floor(first.duration % 60);
        info.duration = `${m}:${s.toString().padStart(2, '0')}`;
      }
      const src = first.currentSrc || first.src;
      if (src) { info.codec = this.detectCodec(src, first); info.bitDepth = this.estimateBitDepth(info.codec); }
      if (first.buffered?.length > 0) {
        info.bitrate = first.networkState === 2 ? 'Streaming' : first.networkState === 3 ? 'No Source' : 'Buffered';
      }
    }
    return info;
  }

  detectCodec(src: string, el: HTMLMediaElement) {
    const ext = src.split('?')[0].split('.').pop()?.toLowerCase() || '';
    const map: Record<string, string> = {
      mp3: 'MP3', mp4: 'AAC/MP4', m4a: 'AAC', aac: 'AAC',
      ogg: 'Vorbis', opus: 'Opus', webm: 'Opus/Vorbis', flac: 'FLAC', wav: 'PCM/WAV'
    };
    if (map[ext]) return map[ext];
    const formats = [
      { type: 'audio/mp4', codec: 'AAC' }, { type: 'audio/mpeg', codec: 'MP3' },
      { type: 'audio/ogg', codec: 'Vorbis' }, { type: 'audio/webm; codecs="opus"', codec: 'Opus' },
      { type: 'audio/flac', codec: 'FLAC' }
    ];
    for (const f of formats) {
      const s = el.canPlayType(f.type);
      if (s === 'probably' || s === 'maybe') return f.codec;
    }
    return 'Unknown';
  }

  estimateBitDepth(codec: string | null) {
    if (!codec) return '-';
    return ['FLAC', 'PCM/WAV'].includes(codec) ? '24-bit' : '16-bit';
  }
}

if (!window.audioLiftInjected) {
  window.audioLiftInjected = true;
  window.audioLiftInstance = new AudioLift();
}
