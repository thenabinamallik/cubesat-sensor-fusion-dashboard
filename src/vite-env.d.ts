
/// <reference types="vite/client" />

interface LeafletMap {
  setView: (center: [number, number], zoom: number) => any;
  remove: () => void;
  removeLayer: (layer: any) => void;
}

interface LeafletStatic {
  map: (element: HTMLElement) => LeafletMap;
  tileLayer: (urlTemplate: string, options?: any) => any;
  marker: (latlng: [number, number]) => any;
}

interface Window {
  L?: LeafletStatic;
}
