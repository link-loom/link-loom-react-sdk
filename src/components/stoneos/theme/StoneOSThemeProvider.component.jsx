import React, { useEffect, useMemo, useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import createStoneOSTheme from './createStoneOSTheme.js';
import injectStoneOSStyles from './injectStoneOSStyles.js';

const DARK_QUERY = '(prefers-color-scheme: dark)';

const readSystemMode = () => {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return 'light';
  }

  return window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light';
};

function StoneOSThemeProvider({ mode = 'system', className, style, children }) {
  // -----------------------------------------------------
  // 1. Hooks / State
  // -----------------------------------------------------
  const [systemMode, setSystemMode] = useState(readSystemMode);

  // -----------------------------------------------------
  // 2. Derived
  // -----------------------------------------------------
  const resolvedMode = mode === 'system' ? systemMode : mode === 'dark' ? 'dark' : 'light';
  const theme = useMemo(() => createStoneOSTheme({ mode: resolvedMode }), [resolvedMode]);

  // -----------------------------------------------------
  // 3. Lifecycle
  // -----------------------------------------------------
  injectStoneOSStyles();

  useEffect(() => {
    if (mode !== 'system' || typeof window === 'undefined' || !window.matchMedia) {
      return undefined;
    }

    const query = window.matchMedia(DARK_QUERY);
    const onChange = (event) => setSystemMode(event.matches ? 'dark' : 'light');

    setSystemMode(query.matches ? 'dark' : 'light');
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, [mode]);

  // -----------------------------------------------------
  // 4. Render
  // -----------------------------------------------------
  return (
    <ThemeProvider theme={theme}>
      <div
        className={className ? `stos-app ${className}` : 'stos-app'}
        data-theme={resolvedMode}
        style={style}
      >
        {children}
      </div>
    </ThemeProvider>
  );
}

export default StoneOSThemeProvider;
