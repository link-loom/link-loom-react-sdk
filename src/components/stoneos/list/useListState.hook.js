import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  applyListPatch,
  clearListParams,
  hasActiveFilters,
  readListValues,
} from './listState.helpers.js';

// The filters of a list live in the URL (?text=ana&roles=customer,supplier) so a refresh or a shared
// link opens the same list; the page does not. Each filter is declared with its kind: 'text', 'list'
// (a comma list) or 'flag' (true when present).
export default function useListState(
  definition,
  { defaultPage = DEFAULT_PAGE, defaultPageSize = DEFAULT_PAGE_SIZE } = {},
) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [pagination, setPagination] = useState({ page: defaultPage, pageSize: defaultPageSize });
  const definitionKey = JSON.stringify(definition);

  const values = useMemo(() => readListValues(searchParams, definition), [searchParams, definitionKey]);

  // Several filters in one change: the router does not queue two updates made in the same tick.
  const setValues = useCallback(
    (patch) => {
      setSearchParams((previous) => applyListPatch(previous, patch), { replace: true });
      setPagination((current) => ({ ...current, page: defaultPage }));
    },
    [setSearchParams, defaultPage],
  );

  const setValue = useCallback((name, value) => setValues({ [name]: value }), [setValues]);

  const clear = useCallback(() => {
    setSearchParams((previous) => clearListParams(previous, Object.keys(definition)), { replace: true });
    setPagination((current) => ({ ...current, page: defaultPage }));
  }, [setSearchParams, defaultPage, definitionKey]);

  return {
    values,
    setValue,
    setValues,
    clear,
    active: hasActiveFilters(values),
    pagination,
    setPagination,
    key: JSON.stringify(values),
  };
}
