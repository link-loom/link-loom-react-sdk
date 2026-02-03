import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OmniSearchTrigger from './OmniSearchTrigger.component';
import OmniSearchOverlay from './OmniSearchOverlay.component';

function OmniSearch({ categories, staticCommands, slashCommands, open, onOpenChange }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  // Toggle Function
  const toggle = () => onOpenChange((prev) => !prev);

  useEffect(() => {
    const down = (e) => {
      // Open Command Center on Cmd+/ (Slash Command)
      if (e.key === '/' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(true);
        setQuery('/'); // Pre-fill slash
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [onOpenChange]);

  // Enrich functional props (navigation)
  const enrichedCategories = (categories || []).map((cat) => ({
    ...cat,
    onSelect: (item) => {
      if (cat.onSelect) cat.onSelect(item, navigate);
    },
    onCreate: (query) => {
      if (cat.onCreate) cat.onCreate(query, navigate);
    },
  }));

  const allStaticCommands = (staticCommands || []).map((cmd) => ({
    ...cmd,
    action: () => {
      if (cmd.action) cmd.action(navigate);
    },
  }));

  return (
    <>
      <OmniSearchTrigger onClick={toggle} />
      <OmniSearchOverlay
        open={open}
        onOpenChange={onOpenChange}
        query={query}
        onQueryChange={setQuery}
        categories={enrichedCategories}
        staticCommands={allStaticCommands}
        slashCommands={slashCommands}
      />
    </>
  );
}

export default OmniSearch;
