/**
 * Convert a base64 data URL into a native Blob for fast, memory-safe browser operations.
 */
export function dataURLtoBlob(dataurl) {
  try {
    const arr = dataurl.split(',');
    if (arr.length < 2) return null;
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  } catch (e) {
    console.error('Error converting dataURL to Blob:', e);
    return null;
  }
}

/**
 * Trigger a browser file download from either a regular URL or a large base64 data URL
 * without binding multi-MB data URIs directly into list DOM attributes.
 */
export function triggerDocumentDownload(fileUrl, fileName = 'document') {
  if (!fileUrl) return;

  let downloadUrl = fileUrl;
  let revokeAfter = false;

  if (fileUrl.startsWith('data:')) {
    const blob = dataURLtoBlob(fileUrl);
    if (blob) {
      downloadUrl = URL.createObjectURL(blob);
      revokeAfter = true;
    }
  }

  let finalName = fileName || 'document';
  if (!/\.[a-zA-Z0-9]{2,5}$/.test(finalName)) {
    if (fileUrl.includes('application/pdf')) finalName = `${finalName}.pdf`;
    else if (fileUrl.includes('image/png')) finalName = `${finalName}.png`;
    else if (fileUrl.includes('image/webp')) finalName = `${finalName}.webp`;
    else if (fileUrl.startsWith('data:image')) finalName = `${finalName}.jpg`;
  }

  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = finalName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  if (revokeAfter) {
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 10000);
  }
}
