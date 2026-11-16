/**
 * Utility helper to parse video and document URLs for Mobile in-app embedding with WebView.
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

  // 1. Direct video file (.mp4, .webm, .ogg, .mov, .m4v)
  if (/\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(url)) {
    return {
      isYouTube: false,
      isDirectVideo: true,
      isGoogleDrive: false,
      embedUrl: url,
      originalUrl: url
    };
  }

  // 2. Google Drive
  const gdriveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i);
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

  // 3. YouTube URL parsing
  let youtubeId: string | null = null;
  const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/i);
  if (embedMatch && embedMatch[1]) youtubeId = embedMatch[1];

  if (!youtubeId) {
    const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/i);
    if (shortMatch && shortMatch[1]) youtubeId = shortMatch[1];
  }

  if (!youtubeId) {
    const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/i);
    if (watchMatch && watchMatch[1]) youtubeId = watchMatch[1];
  }

  if (!youtubeId) {
    const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/i);
    if (shortsMatch && shortsMatch[1]) youtubeId = shortsMatch[1];
  }

  if (!youtubeId && /^[a-zA-Z0-9_-]{11}$/.test(url)) {
    youtubeId = url;
  }

  if (youtubeId) {
    return {
      isYouTube: true,
      isDirectVideo: false,
      isGoogleDrive: false,
      embedUrl: `https://www.youtube.com/embed/${youtubeId}?rel=0&autoplay=0`,
      originalUrl: url,
      videoId: youtubeId
    };
  }

  return {
    isYouTube: false,
    isDirectVideo: false,
    isGoogleDrive: false,
    embedUrl: url,
    originalUrl: url
  };
};

export interface ParsedDocumentInfo {
  embedUrl: string | null;
  viewerType: 'pdf' | 'office' | 'google' | 'webview';
  originalUrl: string;
}

export const parseDocumentUrl = (rawUrl?: string, type?: string): ParsedDocumentInfo => {
  if (!rawUrl || !rawUrl.trim()) {
    return {
      embedUrl: null,
      viewerType: 'webview',
      originalUrl: ''
    };
  }

  const url = rawUrl.trim();

  // 1. Google Drive Preview
  if (url.includes('drive.google.com/file/d/')) {
    const previewUrl = url
      .replace(/\/view(\?.*)?$/, '/preview')
      .replace(/\/edit(\?.*)?$/, '/preview');
    return {
      embedUrl: previewUrl,
      viewerType: 'google',
      originalUrl: url
    };
  }

  // 2. Google Docs / Sheets
  if (url.includes('docs.google.com/document/d/') || url.includes('docs.google.com/spreadsheets/d/')) {
    const previewUrl = url.replace(/\/edit(\?.*)?$/, '/preview');
    return {
      embedUrl: previewUrl,
      viewerType: 'google',
      originalUrl: url
    };
  }

  // 3. Direct PDF or type === PDF
  if (url.toLowerCase().endsWith('.pdf') || type === 'PDF' || url.includes('/docs/')) {
    // If it's a remote URL, Google Docs Viewer renders it beautifully inside a mobile WebView
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return {
        embedUrl: `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(url)}`,
        viewerType: 'pdf',
        originalUrl: url
      };
    }
    return {
      embedUrl: url,
      viewerType: 'pdf',
      originalUrl: url
    };
  }

  // 4. Word DOCX
  if (url.toLowerCase().endsWith('.docx') || url.toLowerCase().endsWith('.doc') || type === 'DOCX') {
    if (url.startsWith('http')) {
      return {
        embedUrl: `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`,
        viewerType: 'office',
        originalUrl: url
      };
    }
  }

  return {
    embedUrl: url,
    viewerType: 'webview',
    originalUrl: url
  };
};
