export interface DocumentEmbedInfo {
  embedUrl: string;
  isIframeEmbeddable: boolean;
  viewerType: 'pdf' | 'office' | 'google' | 'text' | 'reader';
}

export function parseDocumentUrl(rawUrl?: string, fileType?: string): DocumentEmbedInfo {
  if (!rawUrl || !rawUrl.trim()) {
    return {
      embedUrl: '',
      isIframeEmbeddable: false,
      viewerType: 'reader'
    };
  }

  const url = rawUrl.trim();

  // 1. Google Drive preview
  if (url.includes('drive.google.com/file/d/')) {
    const previewUrl = url
      .replace(/\/view(\?.*)?$/, '/preview')
      .replace(/\/edit(\?.*)?$/, '/preview');
    return {
      embedUrl: previewUrl,
      isIframeEmbeddable: true,
      viewerType: 'google'
    };
  }

  // 2. Google Docs / Sheets
  if (url.includes('docs.google.com/document/d/') || url.includes('docs.google.com/spreadsheets/d/')) {
    const previewUrl = url.replace(/\/edit(\?.*)?$/, '/preview');
    return {
      embedUrl: previewUrl,
      isIframeEmbeddable: true,
      viewerType: 'google'
    };
  }

  // 3. Local or remote direct PDF
  if (url.toLowerCase().endsWith('.pdf') || fileType === 'PDF' || url.includes('/docs/')) {
    return {
      embedUrl: url,
      isIframeEmbeddable: true,
      viewerType: 'pdf'
    };
  }

  // 4. Remote Word / DOCX file via Microsoft Office Online Viewer
  if (
    (url.toLowerCase().endsWith('.docx') || url.toLowerCase().endsWith('.doc') || fileType === 'DOCX') &&
    url.startsWith('http') &&
    !url.includes('localhost') &&
    !url.includes('example.com')
  ) {
    return {
      embedUrl: `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`,
      isIframeEmbeddable: true,
      viewerType: 'office'
    };
  }

  return {
    embedUrl: url,
    isIframeEmbeddable: true,
    viewerType: fileType === 'PDF' ? 'pdf' : 'reader'
  };
}
