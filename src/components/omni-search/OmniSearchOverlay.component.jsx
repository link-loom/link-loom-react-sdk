import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Command } from 'cmdk';
import { styled, alpha } from '@mui/material/styles';
import { Modal, Backdrop, Fade } from '@mui/material';
import {
  Search as SearchIcon,
  ArrowForward as ArrowForwardIcon,
  SubdirectoryArrowLeft as EnterIcon,
  KeyboardArrowUp as ArrowUpIcon,
  KeyboardArrowDown as ArrowDownIcon,
} from '@mui/icons-material';
import { fetchMultipleEntities } from '../../services/utils/entityServiceAdapter';
import useDebounce from '../../hooks/useDebounce';

const StyledCommand = styled(Command)(({ theme }) => ({
  width: '100%',
  maxWidth: '680px',
  height: 'auto',
  maxHeight: '800px',
  backgroundColor: 'rgba(22, 22, 24, 0.92)',
  borderRadius: '16px',
  boxShadow: `
    0px 0px 0px 1px rgba(255, 255, 255, 0.08), // Inner light border
    0px 24px 48px -12px rgba(0, 0, 0, 0.8),   // Deep shadow
    0px 4px 12px rgba(0, 0, 0, 0.5)
  `,
  border: '1px solid rgba(255, 255, 255, 0.08)',
  fontFamily: 'inherit',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  outline: 'none',
  position: 'relative',
  zIndex: 1301,
  transform: 'translateZ(0)',

  '& [cmdk-input]': {
    width: '100%',
    padding: '20px 24px',
    fontSize: '18px',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    color: '#ffffff',
    outline: 'none',
    letterSpacing: '-0.01em',
    '&::placeholder': {
      color: 'rgba(255, 255, 255, 0.4)',
    },
  },

  '& [cmdk-list]': {
    height: 'min(500px, 50vh)',
    overflow: 'auto',
    padding: '8px 12px',
    scrollBehavior: 'smooth',
    overscrollBehavior: 'contain',
  },

  '& [cmdk-empty]': {
    padding: '48px',
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: '15px',
  },

  '& [cmdk-group-heading]': {
    padding: '12px 12px 6px',
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    color: 'rgba(255, 255, 255, 0.3)',
  },

  '& [cmdk-group="Command Center"] [cmdk-group-heading]': {
    color: '#a78bfa',
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '1px',
  },

  '& [cmdk-item]': {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '12px 14px',
    borderRadius: '10px',
    fontSize: '15px',
    color: 'rgba(255, 255, 255, 0.9)',
    cursor: 'pointer',
    contentVisibility: 'auto',
    transition: 'background-color 0.05s ease',
    marginBottom: '2px',
    '&[data-selected="true"]': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      color: '#ffffff',
      '& svg': {
        color: '#ffffff',
      },
    },
    '&:active': {
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
    },
    '& svg': {
      fontSize: '20px',
      color: 'rgba(255, 255, 255, 0.5)',
      transition: 'none',
    },
  },

  '& [cmdk-footer]': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '12px 24px',
    gap: '20px',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.4)',
  },
}));

const StyledBackdrop = styled(Backdrop)({
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
});

const Kbd = styled('kbd')({
  backgroundColor: 'rgba(255, 255, 255, 0.08)',
  borderRadius: '6px',
  padding: '3px 7px',
  fontSize: '11px',
  fontWeight: 500,
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  minWidth: '22px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: '8px',
  color: 'rgba(255, 255, 255, 0.8)',
  boxShadow: '0 1px 0 rgba(0,0,0,0.2)',
});

const ShortcutLabel = styled('span')({
  display: 'flex',
  alignItems: 'center',
});

const FilterChipsContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '12px 24px 4px 24px',
  overflowX: 'auto',
  scrollbarWidth: 'none',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
});

const FilterChip = styled('button')(({ active }) => ({
  appearance: 'none',
  background: active ? 'rgba(255, 255, 255, 0.15)' : 'rgb(42 41 41)',
  border: active ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '20px',
  padding: '6px 14px',
  color: active ? '#ffffff' : 'rgba(255, 255, 255, 0.6)',
  fontSize: '13px',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'background 0.1s ease',
  whiteSpace: 'nowrap',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  outline: 'none',

  '&:hover': {
    background: 'rgba(255, 255, 255, 0.12)',
    color: '#ffffff',
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
}));

import { useOmniSearchRegistry } from './contexts/OmniSearchRegistryContext';

function OmniSearchOverlay({
  open,
  onOpenChange,
  query,
  onQueryChange,
  categories = [],
  staticCommands = [],
  slashCommands: propSlashCommands = [],
}) {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({});
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeValue, setActiveValue] = useState('');

  const { commands: contextCommands } = useOmniSearchRegistry();

  const slashCommands = useMemo(() => {
    return [...propSlashCommands, ...contextCommands];
  }, [propSlashCommands, contextCommands]);

  const isCommandMode = query.startsWith('/');

  const debouncedQuery = useDebounce(query, 300);

  const resetSearchState = useCallback(() => {
    setActiveFilter('all');
    setResults({});
    setLoading(false);
    setActiveValue('');
    onQueryChange('');
  }, [onQueryChange]);

  useEffect(() => {
    if (!open) {
      resetSearchState();
      return;
    }

    if (debouncedQuery.startsWith('/')) {
      setResults({});
      return;
    }

    if (!debouncedQuery || debouncedQuery.length < 2) {
      setResults({});
      return;
    }

    const performSearch = async () => {
      setLoading(true);
      try {
        const targetCategories =
          activeFilter === 'all' ? categories : categories.filter((c) => c.id === activeFilter);

        const payloadList = targetCategories.map((cat) => ({
          service: cat.service,
          payload: {
            ...cat.payload,
            query: { search: debouncedQuery },
          },
        }));

        const responses = await fetchMultipleEntities(payloadList);

        const newResults = {};
        targetCategories.forEach((cat, index) => {
          const response = responses[index];
          const items = Array.isArray(response) ? response : response?.items || [];
          if (items.length > 0) {
            newResults[cat.id] = items;
          }
        });

        setResults(newResults);
      } catch (error) {
        console.error('OmniSearch Error:', error);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery, activeFilter, categories, open, resetSearchState]);

  const handleSelect = useCallback(
    (item, category) => {
      onOpenChange(false);
      resetSearchState();
      if (category.onSelect) {
        category.onSelect(item);
      }
    },
    [onOpenChange, resetSearchState],
  );

  const handleStaticSelect = useCallback(
    (cmd) => {
      onOpenChange(false);
      resetSearchState();
      if (cmd.action) {
        cmd.action();
      }
    },
    [onOpenChange, resetSearchState],
  );

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      if (activeValue) {
        const staticMatch = staticCommands.find(
          (cmd) => cmd.label.toLowerCase() === activeValue.toLowerCase(),
        );
        if (staticMatch) {
          onQueryChange(staticMatch.label);
          return;
        }
        const slashMatch = slashCommands.find(
          (cmd) => cmd.label.toLowerCase() === activeValue.toLowerCase(),
        );
        if (slashMatch) {
          onQueryChange(slashMatch.label);
          return;
        }
      }

      if (query && query.length > 0) {
        let bestMatch = null;
        if (query.startsWith('/')) {
          bestMatch = slashCommands.find((cmd) =>
            cmd.label.toLowerCase().startsWith(query.toLowerCase()),
          );
        } else {
          bestMatch = staticCommands.find((cmd) =>
            cmd.label.toLowerCase().startsWith(query.toLowerCase()),
          );
        }

        if (bestMatch) {
          onQueryChange(bestMatch.label);
        }
      }
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      closeAfterTransition
      slots={{ backdrop: StyledBackdrop }}
      className="d-flex align-items-center justify-content-center"
    >
      <Fade in={open}>
        <StyledCommand
          label="OmniSearch"
          onValueChange={(v) => setActiveValue(v)}
          shouldFilter={true}
        >
          <div style={{ position: 'relative' }}>
            <SearchIcon
              style={{
                position: 'absolute',
                left: 24,
                top: 22,
                color: 'rgba(255,255,255,0.4)',
                fontSize: 22,
              }}
            />
            <Command.Input
              autoFocus
              value={query}
              onValueChange={onQueryChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask AI anything or search..."
              style={{ paddingLeft: '60px' }}
            />

            {loading && (
              <div style={{ position: 'absolute', right: 24, top: 24 }}>
                <span style={{ fontSize: '11px', opacity: 0.5, color: '#fff' }}>Loading...</span>
              </div>
            )}
          </div>

          <FilterChipsContainer
            style={{
              opacity: isCommandMode ? 0.3 : 1,
              pointerEvents: isCommandMode ? 'none' : 'auto',
            }}
          >
            <FilterChip active={activeFilter === 'all'} onClick={() => setActiveFilter('all')}>
              All
            </FilterChip>
            {categories.map((cat) => (
              <FilterChip
                key={cat.id}
                active={activeFilter === cat.id}
                onClick={() => setActiveFilter(cat.id)}
              >
                {cat.label}
              </FilterChip>
            ))}
          </FilterChipsContainer>

          <Command.List>
            <Command.Empty>No results found.</Command.Empty>

            {activeFilter === 'all' && !isCommandMode && (
              <Command.Group heading={!query || query.length < 2 ? 'Suggestions' : 'Navigation'}>
                {staticCommands
                  .filter((cmd) => {
                    if (!query || query.length < 2) {
                      return cmd.isPriority;
                    }
                    return true;
                  })
                  .map((cmd) => (
                    <Command.Item
                      key={cmd.id}
                      onSelect={() => handleStaticSelect(cmd)}
                      value={cmd.label}
                    >
                      {cmd.icon}
                      <span>{cmd.label}</span>
                      {cmd.shortcut && (
                        <div style={{ marginLeft: 'auto' }}>
                          <Kbd>{cmd.shortcut}</Kbd>
                        </div>
                      )}
                    </Command.Item>
                  ))}
              </Command.Group>
            )}

            {(!query || query.length < 2) && activeFilter === 'all' && !isCommandMode && (
              <div
                style={{
                  height: '1px',
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  margin: '8px 0',
                }}
              />
            )}

            {activeFilter === 'all' && (
              <Command.Group heading="Command Center  ⌘/">
                {slashCommands
                  .filter((cmd) => {
                    if (query && query.length > 0) {
                      return true;
                    }
                    return cmd.isPriority;
                  })
                  .map((cmd) => (
                    <Command.Item
                      key={cmd.id}
                      onSelect={() => handleStaticSelect(cmd)}
                      value={`/ ${cmd.label} ${cmd.description || ''}`}
                    >
                      {cmd.icon}
                      <div className="d-flex flex-column">
                        <div className="d-flex align-items-center gap-2">
                          <span className="text-white">{cmd.label}</span>
                          <span className="text-white-50 small">{cmd.description}</span>
                        </div>
                        {cmd.app && (
                          <span className="text-secondary opacity-75 small">{cmd.app}</span>
                        )}
                      </div>
                      <div className="ms-auto d-flex gap-2">
                        <Kbd>↵</Kbd>
                      </div>
                    </Command.Item>
                  ))}
              </Command.Group>
            )}

            {!isCommandMode &&
              Object.entries(results).map(([catId, items]) => {
                const category = categories.find((c) => c.id === catId);
                if (!category) {
                  return null;
                }

                return (
                  <Command.Group key={catId} heading={category.label}>
                    {items.map((item) => (
                      <Command.Item
                        key={item._id || item.id}
                        onSelect={() => handleSelect(item, category)}
                      >
                        {category.icon}
                        <span>{item.name || item.title || item.label || 'Unknown Item'}</span>
                      </Command.Item>
                    ))}
                  </Command.Group>
                );
              })}

            {query.length > 2 &&
              !isCommandMode &&
              categories
                .filter((c) => activeFilter === 'all' || activeFilter === c.id)
                .map(
                  (cat) =>
                    cat.onCreate && (
                      <Command.Group key={`create-${cat.id}`} heading={cat.label}>
                        <Command.Item
                          onSelect={() => {
                            onOpenChange(false);
                            cat.onCreate(query);
                          }}
                        >
                          <ArrowForwardIcon />
                          <span>Create "{query}"</span>
                        </Command.Item>
                      </Command.Group>
                    ),
                )}
          </Command.List>

          <div cmdk-footer="true">
            <ShortcutLabel>
              <Kbd>
                <ArrowUpIcon sx={{ fontSize: 12 }} />
              </Kbd>
              <Kbd>
                <ArrowDownIcon sx={{ fontSize: 12 }} />
              </Kbd>
              Navigate
            </ShortcutLabel>
            <ShortcutLabel>
              <Kbd>
                <EnterIcon sx={{ fontSize: 12 }} />
              </Kbd>
              Select
            </ShortcutLabel>
            <ShortcutLabel>
              <Kbd>esc</Kbd>
              Close
            </ShortcutLabel>
          </div>
        </StyledCommand>
      </Fade>
    </Modal>
  );
}

export default OmniSearchOverlay;
