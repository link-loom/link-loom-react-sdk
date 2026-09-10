import React from 'react';
import {
  GridToolbarQuickFilter,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarExport,
} from '@mui/x-data-grid';

/**
 * The toolbar the DataGrid has always rendered: columns · filters · density ·
 * optional export on the left, quick filter on the right. `toolbar="default"`.
 * The component name is kept from the previous inline definition so anything
 * that inspects component names (snapshots, devtools) sees no change.
 */
export const CustomSearchToolbar = ({ showExport }) => {
  return (
    <GridToolbarContainer>
      <section className="col-12 d-flex flex-column mt-3">
        <div className="d-flex justify-content-between mb-3">
          <section>
            <GridToolbarColumnsButton />
            <GridToolbarFilterButton />
            <GridToolbarDensitySelector />

            {showExport && <GridToolbarExport />}
          </section>

          <GridToolbarQuickFilter
            className="me-3 border-1"
            placeholder="Search..."
          />
        </div>
      </section>
    </GridToolbarContainer>
  );
};

export const DefaultToolbar = CustomSearchToolbar;

/**
 * Quick filter only, right-aligned. The placeholder is not hardcoded: it comes
 * from `localeText.toolbarQuickFilterPlaceholder`, so it follows the grid
 * `locale` ("Buscar…" for `es`, "Search…" for `en`). `toolbar="search"`.
 */
export const SearchToolbar = () => {
  return (
    <GridToolbarContainer sx={{ justifyContent: 'flex-end', px: 1.5, py: 1 }}>
      <GridToolbarQuickFilter />
    </GridToolbarContainer>
  );
};

const isComponent = (value) =>
  typeof value === 'function' || (typeof value === 'object' && value !== null && !!value.$$typeof);

/**
 * Translates the `toolbar` option into a `slots.toolbar` value.
 *
 *   undefined                 → undefined  (nothing decided; caller keeps its default)
 *   'none' | null | false     → null       (no toolbar)
 *   'default' | true          → DefaultToolbar
 *   'search'                  → SearchToolbar
 *   a React component         → the component itself
 */
export const resolveToolbar = (toolbar) => {
  if (toolbar === undefined) return undefined;
  if (toolbar === null || toolbar === false || toolbar === 'none') return null;
  if (toolbar === true || toolbar === 'default') return DefaultToolbar;
  if (toolbar === 'search') return SearchToolbar;
  if (isComponent(toolbar)) return toolbar;
  return undefined;
};
