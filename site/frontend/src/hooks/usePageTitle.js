import { useEffect } from 'react';

const BASE_TITLE = 'Max Profit Calculator';

/**
 * Sets document.title for the current route. Pass the route-specific
 * suffix or null/empty to restore the base title.
 */
export function usePageTitle(suffix) {
  useEffect(() => {
    const previous = document.title;
    document.title = suffix ? `${suffix} | ${BASE_TITLE}` : BASE_TITLE;
    return () => {
      document.title = previous;
    };
  }, [suffix]);
}
