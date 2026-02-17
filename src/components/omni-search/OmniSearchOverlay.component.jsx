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
  maxWidth: '680px',
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
  outline: 'none',
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

  marginRight: '8px',
  color: 'rgba(255, 255, 255, 0.8)',
  boxShadow: '0 1px 0 rgba(0,0,0,0.2)',
});

const FilterChipsContainer = styled('div')({
  gap: '8px',
  padding: '12px 24px 4px 24px',

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

        const payloadList = targetCategories.map((category) => ({
          service: category.service,
          payload: {
            ...category.payload,
            query: { search: debouncedQuery },
          },
        }));

        const responses = await fetchMultipleEntities(payloadList);

        const newResults = {};
        targetCategories.forEach((category, index) => {
          const response = responses[index];
          const items = Array.isArray(response) ? response : response?.items || [];
          if (items.length > 0) {
            newResults[category.id] = items;
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
    (command) => {
      onOpenChange(false);
      resetSearchState();
      if (command.action) {
        command.action();
      }
    },
    [onOpenChange, resetSearchState],
  );

  const handleKeyDown = (event) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      if (activeValue) {
        const staticMatch = staticCommands.find(
          (comma) => comma.label.toLowerCase() === activeValue.toLowerCase(),
        );
        if (staticMatch) {
          onQueryChange(staticMatch.label);
          return;
        }
        const slashMatch = slashCommands.find(
          (comma) => comma.label.toLowerCase() === activeValue.toLowerCase(),
        );
        if (slashMatch) {
          onQueryChange(slashMatch.label);
          return;
        }
      }

      if (query && query.length > 0) {
        let bestMatch = null;
        if (query.startsWith('/')) {
          bestMatch = slashCommands.find((command) =>
            command.label.toLowerCase().startsWith(query.toLowerCase()),
          );
        } else {
          bestMatch = staticCommands.find((command) =>
            command.label.toLowerCase().startsWith(query.toLowerCase()),
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
          className="w-100 h-auto overflow-hidden d-flex flex-column position-relative"
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
            className="d-flex align-items-center overflow-auto"
            style={{
              opacity: isCommandMode ? 0.3 : 1,
              pointerEvents: isCommandMode ? 'none' : 'auto',
            }}
          >
            <FilterChip
              className="text-nowrap d-flex align-items-center"
              active={activeFilter === 'all'}
              onClick={() => setActiveFilter('all')}
            >
              All
            </FilterChip>
            {categories.map((category) => (
              <FilterChip
                className="text-nowrap d-flex align-items-center"
                key={category.id}
                active={activeFilter === category.id}
                onClick={() => setActiveFilter(category.id)}
              >
                {category.label}
              </FilterChip>
            ))}
          </FilterChipsContainer>

          <Command.List>
            <Command.Empty>No results found.</Command.Empty>

            {activeFilter === 'all' && !isCommandMode && (
              <Command.Group heading={!query || query.length < 2 ? 'Suggestions' : 'Navigation'}>
                {staticCommands
                  .filter((command) => {
                    if (!query || query.length < 2) {
                      return command.isPriority;
                    }
                    return true;
                  })
                  .map((command) => (
                    <Command.Item
                      key={command.id}
                      onSelect={() => handleStaticSelect(command)}
                      value={command.label}
                    >
                      {command.icon}
                      <span>{command.label}</span>
                      {command.shortcut && (
                        <div style={{ marginLeft: 'auto' }}>
                          <Kbd className="d-inline-flex align-items-center justify-content-center">
                            {command.shortcut}
                          </Kbd>
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
                  .filter((command) => {
                    if (query && query.length > 0) {
                      return true;
                    }
                    return command.isPriority;
                  })
                  .map((command) => (
                    <Command.Item
                      key={command.id}
                      onSelect={() => handleStaticSelect(command)}
                      value={`/ ${command.label} ${command.description || ''}`}
                    >
                      {command.icon}
                      <div className="d-flex flex-column">
                        <div className="d-flex align-items-center gap-2">
                          <span className="text-white">{command.label}</span>
                          <span className="text-white-50 small">{command.description}</span>
                        </div>
                        {command.app && (
                          <span className="text-secondary opacity-75 small">{command.app}</span>
                        )}
                      </div>
                      <div className="ms-auto d-flex gap-2">
                        <Kbd className="d-inline-flex align-items-center justify-content-center">
                          ↵
                        </Kbd>
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
                .filter((category) => activeFilter === 'all' || activeFilter === category.id)
                .map(
                  (category) =>
                    category.onCreate && (
                      <Command.Group key={`create-${category.id}`} heading={category.label}>
                        <Command.Item
                          onSelect={() => {
                            onOpenChange(false);
                            category.onCreate(query);
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
            <span className="d-flex align-items-center">
              <Kbd className="d-inline-flex align-items-center justify-content-center">
                <ArrowUpIcon sx={{ fontSize: 12 }} />
              </Kbd>
              <Kbd className="d-inline-flex align-items-center justify-content-center">
                <ArrowDownIcon sx={{ fontSize: 12 }} />
              </Kbd>
              Navigate
            </span>
            <span className="d-flex align-items-center">
              <Kbd className="d-inline-flex align-items-center justify-content-center">
                <EnterIcon sx={{ fontSize: 12 }} />
              </Kbd>
              Select
            </span>
            <span className="d-flex align-items-center">
              <Kbd className="d-inline-flex align-items-center justify-content-center">esc</Kbd>
              Close
            </span>
          </div>
        </StyledCommand>
      </Fade>
    </Modal>
  );
}

export default OmniSearchOverlay;
