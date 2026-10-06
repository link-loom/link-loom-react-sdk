import { useEffect, useState } from 'react';

const SIZE_ATTRIBUTE = 'data-sidebar-size';

const readCondensed = () => document.body.getAttribute(SIZE_ATTRIBUTE) === 'condensed';

/**
 * Whether the sidebar is condensed, from the body attribute the layout engine sets and the
 * `link-loom.setBoxed` / `link-loom.setFluid` events it fires when the size changes.
 */
export const useSidebarCondensed = () => {
  const [isCondensed, setIsCondensed] = useState(readCondensed);

  useEffect(() => {
    const condense = () => setIsCondensed(true);
    const expand = () => setIsCondensed(false);

    window.addEventListener('link-loom.setBoxed', condense);
    window.addEventListener('link-loom.setFluid', expand);
    setIsCondensed(readCondensed());

    return () => {
      window.removeEventListener('link-loom.setBoxed', condense);
      window.removeEventListener('link-loom.setFluid', expand);
    };
  }, []);

  return isCondensed;
};

export default useSidebarCondensed;
