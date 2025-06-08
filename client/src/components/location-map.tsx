import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationMapProps {
  address: string;
  className?: string;
}

interface Coordinates {
  lat: number;
  lng: number;
}

export default function LocationMap({ address, className = "" }: LocationMapProps) {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!address) return;

    const geocodeAddress = async () => {
      setIsLoading(true);
      try {
        // Use OpenStreetMap Nominatim for geocoding (free service)
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
        );
        const data = await response.json();
        
        if (data && data.length > 0) {
          setCoordinates({
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon)
          });
        } else {
          // Fallback coordinates for common locations
          const addressLower = address.toLowerCase();
          if (addressLower.includes('washington') || addressLower.includes('dc')) {
            setCoordinates({ lat: 38.8951, lng: -77.0364 });
          } else if (addressLower.includes('san francisco')) {
            setCoordinates({ lat: 37.7749, lng: -122.4194 });
          } else if (addressLower.includes('new york')) {
            setCoordinates({ lat: 40.7128, lng: -74.0060 });
          } else if (addressLower.includes('austin')) {
            setCoordinates({ lat: 30.2672, lng: -97.7431 });
          }
        }
      } catch (error) {
        console.error('Geocoding error:', error);
        // Default to Washington DC on error
        setCoordinates({ lat: 38.8951, lng: -77.0364 });
      } finally {
        setIsLoading(false);
      }
    };

    geocodeAddress();
  }, [address]);

  if (isLoading) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-gray-500">Loading map...</div>
      </div>
    );
  }

  if (!coordinates) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-gray-500">Enter an address to view location</div>
      </div>
    );
  }

  return (
    <div className={className}>
      <MapContainer
        center={[coordinates.lat, coordinates.lng]}
        zoom={13}
        style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[coordinates.lat, coordinates.lng]}>
          <Popup>
            <div className="text-center">
              <strong>{address}</strong>
              <br />
              Your search location
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}