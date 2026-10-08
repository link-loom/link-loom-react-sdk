import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  OPENED_IN_APP,
  clearActionParams,
  clearOpenParams,
  closeEntityParams,
  createEntityParams,
  openEntityParams,
  readEntityRoute,
  resolveEntityRouteParams,
} from './entityRoute.helpers.js';

// The URL carries the open record (?id=<id>), the create form (?new=1), a value to resolve (?open=<value>)
// and the action to open the record with (?action=complete|approve), so each can be refreshed, shared
// and reopened from a deep link. Openings inside the app push a history entry (the header arrow closes
// them); launches replace the entry they start on. It works on the path the person is in, so every list
// of the app uses it the same way. `params` renames any of the four URL params.
export default function useEntityRoute({ params } = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const names = useMemo(
    () => resolveEntityRouteParams(params),
    [params?.id, params?.create, params?.open, params?.action],
  );
  const { openId, creating, openValue, action } = readEntityRoute(searchParams, names);
  const draft = location.state?.draft || null;
  const openedInApp = Boolean(location.state?.[OPENED_IN_APP]);

  const stateFor = useCallback(
    (replace, extra = {}) => ({ ...extra, [OPENED_IN_APP]: replace ? openedInApp : true }),
    [openedInApp],
  );

  const searchOn = useCallback(
    (pathname) => (pathname === location.pathname ? location.search : ''),
    [location.pathname, location.search],
  );

  const go = useCallback(
    (pathname, nextParams, { replace = false, state } = {}) => {
      const search = nextParams.toString();
      navigate({ pathname, search: search ? `?${search}` : '' }, { replace, state: stateFor(replace, state) });
    },
    [navigate, stateFor],
  );

  const openEntity = useCallback(
    (id, { replace = false, pathname = location.pathname, action: nextAction } = {}) => {
      if (!id) {
        return;
      }
      go(pathname, openEntityParams(searchOn(pathname), names, id, nextAction), { replace });
    },
    [go, searchOn, names, location.pathname],
  );

  const startCreate = useCallback(
    (nextDraft = null, { replace = false, pathname = location.pathname } = {}) => {
      go(pathname, createEntityParams(searchOn(pathname), names), { replace, state: { draft: nextDraft } });
    },
    [go, searchOn, names, location.pathname],
  );

  const closeEntity = useCallback(() => {
    if (openedInApp) {
      navigate(-1);
      return;
    }
    go(location.pathname, closeEntityParams(location.search, names), { replace: true });
  }, [navigate, openedInApp, go, names, location.pathname, location.search]);

  // Drops the action once the form it opened is closed, keeping the record open.
  const clearAction = useCallback(() => {
    go(location.pathname, clearActionParams(location.search, names), { replace: true });
  }, [go, names, location.pathname, location.search]);

  // Drops the value to resolve (?open=) once it was resolved.
  const clearOpen = useCallback(() => {
    go(location.pathname, clearOpenParams(location.search, names), { replace: true });
  }, [go, names, location.pathname, location.search]);

  return { openId, creating, openValue, action, draft, openEntity, startCreate, closeEntity, clearAction, clearOpen };
}
