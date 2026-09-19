import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Box, Button, CircularProgress, Dialog, IconButton, Tooltip, Typography } from '@mui/material';
import {
  AudioFileOutlined as AudioFileIcon,
  ChevronLeftOutlined as PreviousIcon,
  ChevronRightOutlined as NextIcon,
  CloseOutlined as CloseIcon,
  DownloadOutlined as DownloadIcon,
  FitScreenOutlined as FitIcon,
  InsertDriveFileOutlined as FileIcon,
  ZoomInOutlined as ZoomInIcon,
  ZoomOutOutlined as ZoomOutIcon,
} from '@mui/icons-material';

export const MEDIA_PREVIEW_LABELS = {
  close: 'Close',
  download: 'Download',
  previous: 'Previous',
  next: 'Next',
  zoomIn: 'Zoom in',
  zoomOut: 'Zoom out',
  fit: 'Fit to screen',
  loading: 'Loading preview',
  unavailable: 'This file cannot be previewed',
  counter: '{current} of {total}',
};

// Zoom factors relative to the fitted size; the natural size (100%) joins the ladder when it falls inside it.
const ZOOM_FACTORS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4];
const ZOOM_EPSILON = 0.001;
const WHEEL_ZOOM_SENSITIVITY = 0.002;

const zoomLadder = (fitScale) => {
  const scales = ZOOM_FACTORS.map((factor) => factor * fitScale);
  const withinLadder = 1 > scales[0] && 1 < scales[scales.length - 1];
  return (withinLadder ? [...scales, 1] : scales).sort((left, right) => left - right);
};

export const mediaFamily = (item) => {
  const mimeType = String(item?.mimeType || item?.mime_type || item?.type || '').toLowerCase();
  if (mimeType.startsWith('image/')) {
    return 'image';
  }
  if (mimeType.startsWith('video/')) {
    return 'video';
  }
  if (mimeType.startsWith('audio/')) {
    return 'audio';
  }
  if (mimeType === 'application/pdf') {
    return 'pdf';
  }
  return 'file';
};

const withDownloadFlag = (url) => `${url}${url.includes('?') ? '&' : '?'}download=1`;

const triggerDownload = (url, name) => {
  const anchor = document.createElement('a');
  anchor.href = url.startsWith('blob:') ? url : withDownloadFlag(url);
  anchor.download = name || '';
  anchor.rel = 'noopener noreferrer';
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
};

/**
 * Kit preview of images, PDFs, video and audio inside the app (never navigates the host tab).
 * `items`: [{ id, name, mimeType | mime_type, url? }]; `resolveUrl(item) → Promise<string>` mints a URL when
 * the item has none (e.g. `sdk.files.getUrl(item.id, { recordId })`). Esc, the backdrop and the close button
 * close it; arrow keys and the side buttons move across `items`.
 */
function MediaPreviewDialog({ open, items = [], index = 0, onIndexChange, onClose, resolveUrl, labels }) {
  // Models
  const [activeIndex, setActiveIndex] = useState(index);
  const [mediaUrl, setMediaUrl] = useState(null);

  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [imageSize, setImageSize] = useState(null);
  const [viewportSize, setViewportSize] = useState(null);
  const [scale, setScale] = useState(null);

  const [viewportNode, setViewportNode] = useState(null);
  const viewportRef = useRef(null);
  const imageRef = useRef(null);
  const zoomAnchorRef = useRef(null);

  const attachViewport = useCallback((node) => {
    viewportRef.current = node;
    setViewportNode(node);
  }, []);

  const text = { ...MEDIA_PREVIEW_LABELS, ...labels };
  const total = items.length;
  const item = items[Math.min(Math.max(activeIndex, 0), Math.max(total - 1, 0))] || null;
  const family = mediaFamily(item);

  const moveTo = useCallback(
    (nextIndex) => {
      if (!total) {
        return;
      }
      const bounded = (nextIndex + total) % total;
      setActiveIndex(bounded);
      onIndexChange?.(bounded);
    },
    [total, onIndexChange],
  );

  const fitScale =
    imageSize && viewportSize
      ? Math.min(viewportSize.width / imageSize.width, viewportSize.height / imageSize.height, 1)
      : null;
  const isFitted = scale === null;
  const effectiveScale = isFitted ? fitScale : scale;

  // `anchor` is a point in viewport coordinates that stays put while zooming (the center by default).
  const applyScale = useCallback(
    (nextScale, anchor) => {
      const viewport = viewportRef.current;
      if (!viewport || !fitScale || !effectiveScale) {
        return;
      }

      const ladder = zoomLadder(fitScale);
      const bounded = Math.min(Math.max(nextScale, ladder[0]), ladder[ladder.length - 1]);
      if (Math.abs(bounded - effectiveScale) < ZOOM_EPSILON) {
        return;
      }

      const imageBounds = imageRef.current?.getBoundingClientRect();
      if (imageBounds?.width && imageBounds?.height) {
        const viewportBounds = viewport.getBoundingClientRect();
        const anchorX = anchor?.x ?? viewport.clientWidth / 2;
        const anchorY = anchor?.y ?? viewport.clientHeight / 2;
        zoomAnchorRef.current = {
          x: anchorX,
          y: anchorY,
          imageX: (viewportBounds.left + anchorX - imageBounds.left) / imageBounds.width,
          imageY: (viewportBounds.top + anchorY - imageBounds.top) / imageBounds.height,
        };
      }
      setScale(Math.abs(bounded - fitScale) < ZOOM_EPSILON ? null : bounded);
    },
    [fitScale, effectiveScale],
  );

  const changeZoom = (direction) => {
    if (!fitScale || !effectiveScale) {
      return;
    }
    const ladder = zoomLadder(fitScale);
    const next =
      direction > 0
        ? ladder.find((step) => step > effectiveScale + ZOOM_EPSILON)
        : [...ladder].reverse().find((step) => step < effectiveScale - ZOOM_EPSILON);
    if (next !== undefined) {
      applyScale(next);
    }
  };

  const toggleNaturalSize = (event) => {
    if (!fitScale) {
      return;
    }
    const viewport = viewportRef.current;
    const bounds = viewport?.getBoundingClientRect();
    const anchor = bounds ? { x: event.clientX - bounds.left, y: event.clientY - bounds.top } : undefined;
    const atNaturalSize = Math.abs((effectiveScale ?? 0) - 1) < ZOOM_EPSILON;
    if (isFitted && Math.abs(fitScale - 1) < ZOOM_EPSILON) {
      applyScale(Math.min(2, zoomLadder(fitScale).pop()), anchor);
      return;
    }
    if (!isFitted && (atNaturalSize || Math.abs(fitScale - 1) < ZOOM_EPSILON)) {
      setScale(null);
      return;
    }
    applyScale(1, anchor);
  };

  const download = () => {
    if (mediaUrl) {
      triggerDownload(mediaUrl, item?.name);
    }
  };

  useEffect(() => {
    if (open) {
      setActiveIndex(index);
    }
  }, [open, index]);

  useEffect(() => {
    if (!open || !item) {
      return undefined;
    }

    let current = true;
    setScale(null);
    setImageSize(null);
    setHasError(false);

    if (item.url) {
      setMediaUrl(item.url);
      setIsLoading(false);
      return undefined;
    }

    if (typeof resolveUrl !== 'function') {
      setMediaUrl(null);
      setHasError(true);
      return undefined;
    }

    setMediaUrl(null);
    setIsLoading(true);
    Promise.resolve(resolveUrl(item))
      .then((url) => {
        if (current) {
          setMediaUrl(url || null);
          setHasError(!url);
        }
      })
      .catch(() => current && setHasError(true))
      .finally(() => current && setIsLoading(false));

    return () => {
      current = false;
    };
  }, [open, item?.id, item?.url]);

  useEffect(() => {
    if (!viewportNode || typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    const measure = () => setViewportSize({ width: viewportNode.clientWidth, height: viewportNode.clientHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewportNode);
    return () => observer.disconnect();
  }, [viewportNode]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!open || !viewport || family !== 'image' || !fitScale) {
      return undefined;
    }

    const handleWheel = (event) => {
      if (!event.ctrlKey && !event.metaKey) {
        return;
      }
      event.preventDefault();
      const bounds = viewport.getBoundingClientRect();
      const factor = Math.exp(-event.deltaY * WHEEL_ZOOM_SENSITIVITY);
      applyScale((effectiveScale ?? fitScale) * factor, { x: event.clientX - bounds.left, y: event.clientY - bounds.top });
    };

    viewport.addEventListener('wheel', handleWheel, { passive: false });
    return () => viewport.removeEventListener('wheel', handleWheel);
  }, [open, family, fitScale, effectiveScale, applyScale]);

  // Keeps the anchored image point under the same viewport point after the new size is laid out.
  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const imageBounds = imageRef.current?.getBoundingClientRect();
    const anchor = zoomAnchorRef.current;
    zoomAnchorRef.current = null;
    if (!viewport || !imageBounds || !anchor) {
      return;
    }
    const viewportBounds = viewport.getBoundingClientRect();
    viewport.scrollLeft += imageBounds.left + anchor.imageX * imageBounds.width - (viewportBounds.left + anchor.x);
    viewport.scrollTop += imageBounds.top + anchor.imageY * imageBounds.height - (viewportBounds.top + anchor.y);
  }, [scale]);

  useEffect(() => {
    if (!open || total < 2) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        moveTo(activeIndex - 1);
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        moveTo(activeIndex + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, total, activeIndex, moveTo]);

  const renderMedia = () => {
    if (isLoading) {
      return <CircularProgress size={28} aria-label={text.loading} sx={{ color: '#ffffff' }} />;
    }

    if (hasError || !mediaUrl || family === 'file') {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, color: '#ffffff' }}>
          {family === 'audio' ? <AudioFileIcon sx={{ fontSize: 56 }} /> : <FileIcon sx={{ fontSize: 56 }} />}
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
            {hasError || !mediaUrl ? text.unavailable : item?.name}
          </Typography>
          {mediaUrl && (
            <Button variant="contained" size="small" startIcon={<DownloadIcon />} onClick={download}>
              {text.download}
            </Button>
          )}
        </Box>
      );
    }

    if (family === 'image') {
      const renderedSize =
        imageSize && effectiveScale
          ? { width: Math.max(1, Math.round(imageSize.width * effectiveScale)), height: Math.max(1, Math.round(imageSize.height * effectiveScale)) }
          : null;
      return (
        <>
          {!renderedSize && <CircularProgress size={28} aria-label={text.loading} sx={{ position: 'absolute', color: '#ffffff' }} />}
          <img
            key={mediaUrl}
            ref={imageRef}
            src={mediaUrl}
            alt={item?.name || ''}
            draggable={false}
            onLoad={(event) => setImageSize({ width: event.currentTarget.naturalWidth || 1, height: event.currentTarget.naturalHeight || 1 })}
            onError={() => setHasError(true)}
            onDoubleClick={toggleNaturalSize}
            style={{
              display: 'block',
              flexShrink: 0,
              maxWidth: 'none',
              width: renderedSize ? `${renderedSize.width}px` : 0,
              height: renderedSize ? `${renderedSize.height}px` : 0,
              opacity: renderedSize ? 1 : 0,
              cursor: isFitted ? 'zoom-in' : 'zoom-out',
            }}
          />
        </>
      );
    }

    if (family === 'video') {
      return <video src={mediaUrl} controls autoPlay style={{ maxWidth: '100%', maxHeight: '100%' }} />;
    }

    if (family === 'audio') {
      return <audio src={mediaUrl} controls autoPlay style={{ width: 'min(480px, 100%)' }} />;
    }

    return <iframe src={mediaUrl} title={item?.name || ''} style={{ width: '100%', height: '100%', border: 0, background: '#ffffff' }} />;
  };

  const toolbarButton = (label, icon, onClick, disabled = false) => (
    <Tooltip title={label}>
      <span>
        <IconButton size="small" aria-label={label} onClick={onClick} disabled={disabled} sx={{ color: '#ffffff', '&.Mui-disabled': { color: 'rgba(255,255,255,0.35)' } }}>
          {icon}
        </IconButton>
      </span>
    </Tooltip>
  );

  return (
    <Dialog
      open={Boolean(open && item)}
      onClose={onClose}
      fullWidth
      maxWidth={false}
      disableScrollLock
      className="stos-media-preview"
      sx={{ '& .MuiBackdrop-root': { backgroundColor: 'rgba(12, 16, 26, 0.88)' } }}
      PaperProps={{
        sx: { width: 'min(1200px, calc(100% - 32px))', height: 'calc(100% - 32px)', m: 2, backgroundColor: 'rgba(12, 16, 26, 0.72)', backgroundImage: 'none', borderRadius: '10px', boxShadow: 'none', overflow: 'hidden' },
        onClick: (event) => event.target === event.currentTarget && onClose?.(),
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: 44, px: 1, color: '#ffffff', flexShrink: 0 }}>
        <Typography variant="h5" component="span" noWrap sx={{ flex: 1, color: '#ffffff' }}>
          {item?.name}
        </Typography>
        {total > 1 && (
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', mr: 1 }}>
            {text.counter.replace('{current}', String(activeIndex + 1)).replace('{total}', String(total))}
          </Typography>
        )}
        {family === 'image' && !hasError && mediaUrl && (
          <>
            {toolbarButton(text.zoomOut, <ZoomOutIcon fontSize="small" />, () => changeZoom(-1), !fitScale || effectiveScale <= zoomLadder(fitScale)[0] + ZOOM_EPSILON)}
            <Typography
              variant="caption"
              aria-live="polite"
              sx={{ minWidth: 44, textAlign: 'center', color: 'rgba(255,255,255,0.85)', fontVariantNumeric: 'tabular-nums' }}
            >
              {effectiveScale ? `${Math.round(effectiveScale * 100)}%` : ''}
            </Typography>
            {toolbarButton(text.zoomIn, <ZoomInIcon fontSize="small" />, () => changeZoom(1), !fitScale || effectiveScale >= zoomLadder(fitScale).pop() - ZOOM_EPSILON)}
            {toolbarButton(text.fit, <FitIcon fontSize="small" />, () => setScale(null), isFitted)}
          </>
        )}
        {toolbarButton(text.download, <DownloadIcon fontSize="small" />, download, !mediaUrl)}
        {toolbarButton(text.close, <CloseIcon fontSize="small" />, onClose)}
      </Box>

      <Box sx={{ position: 'relative', flex: 1, minHeight: 0, display: 'flex', px: total > 1 ? 7 : 1, pb: 1 }}>
        <Box
          ref={attachViewport}
          onClick={(event) => event.target === event.currentTarget && onClose?.()}
          sx={{ position: 'relative', flex: 1, minWidth: 0, minHeight: 0, overflow: isFitted ? 'hidden' : 'auto' }}
        >
          <Box
            onClick={(event) => event.target === event.currentTarget && onClose?.()}
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '100%', minHeight: '100%', ...(family === 'image' ? { width: 'max-content', height: 'max-content' } : { width: '100%', height: '100%' }) }}
          >
            {renderMedia()}
          </Box>
        </Box>
        {total > 1 && (
          <>
            <IconButton
              aria-label={text.previous}
              onClick={() => moveTo(activeIndex - 1)}
              sx={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#ffffff', background: 'rgba(255,255,255,0.12)', '&:hover': { background: 'rgba(255,255,255,0.22)' } }}
            >
              <PreviousIcon />
            </IconButton>
            <IconButton
              aria-label={text.next}
              onClick={() => moveTo(activeIndex + 1)}
              sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: '#ffffff', background: 'rgba(255,255,255,0.12)', '&:hover': { background: 'rgba(255,255,255,0.22)' } }}
            >
              <NextIcon />
            </IconButton>
          </>
        )}
      </Box>
    </Dialog>
  );
}

export default MediaPreviewDialog;
