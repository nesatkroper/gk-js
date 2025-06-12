"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { GoogleMap, LoadScript, Marker, InfoWindow } from "@react-google-maps/api"
import { MapPin, Navigation, Search, Layers } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

const mapContainerStyle = {
  width: "100%",
  height: "600px",
  borderRadius: "12px",
}

const center = {
  lat: 40.7128,
  lng: -74.006,
}

// Custom map styles for a modern look
const mapStyles = [
  {
    featureType: "all",
    elementType: "geometry.fill",
    stylers: [{ weight: "2.00" }],
  },
  {
    featureType: "all",
    elementType: "geometry.stroke",
    stylers: [{ color: "#9c9c9c" }],
  },
  {
    featureType: "all",
    elementType: "labels.text",
    stylers: [{ visibility: "on" }],
  },
  {
    featureType: "landscape",
    elementType: "all",
    stylers: [{ color: "#f2f2f2" }],
  },
  {
    featureType: "landscape",
    elementType: "geometry.fill",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "landscape.man_made",
    elementType: "geometry.fill",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "poi",
    elementType: "all",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "road",
    elementType: "all",
    stylers: [{ saturation: -100 }, { lightness: 45 }],
  },
  {
    featureType: "road",
    elementType: "geometry.fill",
    stylers: [{ color: "#eeeeee" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#7b7b7b" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "road.highway",
    elementType: "all",
    stylers: [{ visibility: "simplified" }],
  },
  {
    featureType: "road.arterial",
    elementType: "labels.icon",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "transit",
    elementType: "all",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "water",
    elementType: "all",
    stylers: [{ color: "#46bcec" }, { visibility: "on" }],
  },
  {
    featureType: "water",
    elementType: "geometry.fill",
    stylers: [{ color: "#c8d7d4" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#070707" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#ffffff" }],
  },
]

const locations = [
  {
    id: 1,
    name: "Central Park",
    position: { lat: 40.7829, lng: -73.9654 },
    type: "Park",
    description: "A large public park in Manhattan",
  },
  {
    id: 2,
    name: "Times Square",
    position: { lat: 40.758, lng: -73.9855 },
    type: "Landmark",
    description: "Famous commercial intersection",
  },
]

export default function MapComponent() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const [map, setMap] = useState(null)
  const [selectedMarker, setSelectedMarker] = useState(null)
  const [searchValue, setSearchValue] = useState("")
  const [mapType, setMapType] = useState("roadmap")
  const mapRef = useRef(null)

  const onLoad = useCallback((map) => {
    setMap(map)
  }, [])

  const onUnmount = useCallback(() => {
    setMap(null)
  }, [])

  const handleSearch = () => {
    if (!map || !searchValue || !isClient || !window.google) return

    const geocoder = new window.google.maps.Geocoder()
    geocoder.geocode({ address: searchValue }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        const location = results[0].geometry.location
        map.panTo(location)
        map.setZoom(15)
      }
    })
  }

  const getCurrentLocation = () => {
    if (!map) return

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          map.panTo(pos)
          map.setZoom(15)
        },
        () => {
          console.error("Error: The Geolocation service failed.")
        },
      )
    }
  }

  const toggleMapType = () => {
    setMapType((prev) => (prev === "roadmap" ? "satellite" : "roadmap"))
  }

  const createCustomMarkerIcon = () => {
    if (!isClient || !window.google) return undefined

    return {
      url:
        "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(`
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="12" fill="#3B82F6" stroke="white" strokeWidth="3"/>
            <circle cx="16" cy="16" r="4" fill="white"/>
          </svg>
        `),
      scaledSize: new window.google.maps.Size(32, 32),
    }
  }

  return (
    <div className="space-y-6">
      {/* Map Controls */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Map Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Search for a location..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} size="icon" variant="outline">
                <Search className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button onClick={getCurrentLocation} variant="outline" size="sm" className="flex items-center gap-2">
                <Navigation className="w-4 h-4" />
                My Location
              </Button>
              <Button onClick={toggleMapType} variant="outline" size="sm" className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                {mapType === "roadmap" ? "Satellite" : "Road"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map Container */}
      <Card className="shadow-2xl border-0 overflow-hidden">
        <CardContent className="p-0">
          {!isClient ? (
            <div className="w-full h-[600px] flex items-center justify-center bg-gray-100 rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading map...</p>
              </div>
            </div>
          ) : (
            <LoadScript googleMapsApiKey="AIzaSyCPvqufzr4XJBYjtsMKiKdK6kgC2dCwnmI">
              <GoogleMap
                ref={mapRef}
                mapContainerStyle={mapContainerStyle}
                center={center}
                zoom={12}
                onLoad={onLoad}
                onUnmount={onUnmount}
                options={{
                  styles: mapStyles,
                  mapTypeId: mapType,
                  disableDefaultUI: false,
                  zoomControl: true,
                  streetViewControl: true,
                  fullscreenControl: true,
                  mapTypeControl: false,
                }}
              >
                {locations.map((location) => (
                  <Marker
                    key={location.id}
                    position={location.position}
                    onClick={() => setSelectedMarker(location)}
                    icon={createCustomMarkerIcon()}
                  />
                ))}

                {selectedMarker && (
                  <InfoWindow position={selectedMarker.position} onCloseClick={() => setSelectedMarker(null)}>
                    <div className="p-2 max-w-xs">
                      <h3 className="font-semibold text-lg mb-1">{selectedMarker.name}</h3>
                      <Badge variant="secondary" className="mb-2">
                        {selectedMarker.type}
                      </Badge>
                      <p className="text-sm text-gray-600">{selectedMarker.description}</p>
                    </div>
                  </InfoWindow>
                )}
              </GoogleMap>
            </LoadScript>
          )}
        </CardContent>
      </Card>

      {/* Location List */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Popular Locations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {locations.map((location) => (
              <div
                key={location.id}
                className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                onClick={() => {
                  if (map) {
                    map.panTo(location.position)
                    map.setZoom(15)
                    setSelectedMarker(location)
                  }
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium">{location.name}</h4>
                  <Badge variant="outline" className="text-xs">
                    {location.type}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{location.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

