// hostname → preset key mapping (www. stripped before lookup)
const domainPresetMap: Record<string, string> = {
  // Music streaming
  'open.spotify.com': 'music',
  'spotify.com':       'music',
  'music.youtube.com': 'music',
  'soundcloud.com':    'music',
  'music.apple.com':   'music',
  'deezer.com':        'music',
  'tidal.com':         'music',
  'bandcamp.com':      'music',

  // Video (film / dizi)
  'netflix.com':       'movie',
  'primevideo.com':    'movie',
  'disneyplus.com':    'movie',
  'hulu.com':          'movie',
  'max.com':           'movie',
  'mubi.com':          'movie',
  'tv.apple.com':      'movie',
  'vimeo.com':         'movie',

  // General video
  'youtube.com':       'music',

  // Gaming / stream
  'twitch.tv':         'gaming',

  // Podcast
  'podcasts.google.com': 'podcast',
  'pocketcasts.com':     'podcast',
};

export function getDefaultPresetForDomain(hostname: string): string | null {
  const normalized = hostname.replace(/^www\./, '');
  return domainPresetMap[normalized] ?? domainPresetMap[hostname] ?? null;
}
