import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Download,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  ShieldCheck,
  Calendar,
  Info,
  Maximize2
} from 'lucide-react';
import '../../styles/document-viewer.css';

// Helper to convert base64 dataURL to Blob for high-performance native browser rendering
function dataURLtoBlob(dataurl) {
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
    console.error('Error converting dataURL to Blob', e);
    return null;
  }
}

// Generate rotated image as a Blob preserving full original resolution and quality
function getRotatedImageBlob(imageUrl, rotationDegrees, mimeType = 'image/png') {
  return new Promise((resolve, reject) => {
    const rot = ((rotationDegrees % 360) + 360) % 360;
    if (rot === 0) {
      resolve(null);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    let resolved = false;
    const processImage = () => {
      if (resolved) return;
      resolved = true;
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const origW = img.naturalWidth || img.width;
        const origH = img.naturalHeight || img.height;

        if (rot === 90 || rot === 270) {
          canvas.width = origH;
          canvas.height = origW;
        } else {
          canvas.width = origW;
          canvas.height = origH;
        }

        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rot * Math.PI) / 180);
        ctx.drawImage(img, -origW / 2, -origH / 2);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              try {
                const dataUrl = canvas.toDataURL(mimeType, 0.95);
                resolve(dataURLtoBlob(dataUrl));
              } catch (e) {
                reject(e);
              }
            }
          },
          mimeType,
          0.95
        );
      } catch (err) {
        reject(err);
      }
    };

    img.onload = processImage;
    img.onerror = (err) => {
      if (resolved) return;
      resolved = true;
      reject(err);
    };
    img.src = imageUrl;

    if (img.complete && img.naturalWidth) {
      processImage();
    }
  });
}

export default function DocumentViewerModal({
  isOpen,
  onClose,
  document: currentDoc,
  documents = [],
  onSelectDocument
}) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isMousePanning, setIsMousePanning] = useState(false);
  const [blobUrl, setBlobUrl] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const imgContainerRef = useRef(null);
  const panRef = useRef({ x: 0, y: 0 });
  const zoomRef = useRef(1);
  panRef.current = pan;
  zoomRef.current = zoom;

  const gestureRef = useRef({
    mode: null,
    startX: 0,
    startY: 0,
    origPanX: 0,
    origPanY: 0,
    pinchStartDist: 0,
    pinchStartZoom: 1,
    lastTapTime: 0,
    moved: false
  });

  // Compute navigation indices if documents array is provided
  const currentIndex = useMemo(() => {
    if (!currentDoc || !documents.length) return -1;
    return documents.findIndex(d => d.id === currentDoc.id);
  }, [currentDoc, documents]);

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < documents.length - 1;

  const handlePrev = useCallback(() => {
    if (hasPrev && onSelectDocument) {
      onSelectDocument(documents[currentIndex - 1]);
    }
  }, [hasPrev, onSelectDocument, documents, currentIndex]);

  const handleNext = useCallback(() => {
    if (hasNext && onSelectDocument) {
      onSelectDocument(documents[currentIndex + 1]);
    }
  }, [hasNext, onSelectDocument, documents, currentIndex]);

  const clampPan = useCallback((x, y, z) => {
    if (z <= 1) return { x: 0, y: 0 };
    const rect = imgContainerRef.current?.getBoundingClientRect();
    const maxX = rect ? (rect.width * (z - 1)) / 2 + 80 : 320 * z;
    const maxY = rect ? (rect.height * (z - 1)) / 2 + 80 : 320 * z;
    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y))
    };
  }, []);

  const applyZoom = useCallback((updater) => {
    setZoom((prev) => {
      const nextRaw = typeof updater === 'function' ? updater(prev) : updater;
      const next = Math.max(0.5, Math.min(3.5, Math.round(nextRaw * 100) / 100));
      if (next <= 1) {
        setPan({ x: 0, y: 0 });
      } else {
        setPan((p) => clampPan(p.x, p.y, next));
      }
      return next;
    });
  }, [clampPan]);

  // Reset zoom, rotation & pan when active document changes
  useEffect(() => {
    setZoom(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });
  }, [currentDoc?.id]);

  // Desktop mouse drag panning cleanup
  useEffect(() => {
    if (!isMousePanning) return;

    const handleWindowMouseMove = (e) => {
      const g = gestureRef.current;
      const dx = e.clientX - g.startX;
      const dy = e.clientY - g.startY;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) g.moved = true;
      setPan(clampPan(g.origPanX + dx, g.origPanY + dy, zoomRef.current));
    };

    const handleWindowMouseUp = () => {
      setIsMousePanning(false);
      setIsDragging(false);
      gestureRef.current.mode = null;
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [isMousePanning, clampPan]);

  // Generate and manage Blob URL for the document
  useEffect(() => {
    if (!currentDoc?.file_url) {
      setBlobUrl(null);
      return;
    }

    if (currentDoc.file_url.startsWith('data:')) {
      const blob = dataURLtoBlob(currentDoc.file_url);
      if (blob) {
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
        return () => {
          URL.revokeObjectURL(url);
        };
      } else {
        setBlobUrl(currentDoc.file_url);
      }
    } else {
      setBlobUrl(currentDoc.file_url);
    }
  }, [currentDoc?.file_url]);

  // Determine file kind
  const fileKind = useMemo(() => {
    if (!currentDoc) return 'unknown';
    const url = currentDoc.file_url || '';
    const name = (currentDoc.file_name || '').toLowerCase();

    if (url.includes('application/pdf') || name.endsWith('.pdf')) {
      return 'pdf';
    }
    if (
      url.startsWith('data:image') ||
      name.endsWith('.png') ||
      name.endsWith('.jpg') ||
      name.endsWith('.jpeg') ||
      name.endsWith('.webp') ||
      name.endsWith('.svg') ||
      name.endsWith('.gif')
    ) {
      return 'image';
    }
    if (url.startsWith('data:text') || name.endsWith('.txt') || name.endsWith('.md')) {
      return 'text';
    }
    return 'other';
  }, [currentDoc]);

  // Keyboard navigation & escape listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === '+' || e.key === '=') {
        applyZoom(z => z + 0.25);
      } else if (e.key === '-') {
        applyZoom(z => z - 0.25);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handlePrev, handleNext, applyZoom]);

  const handleImgTouchStart = (e) => {
    if (e.target.closest('.doc-viewer-zoom-bar')) return;

    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      gestureRef.current.mode = 'pinch';
      gestureRef.current.pinchStartDist = Math.hypot(dx, dy) || 1;
      gestureRef.current.pinchStartZoom = zoomRef.current;
      gestureRef.current.moved = true;
      setIsDragging(true);
    } else if (e.touches.length === 1) {
      const t = e.touches[0];
      gestureRef.current.startX = t.clientX;
      gestureRef.current.startY = t.clientY;
      gestureRef.current.origPanX = panRef.current.x;
      gestureRef.current.origPanY = panRef.current.y;
      gestureRef.current.moved = false;
      gestureRef.current.mode = zoomRef.current > 1 ? 'pan' : (documents.length > 1 ? 'swipe' : null);
      if (gestureRef.current.mode) {
        setIsDragging(true);
      }
    }
  };

  const handleImgTouchMove = (e) => {
    const g = gestureRef.current;
    if (g.mode === 'pinch' && e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy) || 1;
      const nextZoom = g.pinchStartZoom * (dist / g.pinchStartDist);
      applyZoom(nextZoom);
    } else if (g.mode === 'pan' && e.touches.length === 1) {
      const t = e.touches[0];
      const dx = t.clientX - g.startX;
      const dy = t.clientY - g.startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) g.moved = true;
      setPan(clampPan(g.origPanX + dx, g.origPanY + dy, zoomRef.current));
    } else if (g.mode === 'swipe' && e.touches.length === 1) {
      const t = e.touches[0];
      const dx = t.clientX - g.startX;
      const dy = t.clientY - g.startY;
      if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
        g.moved = true;
        setPan({ x: Math.max(-90, Math.min(90, dx * 0.45)), y: 0 });
      }
    }
  };

  const handleImgTouchEnd = (e) => {
    const g = gestureRef.current;

    if (g.mode === 'pinch' && e.touches.length === 1) {
      // Transition cleanly from 2-finger pinch to 1-finger pan
      const t = e.touches[0];
      g.mode = zoomRef.current > 1 ? 'pan' : null;
      g.startX = t.clientX;
      g.startY = t.clientY;
      g.origPanX = panRef.current.x;
      g.origPanY = panRef.current.y;
      return;
    }

    if (g.mode === 'swipe') {
      const endX = e.changedTouches[0]?.clientX ?? g.startX;
      const dx = endX - g.startX;
      setPan({ x: 0, y: 0 });
      if (dx < -55 && hasNext) {
        handleNext();
      } else if (dx > 55 && hasPrev) {
        handlePrev();
      }
    } else if (!g.moved && g.mode !== 'pinch' && e.changedTouches.length === 1 && !e.target.closest('.doc-viewer-zoom-bar')) {
      const now = Date.now();
      if (now - g.lastTapTime < 280) {
        g.lastTapTime = 0;
        applyZoom(zoomRef.current > 1 ? 1 : 2);
      } else {
        g.lastTapTime = now;
      }
    }

    if (e.touches.length === 0) {
      g.mode = null;
      setIsDragging(false);
    }
  };

  const handleImgMouseDown = (e) => {
    if (e.button !== 0 || zoomRef.current <= 1) return;
    if (e.target.closest('.doc-viewer-zoom-bar')) return;
    e.preventDefault();
    const g = gestureRef.current;
    g.mode = 'mouse-pan';
    g.startX = e.clientX;
    g.startY = e.clientY;
    g.origPanX = panRef.current.x;
    g.origPanY = panRef.current.y;
    g.moved = false;
    setIsDragging(true);
    setIsMousePanning(true);
  };

  const handleImgDoubleClick = (e) => {
    if (e.target.closest('.doc-viewer-zoom-bar')) return;
    applyZoom(zoomRef.current > 1 ? 1 : 2);
  };

  if (!isOpen || !currentDoc) return null;

  const activeUrl = blobUrl || currentDoc.file_url;
  const normRot = ((rotation % 360) + 360) % 360;

  const handleDownload = async () => {
    if (!activeUrl || isDownloading) return;

    const baseFileName = currentDoc.file_name || 'document';

    // If it's an image and has been rotated, generate and download rotated image
    if (fileKind === 'image' && normRot !== 0) {
      setIsDownloading(true);
      try {
        const isPng = baseFileName.toLowerCase().endsWith('.png') || (currentDoc.file_url && currentDoc.file_url.includes('image/png'));
        const isWebp = baseFileName.toLowerCase().endsWith('.webp') || (currentDoc.file_url && currentDoc.file_url.includes('image/webp'));
        const mimeType = isPng ? 'image/png' : isWebp ? 'image/webp' : 'image/jpeg';

        const rotatedBlob = await getRotatedImageBlob(activeUrl, normRot, mimeType);
        if (rotatedBlob) {
          const downloadUrl = URL.createObjectURL(rotatedBlob);
          const link = document.createElement('a');
          link.href = downloadUrl;

          let downloadName = baseFileName;
          if (!/\.[a-zA-Z0-9]{3,4}$/.test(baseFileName)) {
            const ext = isPng ? '.png' : isWebp ? '.webp' : '.jpg';
            downloadName = `${baseFileName}${ext}`;
          }

          link.download = downloadName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(() => URL.revokeObjectURL(downloadUrl), 10000);
          return;
        }
      } catch (err) {
        console.error('Error generating rotated download, falling back to original:', err);
      } finally {
        setIsDownloading(false);
      }
    }

    // Default download for non-rotated or non-image
    let defaultName = baseFileName;
    if (!/\.[a-zA-Z0-9]{2,5}$/.test(baseFileName)) {
      const urlStr = currentDoc.file_url || '';
      if (fileKind === 'pdf' || urlStr.includes('application/pdf')) defaultName = `${baseFileName}.pdf`;
      else if (urlStr.includes('image/png')) defaultName = `${baseFileName}.png`;
      else if (urlStr.includes('image/webp')) defaultName = `${baseFileName}.webp`;
      else if (fileKind === 'image') defaultName = `${baseFileName}.jpg`;
    }
    const link = document.createElement('a');
    link.href = activeUrl;
    link.download = defaultName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenTab = async (e) => {
    if (fileKind === 'image' && normRot !== 0) {
      if (e) e.preventDefault();
      try {
        const isPng = (currentDoc.file_name || '').toLowerCase().endsWith('.png') || (currentDoc.file_url && currentDoc.file_url.includes('image/png'));
        const isWebp = (currentDoc.file_name || '').toLowerCase().endsWith('.webp') || (currentDoc.file_url && currentDoc.file_url.includes('image/webp'));
        const mimeType = isPng ? 'image/png' : isWebp ? 'image/webp' : 'image/jpeg';

        const rotatedBlob = await getRotatedImageBlob(activeUrl, normRot, mimeType);
        if (rotatedBlob) {
          const rotatedUrl = URL.createObjectURL(rotatedBlob);
          window.open(rotatedUrl, '_blank');
          setTimeout(() => URL.revokeObjectURL(rotatedUrl), 60000);
          return;
        }
      } catch (err) {
        console.error('Error opening rotated tab:', err);
      }
    }
    window.open(activeUrl, '_blank');
  };

  return createPortal(
    <div className="doc-viewer-overlay" onClick={onClose}>
      <div className="doc-viewer-box" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="doc-viewer-header">
          <div className="doc-viewer-info">
            <div className={`doc-viewer-icon-pill ${fileKind}`}>
              {fileKind === 'pdf' ? 'PDF' : fileKind === 'image' ? <ImageIcon size={20} /> : <FileText size={20} />}
            </div>
            <div className="doc-viewer-meta">
              <h3 className="doc-viewer-title">
                <span>{currentDoc.file_name}</span>
                {currentDoc.document_type && (
                  <span className="doc-viewer-badge">{currentDoc.document_type}</span>
                )}
              </h3>
              <div className="doc-viewer-sub">
                {currentDoc.file_size && <span>{currentDoc.file_size}</span>}
                {currentDoc.upload_date && <span>• Uploaded {currentDoc.upload_date}</span>}
                {currentDoc.expiry_date && (
                  <span style={{ color: '#FBBF24' }}>• Expires: {currentDoc.expiry_date}</span>
                )}
                {documents.length > 1 && currentIndex >= 0 && (
                  <span style={{ color: '#38BDF8' }}>
                    • ({currentIndex + 1} of {documents.length})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions & Controls */}
          <div className="doc-viewer-actions">
            {/* Multi-document navigation */}
            {documents.length > 1 && (
              <div className="doc-viewer-action-group doc-viewer-nav-group">
                <button
                  type="button"
                  className="doc-viewer-nav-btn"
                  onClick={handlePrev}
                  disabled={!hasPrev}
                  title="Previous Document (Left Arrow)"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  className="doc-viewer-nav-btn"
                  onClick={handleNext}
                  disabled={!hasNext}
                  title="Next Document (Right Arrow)"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}

            {/* Image zoom controls in header */}
            {fileKind === 'image' && (
              <div className="doc-viewer-action-group doc-viewer-zoom-group">
                <button
                  type="button"
                  className="doc-viewer-btn icon-only"
                  onClick={() => applyZoom(z => z - 0.25)}
                  title="Zoom Out (-)"
                >
                  <ZoomOut size={16} />
                </button>
                <button
                  type="button"
                  className="doc-viewer-btn icon-only"
                  onClick={() => applyZoom(1)}
                  title="Reset Zoom"
                >
                  <Maximize2 size={15} />
                </button>
                <button
                  type="button"
                  className="doc-viewer-btn icon-only"
                  onClick={() => applyZoom(z => z + 0.25)}
                  title="Zoom In (+)"
                >
                  <ZoomIn size={16} />
                </button>
                <button
                  type="button"
                  className="doc-viewer-btn icon-only"
                  onClick={() => setRotation(r => (r + 90) % 360)}
                  title="Rotate 90°"
                >
                  <RotateCw size={15} />
                </button>
              </div>
            )}

            {/* Open in new window / tab */}
            {activeUrl && (
              <button
                type="button"
                onClick={handleOpenTab}
                className="doc-viewer-btn open-tab-btn"
                title={normRot !== 0 ? `Open Rotated (${normRot}°) in new browser tab` : "Open in new browser tab"}
              >
                <ExternalLink size={15} />
                <span>Open Tab</span>
              </button>
            )}

            {/* Direct download (Rotated in exact orientation if rotated) */}
            {activeUrl && (
              <button
                type="button"
                onClick={handleDownload}
                disabled={isDownloading}
                className="doc-viewer-btn primary"
                title={normRot !== 0 ? `Download in current rotation (${normRot}°)` : "Download file"}
              >
                <Download size={15} />
                <span>
                  {isDownloading
                    ? 'Rotating...'
                    : normRot !== 0
                    ? `Download (${normRot}°)`
                    : 'Download'}
                </span>
              </button>
            )}

            {/* Close */}
            <button
              type="button"
              className="doc-viewer-btn icon-only close"
              onClick={onClose}
              title="Close (Esc)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Canvas Body */}
        <div className="doc-viewer-canvas">
          {!activeUrl ? (
            <div className="doc-viewer-empty">
              <div className="doc-viewer-empty-icon">
                <FileText size={32} />
              </div>
              <h4 style={{ color: '#FFFFFF', margin: 0 }}>No File Attached</h4>
              <p style={{ fontSize: '0.86rem', maxWidth: '360px', margin: 0 }}>
                This record was cataloged with metadata only and does not currently have an uploaded file attached.
              </p>
            </div>
          ) : fileKind === 'pdf' ? (
            <iframe
              src={`${activeUrl}#toolbar=1&navpanes=1&scrollbar=1`}
              title={currentDoc.file_name}
              className="doc-viewer-iframe"
            />
          ) : fileKind === 'image' ? (
            <div
              ref={imgContainerRef}
              className={`doc-viewer-img-container ${zoom > 1 ? 'can-pan' : ''} ${isMousePanning ? 'is-panning' : ''}`}
              onTouchStart={handleImgTouchStart}
              onTouchMove={handleImgTouchMove}
              onTouchEnd={handleImgTouchEnd}
              onTouchCancel={handleImgTouchEnd}
              onMouseDown={handleImgMouseDown}
              onDoubleClick={handleImgDoubleClick}
            >
              <img
                src={activeUrl}
                alt={currentDoc.file_name}
                draggable={false}
                className={`doc-viewer-img ${isDragging ? 'is-dragging' : ''}`}
                style={{
                  transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom}) rotate(${rotation}deg)`
                }}
              />
              {/* Floating zoom & rotate indicator */}
              <div className="doc-viewer-zoom-bar">
                <button
                  type="button"
                  className="doc-viewer-zoom-btn"
                  onClick={() => applyZoom(z => z - 0.25)}
                  title="Zoom Out (-)"
                >
                  <ZoomOut size={14} />
                </button>
                <span
                  className="doc-viewer-zoom-val"
                  onClick={() => applyZoom(1)}
                  title="Tap to reset zoom (Double-tap image to zoom)"
                  style={{ cursor: 'pointer' }}
                >
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  type="button"
                  className="doc-viewer-zoom-btn"
                  onClick={() => applyZoom(z => z + 0.25)}
                  title="Zoom In (+)"
                >
                  <ZoomIn size={14} />
                </button>
                <button
                  type="button"
                  className="doc-viewer-zoom-btn"
                  onClick={() => setRotation(r => (r + 90) % 360)}
                  title={`Rotate 90° clockwise (Current: ${normRot}°)`}
                >
                  <RotateCw size={14} />
                </button>
                {(zoom !== 1 || normRot !== 0 || pan.x !== 0 || pan.y !== 0) && (
                  <button
                    type="button"
                    className="doc-viewer-zoom-btn"
                    onClick={() => { setZoom(1); setRotation(0); setPan({ x: 0, y: 0 }); }}
                    title="Reset Zoom, Pan & Rotation"
                  >
                    <RotateCcw size={14} />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="doc-viewer-empty">
              <div className="doc-viewer-empty-icon">
                <FileText size={32} />
              </div>
              <h4 style={{ color: '#FFFFFF', margin: 0 }}>Document Ready</h4>
              <p style={{ fontSize: '0.86rem', maxWidth: '380px', margin: 0 }}>
                {currentDoc.file_name} ({currentDoc.file_size || 'File attached'})
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <a
                  href={activeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="doc-viewer-btn"
                >
                  <ExternalLink size={15} />
                  <span>Open in Browser</span>
                </a>
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="doc-viewer-btn primary"
                >
                  <Download size={15} />
                  <span>Download Document</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer info & notes */}
        {currentDoc.description && (
          <div className="doc-viewer-footer">
            <div className="doc-viewer-notes">
              <Info size={15} color="#38BDF8" style={{ flexShrink: 0 }} />
              <span>{currentDoc.description}</span>
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748B', flexShrink: 0 }}>
              End-to-End Encrypted Personal Vault
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
