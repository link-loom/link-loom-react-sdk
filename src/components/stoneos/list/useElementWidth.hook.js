import { useEffect, useState } from 'react';

// Width of an element, kept current with a ResizeObserver. A StoneOS app runs embedded, so layouts follow
// their own container, not the window. 0 until the element is measured. Returns [ref callback, width].
export default function useElementWidth() {
  const [element, setElement] = useState(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!element) {
      return undefined;
    }

    // Measured at once, so the first layout does not wait for the observer's first report.
    setWidth(Math.round(element.getBoundingClientRect().width));
    if (typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    const observer = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);

  return [setElement, width];
}
