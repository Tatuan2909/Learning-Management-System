/**
 * Utility helper to parse and transform video URLs (especially YouTube, Google Drive, direct MP4) into embeddable URLs.
 */

export interface ParsedVideoInfo {
  isYouTube: boolean;
  isDirectVideo: boolean;
  isGoogleDrive: boolean;
  embedUrl: string | null;
  originalUrl: string;
  videoId?: string;
}

export const parseVideoUrl = (rawUrl?: string): ParsedVideoInfo => {
  if (!rawUrl || !rawUrl.trim()) {
    return {
      isYouTube: false,
      isDirectVideo: false,
      isGoogleDrive: false,
      embedUrl: null,
      originalUrl: ''
    };
  }

  const url = rawUrl.trim();

  // 1. Check if user pasted an entire <iframe> HTML snippet
  const iframeMatch = url.match(/src=["'](https?:\/\/[^"']+)["']/i);
  const targetUrl = iframeMatch ? iframeMatch[1] : url;

  // 2. Direct video file (.mp4, .webm, .ogg, .mov, .m4v)
  if (/\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(targetUrl)) {
    return {
      isYouTube: false,
      isDirectVideo: true,
      isGoogleDrive: false,
      embedUrl: targetUrl,
      originalUrl: url
    };
  }

  // 3. Google Drive (All formats: /file/d/ID, /open?id=ID, /uc?id=ID, docs.google.com/file/d/ID)
  const gdriveMatch = targetUrl.match(/(?:drive|docs)\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:.*&)?id=)([a-zA-Z0-9_-]+)/i);
  if (gdriveMatch && gdriveMatch[1]) {
    const gdriveId = gdriveMatch[1];
    return {
      isYouTube: false,
      isDirectVideo: false,
      isGoogleDrive: true,
      embedUrl: `https://drive.google.com/file/d/${gdriveId}/preview`,
      originalUrl: url,
      videoId: gdriveId
    };
  }

  // 4. YouTube URL parsing (All formats: watch?v=, embed/, youtu.be/, shorts/, live/, youtube-nocookie)
  let youtubeId: string | null = null;

  const embedMatch = targetUrl.match(/youtube(?:-nocookie)?\.com\/embed\/([a-zA-Z0-9_-]{11})/i);
  if (embedMatch && embedMatch[1]) {
    youtubeId = embedMatch[1];
  }

  if (!youtubeId) {
    const shortMatch = targetUrl.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/i);
    if (shortMatch && shortMatch[1]) {
      youtubeId = shortMatch[1];
    }
  }

  if (!youtubeId) {
    const watchMatch = targetUrl.match(/[?&]v=([a-zA-Z0-9_-]{11})/i);
    if (watchMatch && watchMatch[1]) {
      youtubeId = watchMatch[1];
    }
  }

  if (!youtubeId) {
    const shortsMatch = targetUrl.match(/youtube(?:-nocookie)?\.com\/(?:shorts|live)\/([a-zA-Z0-9_-]{11})/i);
    if (shortsMatch && shortsMatch[1]) {
      youtubeId = shortsMatch[1];
    }
  }

  if (!youtubeId && /^[a-zA-Z0-9_-]{11}$/.test(targetUrl)) {
    youtubeId = targetUrl;
  }

  if (youtubeId) {
    return {
      isYouTube: true,
      isDirectVideo: false,
      isGoogleDrive: false,
      embedUrl: `https://www.youtube-nocookie.com/embed/${youtubeId}?enablejsapi=1&playsinline=1&rel=0&modestbranding=1`,
      originalUrl: url,
      videoId: youtubeId
    };
  }

  // Fallback: If it's any http/https URL, pass through
  if (/^https?:\/\//i.test(targetUrl)) {
    return {
      isYouTube: false,
      isDirectVideo: false,
      isGoogleDrive: false,
      embedUrl: targetUrl,
      originalUrl: url
    };
  }

  return {
    isYouTube: false,
    isDirectVideo: false,
    isGoogleDrive: false,
    embedUrl: null,
    originalUrl: url
  };
};
