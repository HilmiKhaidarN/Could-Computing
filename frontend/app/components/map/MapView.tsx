'use client';

import { useEffect, useRef, useState } from 'react';
import type { ApiReport } from '@/app/lib/types';

interface MapViewProps {
  reports: ApiReport[];
  onMarkerClick?: (report: ApiReport) => void;
  onMapReady?: (mapInstance: unknown) => void;
  selectedId?: string | null;
  focusReport?: ApiReport | null;
}

const PRIORITY_COLORS: Record<string, string> = {
  urgent: '#FF3B30',
  medium: '#FF9500',
  low:    '#34C759',
};

const PRIORITY_LABELS: Record<string, string> = {
  urgent: 'Urgent',
  medium: 'Medium',
  low:    'Rendah',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  proses:  'Diproses',
  selesai: 'Selesai',
  ditolak: 'Ditolak',
};

/** SVG pin marker — larger + pulse ring when selected */
function buildSvgIcon(color: string, isSelected: boolean): string {  const w = isSelected ? 42 : 34;
  const h = isSelected ? 52 : 42;
  const pulse = isSelected
    ? `<circle cx="16" cy="16" r="13" fill="${color}" opacity="0.18">
         <animate attributeName="r" values="13;20;13" dur="1.8s" repeatCount="indefinite"/>
         <animate attributeName="opacity" values="0.18;0;0.18" dur="1.8s" repeatCount="indefinite"/>
       </circle>`
    : '';
  return `
    <svg width="${w}" height="${h}" viewBox="0 0 32 42" fill="none"
         xmlns="http://www.w3.org/2000/svg"
         style="transition:all 0.25s cubic-bezier(0.34,1.56,0.64,1);
                filter:drop-shadow(0 ${isSelected ? 5 : 2}px ${isSelected ? 10 : 5}px ${color}55)">
      ${pulse}
      <path d="M16 0C7.163 0 0 7.163 0 16c0 11 16 26 16 26S32 27 32 16C32 7.163 24.837 0 16 0z"
            fill="${color}"/>
      <circle cx="16" cy="16" r="7.5" fill="white" opacity="0.96"/>
      <circle cx="16" cy="16" r="${isSelected ? 5 : 4}" fill="${color}"/>
    </svg>`;
}

/** Popup HTML — polished card */
function buildPopupHtml(report: ApiReport, color: string): string {
  const priorityLabel = PRIORITY_LABELS[report.priorityLabel] ?? report.priorityLabel;
  const statusLabel   = STATUS_LABELS[report.status]    ?? report.status;
  const scoreHtml = (report.aiScore !== undefined || report.predictedPriority !== undefined)
    ? `<div style="margin-top:10px;padding-top:10px;border-top:1px solid #F0F0F5;">
         <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
           <span style="font-size:10px;font-weight:600;color:#6366F1;">🧠 AI Score</span>
           <span style="font-size:13px;font-weight:800;color:#0071E3;">${(report.aiScore ?? report.predictedPriority ?? 5).toFixed(1)}<span style="font-size:9px;color:#AEAEB2;font-weight:400;">/10</span></span>
         </div>
         <div style="height:4px;background:#F0F0F5;border-radius:4px;overflow:hidden;">
           <div style="height:100%;width:${((report.aiScore ?? report.predictedPriority ?? 5) / 10) * 100}%;background:linear-gradient(90deg,#0071E3,#6366F1);border-radius:4px;"></div>
         </div>
       </div>`
    : '';
  return `
    <div style="padding:14px 16px;min-width:230px;font-family:-apple-system,BlinkMacSystemFont,'Inter',sans-serif;">
      <div style="display:flex;align-items:center;gap:7px;margin-bottom:9px;">
        <span style="width:7px;height:7px;border-radius:50%;background:${color};flex-shrink:0;display:inline-block;box-shadow:0 0 6px ${color}88;"></span>
        <span style="font-size:10px;font-weight:700;color:${color};text-transform:uppercase;letter-spacing:0.6px;">${priorityLabel}</span>
        <span style="margin-left:auto;font-size:9px;font-weight:600;padding:2px 7px;border-radius:20px;background:#F5F5F7;color:#6E6E73;">${statusLabel}</span>
      </div>
      <p style="font-size:13px;font-weight:700;color:#1D1D1F;margin:0 0 5px 0;line-height:1.35;">${report.title}</p>
      <p style="font-size:11px;color:#6E6E73;margin:0 0 9px 0;">📍 ${report.location}</p>
      <span style="font-size:10px;font-weight:600;padding:3px 9px;border-radius:20px;background:#F5F5F7;color:#1D1D1F;">${report.category}</span>
      ${scoreHtml}
      <p style="font-size:10px;color:#AEAEB2;margin:8px 0 0 0;">📅 ${report.date}</p>
    </div>`;
}

export default function MapView({
  reports,
  onMarkerClick,
  onMapReady,
  selectedId,
  focusReport,
}: MapViewProps) {
  const mapRef         = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef     = useRef<Map<string, any>>(new Map());
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const circlesRef     = useRef<any[]>([]);  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  /* ── Init map ─────────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!isClient || !mapRef.current || mapInstanceRef.current) return;

    import('leaflet').then((L) => {
      delete (L.Icon.Default.prototype as Record<string, unknown>)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current!, {
        center: [-6.9175, 107.6191],
        zoom: 13,
        zoomControl: true,
        attributionControl: false,
      });

      // Smooth tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        className: 'map-tiles',
      }).addTo(map);

      L.control.attribution({ prefix: '© OpenStreetMap' }).addTo(map);

      mapInstanceRef.current = map;
      onMapReady?.(map);

      addMarkers(L, map, reports, onMarkerClick, selectedId);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersRef.current.clear();
        circlesRef.current = [];
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient]);

  /* ── Re-render markers on change ─────────────────────────────────────────── */
  useEffect(() => {
    if (!mapInstanceRef.current || !isClient) return;
    import('leaflet').then((L) => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current.clear();
      circlesRef.current.forEach((c) => c.remove());
      circlesRef.current = [];
      addMarkers(L, mapInstanceRef.current, reports, onMarkerClick, selectedId);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reports, selectedId, isClient]);

  /* ── Fly to focused report ────────────────────────────────────────────────── */
  useEffect(() => {
    if (!focusReport || !mapInstanceRef.current) return;
    if (focusReport.lat == null || focusReport.lng == null) return;
    mapInstanceRef.current.flyTo(
      [focusReport.lat, focusReport.lng],
      16,
      { animate: true, duration: 0.9, easeLinearity: 0.25 },
    );
  }, [focusReport]);

  /* ── Add markers + highlight circles ─────────────────────────────────────── */
  function addMarkers(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    L: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    map: any,
    data: ApiReport[],
    onClick?: (r: ApiReport) => void,
    activeId?: string | null,
  ) {
    data.forEach((report) => {
      // Use priorityLabel from backend (AI-enriched)
      const color      = PRIORITY_COLORS[report.priorityLabel] ?? '#6E6E73';
      // Skip reports without coordinates
      if (report.lat == null || report.lng == null) return;
      const isSelected = report.id === activeId;

      /* Highlight circle for selected marker */
      if (isSelected) {
        const circle = L.circle([report.lat, report.lng], {
          radius: 120,
          color,
          fillColor: color,
          fillOpacity: 0.08,
          weight: 1.5,
          opacity: 0.35,
          dashArray: '4 4',
        }).addTo(map);
        circlesRef.current.push(circle);
      }

      const icon = L.divIcon({
        html:      buildSvgIcon(color, isSelected),
        className: '',
        iconSize:  isSelected ? [42, 52] : [34, 42],
        iconAnchor: isSelected ? [21, 52] : [17, 42],
        popupAnchor: [0, -46],
      });

      const marker = L.marker([report.lat, report.lng], { icon }).addTo(map);

      /* Hover tooltip */
      marker.bindTooltip(report.title, {
        permanent:  false,
        direction:  'top',
        offset:     [0, -46],
        className:  'aegisops-tooltip',
      });

      /* Click popup */
      marker.bindPopup(buildPopupHtml(report, color), {
        maxWidth:  290,
        className: 'aegisops-popup',
      });

      marker.on('click', () => {
        onClick?.(report);
        map.flyTo([report.lat, report.lng], Math.max(map.getZoom(), 15), {
          animate: true,
          duration: 0.65,
          easeLinearity: 0.3,
        });
      });

      markersRef.current.set(report.id, marker);
    });
  }

  /* ── Loading state ────────────────────────────────────────────────────────── */
  if (!isClient) {
    return (
      <div className="w-full h-full bg-surface rounded-2xl flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-text-secondary">Memuat peta...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      className="w-full h-full rounded-2xl overflow-hidden"
      style={{ minHeight: 400 }}
    />
  );
}
