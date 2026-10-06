import { useEffect } from 'react';
import { usePageMetaActions } from './PageMeta.context.jsx';

/**
 * Declares the page's title, breadcrumb and icon, once, from the page:
 *
 *   usePageMeta({ title: 'My work' });
 *   usePageMeta({ title: project.name, breadcrumb: [{ label: 'Workspaces', to: '/workspaces' }, { label: space.name }] });
 *
 * The title is printed by the page's own header; the navbar shows the breadcrumb. Outside a
 * PageMetaProvider it does nothing.
 */
export default function usePageMeta({ title, breadcrumb = [], icon = null } = {}) {
  const actions = usePageMetaActions();
  const setMeta = actions?.setMeta;
  const clearMeta = actions?.clearMeta;
  const breadcrumbKey = breadcrumb.map((crumb) => `${crumb?.label}|${crumb?.to || ''}`).join('/');

  useEffect(() => {
    setMeta?.({ title: title || '', breadcrumb, icon });

    return () => clearMeta?.();
    // the breadcrumb is compared by its content, not by reference
  }, [setMeta, clearMeta, title, breadcrumbKey, icon]);
}
