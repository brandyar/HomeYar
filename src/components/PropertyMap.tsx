import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Property } from '../types/directus';
import {
  formatTomanReadable,
  toPersianDigits,
  getTransactionTypeLabel,
} from '../lib/utils';
import { getAssetUrl } from '../lib/directus';
import { Maximize2, LocateFixed, Eye } from 'lucide-react';

interface PropertyMapProps {
  properties: Property[];
  selectedPropertyId: number | null;
  onSelectProperty: (property: Property) => void;
  onOpenDetails: (property: Property) => void;
  // Optional pin-picking mode for Add Property form
  pickMode?: boolean;
  pickedPosition?: { lat: number; lng: number } | null;
  onPickPosition?: (lat: number, lng: number) => void;
  heightClass?: string;
}

export const PropertyMap: React.FC<PropertyMapProps> = ({
  properties,
  selectedPropertyId,
  onSelectProperty,
  onOpenDetails,
  pickMode = false,
  pickedPosition = null,
  onPickPosition,
  heightClass = 'h-full',
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const pickerMarkerRef = useRef<L.Marker | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Default center: Rasht City center
    const defaultCenter: [number, number] = [37.2809, 49.5832];
    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: 13,
      zoomControl: false,
    });

    // Add standard zoom control at bottom-left for RTL compatibility
    L.control.zoom({ position: 'bottomleft' }).addTo(map);

    // High performance OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    // If in pick mode, handle map clicks
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (pickMode && onPickPosition) {
        onPickPosition(Number(e.latlng.lat.toFixed(5)), Number(e.latlng.lng.toFixed(5)));
      }
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [pickMode, onPickPosition]);

  // Handle picked position marker (in Add Property form)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !pickMode) return;

    if (pickerMarkerRef.current) {
      pickerMarkerRef.current.remove();
      pickerMarkerRef.current = null;
    }

    if (pickedPosition && pickedPosition.lat && pickedPosition.lng) {
      const pinIcon = L.divIcon({
        className: 'custom-picker-pin',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg border-2 border-white animate-bounce">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <div class="absolute -bottom-1 w-2.5 h-1 bg-black/30 rounded-full blur-[1px]"></div>
          </div>
        `,
        iconSize: [32, 38],
        iconAnchor: [16, 38],
      });

      const marker = L.marker([pickedPosition.lat, pickedPosition.lng], { icon: pinIcon }).addTo(map);
      pickerMarkerRef.current = marker;
      map.panTo([pickedPosition.lat, pickedPosition.lng]);
    }
  }, [pickMode, pickedPosition]);

  // Render Property Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer || pickMode) return;

    markersLayer.clearLayers();

    const validProperties = properties.filter((p) => p.latitude && p.longitude);

    validProperties.forEach((prop) => {
      const isSelected = prop.id === selectedPropertyId;
      const lat = Number(prop.latitude);
      const lng = Number(prop.longitude);

      // Short price tag for marker
      let shortPrice = 'توافقی';
      if (prop.transaction_type === 'rent') {
        const deposit = prop.price ? `${Math.round(prop.price / 1000000)}م` : '۰';
        const rent = prop.rent_price ? `${Math.round(prop.rent_price / 1000000)}م اجاره` : '';
        shortPrice = `${deposit} + ${rent}`;
      } else if (prop.price) {
        if (prop.price >= 1000000000) {
          shortPrice = `${(prop.price / 1000000000).toFixed(1).replace('.0', '')} م`;
        } else {
          shortPrice = `${Math.round(prop.price / 1000000)} م`;
        }
      }

      const markerHtml = `
        <div class="custom-price-marker ${isSelected ? 'active ring-4 ring-emerald-400/40' : ''}" dir="rtl">
          <span class="text-[11px] font-black">${toPersianDigits(shortPrice)}</span>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker-wrapper',
        html: markerHtml,
        iconSize: [80, 28],
        iconAnchor: [40, 14],
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      // Rich popup content
      const imageSrc = getAssetUrl(prop.featured_image);
      const transLabel = getTransactionTypeLabel(prop.transaction_type);
      const popupHtml = `
        <div class="w-64 p-0 text-slate-800 text-right font-['Vazirmatn']" dir="rtl">
          <div class="relative h-32 w-full overflow-hidden rounded-t-xl bg-slate-200">
            <img src="${imageSrc}" alt="${prop.title}" class="w-full h-full object-cover" />
            <div class="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">
              ${transLabel}
            </div>
            <div class="absolute bottom-2 left-2 bg-black/60 text-white text-[11px] font-medium px-2 py-0.5 rounded-md backdrop-blur-xs">
              ${toPersianDigits(prop.area)} متر
            </div>
          </div>
          <div class="p-3">
            <h4 class="font-bold text-xs text-slate-900 line-clamp-1 mb-1 leading-snug">${prop.title}</h4>
            <p class="text-[11px] text-slate-500 line-clamp-1 mb-2">${prop.address_detail || 'رشت'}</p>
            <div class="flex items-center justify-between pt-2 border-t border-slate-100">
              <span class="text-xs font-black text-emerald-700">${formatTomanReadable(prop.price)}</span>
              <button id="view-prop-btn-${prop.id}" class="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1 rounded-lg transition-colors cursor-pointer">
                مشاهده
              </button>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        closeButton: true,
        maxWidth: 280,
      });

      marker.on('popupopen', () => {
        onSelectProperty(prop);
        const btn = document.getElementById(`view-prop-btn-${prop.id}`);
        if (btn) {
          btn.onclick = (e) => {
            e.stopPropagation();
            onOpenDetails(prop);
          };
        }
      });

      marker.on('click', () => {
        onSelectProperty(prop);
      });

      marker.addTo(markersLayer);
    });
  }, [properties, selectedPropertyId, pickMode, onSelectProperty, onOpenDetails]);

  // Center on selected property when selected from grid/list
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedPropertyId) return;

    const prop = properties.find((p) => p.id === selectedPropertyId);
    if (prop && prop.latitude && prop.longitude) {
      map.flyTo([Number(prop.latitude), Number(prop.longitude)], 15, {
        duration: 0.8,
      });
    }
  }, [selectedPropertyId, properties]);

  const handleFitAll = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const valid = properties.filter((p) => p.latitude && p.longitude);
    if (valid.length === 0) return;
    const bounds = L.latLngBounds(valid.map((p) => [Number(p.latitude), Number(p.longitude)]));
    map.fitBounds(bounds, { padding: [50, 50] });
  };

  const handleCenterRasht = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.flyTo([37.2809, 49.5832], 13);
  };

  return (
    <div className={`relative w-full ${heightClass} overflow-hidden rounded-2xl bg-slate-100 shadow-inner border border-slate-200`}>
      {/* Leaflet container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating map controls */}
      {!pickMode && (
        <div className="absolute top-4 left-4 z-[400] flex flex-col gap-2">
          <button
            onClick={handleFitAll}
            title="نمایش تمام املاک"
            className="p-2.5 rounded-xl bg-white/95 text-slate-700 hover:text-emerald-700 hover:bg-white shadow-md border border-slate-200 backdrop-blur-xs transition-all cursor-pointer"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleCenterRasht}
            title="مرکز شهر رشت"
            className="p-2.5 rounded-xl bg-white/95 text-slate-700 hover:text-emerald-700 hover:bg-white shadow-md border border-slate-200 backdrop-blur-xs transition-all cursor-pointer"
          >
            <LocateFixed className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Pin picking instruction pill */}
      {pickMode && (
        <div className="absolute top-3 inset-x-4 z-[400] pointer-events-none flex justify-center">
          <div className="bg-slate-900/90 text-white text-xs font-medium px-4 py-2 rounded-full shadow-lg backdrop-blur-md flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>روی نقشه کلیک کنید تا موقعیت جغرافیایی ملک ثبت شود</span>
          </div>
        </div>
      )}
    </div>
  );
};
