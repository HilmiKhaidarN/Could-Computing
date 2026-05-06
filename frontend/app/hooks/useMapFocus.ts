'use client';

import { useCallback, useRef } from 'react';
import type { Report } from '@/app/lib/data';

/**
 * Provides a ref-based API to imperatively pan/zoom the Leaflet map
 * from outside the MapView component (e.g. clicking a priority list item).
 */
export function useMapFocus() {
  // mapInstanceRef is set by MapView via the onMapReady callback
  const mapRef = useRef<unknown>(null);

  const focusReport = useCallback((report: Report) => {
    if (!mapRef.current) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const map = mapRef.current as any;
    map.flyTo([report.lat, report.lng], 16, { animate: true, duration: 0.8 });
  }, []);

  return { mapRef, focusReport };
}
