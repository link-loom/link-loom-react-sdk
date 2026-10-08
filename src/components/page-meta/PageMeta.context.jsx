import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { applyHeadMeta, hasSeoFields, resolveHeadMeta } from './head-meta.js';

const EMPTY_META = { title: '', breadcrumb: [], icon: null, description: '', robots: '', canonical: '', openGraph: null };

const PageMetaStateContext = createContext(null);
const PageMetaActionsContext = createContext(null);

/**
 * What the chrome knows about the current page: its title (for document.title), its breadcrumb (what
 * the navbar shows), an optional icon and, when declared, its SEO (description, robots, canonical, Open Graph). The page prints its title once, in its own header; the
 * navbar shows the trail above it, or nothing when the page is a root.
 *
 * State and actions live in two contexts: a page that only declares its meta (usePageMeta) does not
 * re-render when the meta changes, and the navbar that reads it does.
 */
export function PageMetaProvider({ appName = '', defaults = null, children }) {
  const [meta, setMetaState] = useState(EMPTY_META);

  const setMeta = useCallback((next) => setMetaState({ ...EMPTY_META, ...(next || {}) }), []);
  const clearMeta = useCallback(() => setMetaState(EMPTY_META), []);
  const actions = useMemo(() => ({ setMeta, clearMeta }), [setMeta, clearMeta]);

  useEffect(() => {
    const documentTitle = [meta.title, appName].filter(Boolean).join(' · ');
    if (!documentTitle) {
      return;
    }

    document.title = documentTitle;
  }, [meta.title, appName]);

  // SEO tags are only managed when the app gives defaults or a page declares them, so apps that set neither keep
  // the <head> index.html shipped.
  useEffect(() => {
    if (!defaults && !hasSeoFields(meta)) {
      return;
    }

    applyHeadMeta(document, resolveHeadMeta({ meta, defaults: defaults || {}, appName }));
  }, [meta, defaults, appName]);

  return (
    <PageMetaActionsContext.Provider value={actions}>
      <PageMetaStateContext.Provider value={meta}>{children}</PageMetaStateContext.Provider>
    </PageMetaActionsContext.Provider>
  );
}

/** The current `{ title, breadcrumb, icon }`, or null outside a PageMetaProvider. */
export const usePageMetaState = () => useContext(PageMetaStateContext);

/** `{ setMeta, clearMeta }`, or null outside a PageMetaProvider. */
export const usePageMetaActions = () => useContext(PageMetaActionsContext);
