
import { useEffect, useRef, useState } from "react";
import { Compass } from "lucide-react";
import { Location } from "@/types/sensorData";

interface SatelliteLocationProps {
  location: Location | null;
}

const SatelliteLocation = ({ location }: SatelliteLocationProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || map) return;

    try {
      // Check if Leaflet is available (we'll need to load it via CDN)
      if (!window.L) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
        
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = initializeMap;
        script.onerror = () => setMapError("Failed to load map library");
        document.head.appendChild(script);
      } else {
        initializeMap();
      }
    } catch (error) {
      console.error("Error initializing map:", error);
      setMapError("Failed to initialize map");
    }

    function initializeMap() {
      if (!window.L || !mapRef.current) return;
      
      // Default center (0, 0)
      const initialMap = window.L.map(mapRef.current).setView([0, 0], 2);
      
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(initialMap);
      
      setMap(initialMap);
    }

    // Cleanup
    return () => {
      if (map) {
        map.remove();
      }
    };
  }, []);

  // Update marker position when location changes
  useEffect(() => {
    if (!map || !location) return;
    
    const L = window.L;
    if (!L) return;

    // Remove existing marker
    if (marker) {
      map.removeLayer(marker);
    }

    // Only add marker if we have valid coordinates
    if (location.lat !== 0 || location.lon !== 0) {
      const newMarker = L.marker([location.lat, location.lon]).addTo(map);
      map.setView([location.lat, location.lon], 13);
      setMarker(newMarker);
    }
  }, [map, location]);

  return (
    <div className="relative w-full h-full">
      {mapError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/20 rounded-md">
          <Compass className="h-12 w-12 text-muted-foreground mb-2" />
          <p className="text-muted-foreground">{mapError}</p>
        </div>
      ) : (
        <div 
          ref={mapRef} 
          className="w-full h-full rounded-md overflow-hidden"
        />
      )}
      
      {!location || (location.lat === 0 && location.lon === 0) ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/20 rounded-md">
          <Compass className="h-12 w-12 text-muted-foreground mb-2" />
          <p className="text-muted-foreground">GPS data not available</p>
        </div>
      ) : null}
    </div>
  );
};

export default SatelliteLocation;
