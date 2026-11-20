/**
 * Utility helper to parse video and document URLs for Mobile in-app embedding with WebView & direct file opening.
 */
import { resolveMediaUrl } from '../api/config';

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

  const url = resolveMediaUrl(rawUrl);

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
  if (embedMatch && embedMatch[1]) youtubeId = embedMatch[1];

  if (!youtubeId) {
    const shortMatch = targetUrl.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/i);
    if (shortMatch && shortMatch[1]) youtubeId = shortMatch[1];
  }

  if (!youtubeId) {
    const watchMatch = targetUrl.match(/[?&]v=([a-zA-Z0-9_-]{11})/i);
    if (watchMatch && watchMatch[1]) youtubeId = watchMatch[1];
  }

  if (!youtubeId) {
    const shortsMatch = targetUrl.match(/youtube(?:-nocookie)?\.com\/(?:shorts|live)\/([a-zA-Z0-9_-]{11})/i);
    if (shortsMatch && shortsMatch[1]) youtubeId = shortsMatch[1];
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
      originalUrl: `https://www.youtube.com/watch?v=${youtubeId}`,
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

export interface ParsedDocumentInfo {
  embedUrl: string | null;
  viewerType: 'pdf' | 'office' | 'google' | 'webview';
  originalUrl: string;
  fileName: string;
  fileExt: string;
}

export const parseDocumentUrl = (rawUrl?: string, type?: string): ParsedDocumentInfo => {
  if (!rawUrl || !rawUrl.trim()) {
    return {
      embedUrl: null,
      viewerType: 'webview',
      originalUrl: '',
      fileName: '',
      fileExt: ''
    };
  }

  const url = resolveMediaUrl(rawUrl);
  const cleanPath = url.split('?')[0];
  const fileName = cleanPath.split('/').pop() || 'tai-lieu';
  const fileExt = fileName.includes('.') ? fileName.split('.').pop()?.toUpperCase() || '' : '';

  // 1. Google Drive Preview
  if (url.includes('drive.google.com/file/d/')) {
    const previewUrl = url
      .replace(/\/view(\?.*)?$/, '/preview')
      .replace(/\/edit(\?.*)?$/, '/preview');
    return {
      embedUrl: previewUrl,
      viewerType: 'google',
      originalUrl: url,
      fileName,
      fileExt: fileExt || 'DRIVE'
    };
  }

  // 2. Google Docs / Sheets
  if (url.includes('docs.google.com/document/d/') || url.includes('docs.google.com/spreadsheets/d/')) {
    const previewUrl = url.replace(/\/edit(\?.*)?$/, '/preview');
    return {
      embedUrl: previewUrl,
      viewerType: 'google',
      originalUrl: url,
      fileName,
      fileExt: fileExt || 'DOCS'
    };
  }

  // 3. Direct PDF or type === PDF
  if (url.toLowerCase().endsWith('.pdf') || type === 'PDF' || url.includes('/docs/') || fileExt === 'PDF') {
    // If it's a public external HTTPS URL, Google Viewer can embed it
    const isPublicHttps = url.startsWith('https://') && !url.includes('192.168.') && !url.includes('172.') && !url.includes('10.');
    return {
      embedUrl: isPublicHttps ? `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(url)}` : url,
      viewerType: 'pdf',
      originalUrl: url,
      fileName: fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`,
      fileExt: 'PDF'
    };
  }

  // 4. Word DOCX
  if (url.toLowerCase().endsWith('.docx') || url.toLowerCase().endsWith('.doc') || type === 'DOCX') {
    const isPublicHttps = url.startsWith('https://') && !url.includes('192.168.') && !url.includes('172.') && !url.includes('10.');
    return {
      embedUrl: isPublicHttps ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}` : url,
      viewerType: 'office',
      originalUrl: url,
      fileName: fileName.endsWith('.docx') || fileName.endsWith('.doc') ? fileName : `${fileName}.docx`,
      fileExt: 'DOCX'
    };
  }

  return {
    embedUrl: url,
    viewerType: 'webview',
    originalUrl: url,
    fileName,
    fileExt
  };
};
