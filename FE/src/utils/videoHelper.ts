/**
 * Utility helper to parse and transform video URLs (especially YouTube) into embeddable URLs.
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

  // 3. Google Drive
  // https://drive.google.com/file/d/FILE_ID/view -> /preview
  const gdriveMatch = targetUrl.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i);
  if (gdriveMatch && gdriveMatch[1]) {
    return {
      isYouTube: false,
      isDirectVideo: false,
      isGoogleDrive: true,
      embedUrl: `https://drive.google.com/file/d/${gdriveMatch[1]}/preview`,
      originalUrl: url,
      videoId: gdriveMatch[1]
    };
  }

  // 4. YouTube URL parsing
  let youtubeId: string | null = null;

  // Case 4a: Already embed URL: youtube.com/embed/ID
  const embedMatch = targetUrl.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/i);
  if (embedMatch && embedMatch[1]) {
    youtubeId = embedMatch[1];
  }

  // Case 4b: youtu.be/ID
  if (!youtubeId) {
    const shortMatch = targetUrl.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/i);
    if (shortMatch && shortMatch[1]) {
      youtubeId = shortMatch[1];
    }
  }

  // Case 4c: youtube.com/watch?v=ID or /watch?feature=...&v=ID
  if (!youtubeId) {
    const watchMatch = targetUrl.match(/[?&]v=([a-zA-Z0-9_-]{11})/i);
    if (watchMatch && watchMatch[1]) {
      youtubeId = watchMatch[1];
    }
  }

  // Case 4d: youtube.com/shorts/ID
  if (!youtubeId) {
    const shortsMatch = targetUrl.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/i);
    if (shortsMatch && shortsMatch[1]) {
      youtubeId = shortsMatch[1];
    }
  }

  // Case 4e: youtube.com/live/ID
  if (!youtubeId) {
    const liveMatch = targetUrl.match(/youtube\.com\/live\/([a-zA-Z0-9_-]{11})/i);
    if (liveMatch && liveMatch[1]) {
      youtubeId = liveMatch[1];
    }
  }

  // Case 4f: Direct 11-char ID
  if (!youtubeId && /^[a-zA-Z0-9_-]{11}$/.test(targetUrl)) {
    youtubeId = targetUrl;
  }

  if (youtubeId) {
    return {
      isYouTube: true,
      isDirectVideo: false,
      isGoogleDrive: false,
      embedUrl: `https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1&enablejsapi=1`,
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
