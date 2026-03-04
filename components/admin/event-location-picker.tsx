"use client"

import { useEffect } from "react"
import L, { type DragEndEvent } from "leaflet"
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet"
import { EVENT_MAP_DEFAULT_ZOOM, KIBAHA_DEFAULT_COORDINATES, normalizeMapZoom } from "@/lib/maps"

let leafletIconConfigured = false

function configureLeafletDefaultIcon() {
  if (leafletIconConfigured) {
    return
  }

  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  })

  leafletIconConfigured = true
}

function MapInteractionHandlers({
  onSelectLocation,
  onZoomChange,
}: {
  onSelectLocation: (latitude: number, longitude: number) => void
  onZoomChange: (zoom: number) => void
}) {
  const map = useMapEvents({
    click(event) {
      onSelectLocation(event.latlng.lat, event.latlng.lng)
    },
    zoomend() {
      onZoomChange(map.getZoom())
    },
  })

  return null
}

function MapViewportSync({
  latitude,
  longitude,
  zoom,
}: {
  latitude: number
  longitude: number
  zoom: number
}) {
  const map = useMap()

  useEffect(() => {
    const currentCenter = map.getCenter()
    const currentZoom = map.getZoom()
    const needsUpdate =
      Math.abs(currentCenter.lat - latitude) > 0.000001 ||
      Math.abs(currentCenter.lng - longitude) > 0.000001 ||
      currentZoom !== zoom

    if (needsUpdate) {
      map.setView([latitude, longitude], zoom, { animate: true })
    }
  }, [map, latitude, longitude, zoom])

  return null
}

type EventLocationPickerProps = {
  latitude: number | null
  longitude: number | null
  zoom?: number
  eventTitle: string
  locationName: string
  onSelectLocation: (latitude: number, longitude: number) => void
  onZoomChange: (zoom: number) => void
}

export function EventLocationPicker({
  latitude,
  longitude,
  zoom = EVENT_MAP_DEFAULT_ZOOM,
  eventTitle,
  locationName,
  onSelectLocation,
  onZoomChange,
}: EventLocationPickerProps) {
  useEffect(() => {
    configureLeafletDefaultIcon()
  }, [])

  const hasSelectedPoint = typeof latitude === "number" && typeof longitude === "number"
  const centerLatitude = hasSelectedPoint ? (latitude as number) : KIBAHA_DEFAULT_COORDINATES.latitude
  const centerLongitude = hasSelectedPoint ? (longitude as number) : KIBAHA_DEFAULT_COORDINATES.longitude
  const normalizedZoom = normalizeMapZoom(zoom)

  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-md border border-border">
        <MapContainer
          center={[centerLatitude, centerLongitude]}
          zoom={normalizedZoom}
          className="h-[320px] w-full"
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapInteractionHandlers onSelectLocation={onSelectLocation} onZoomChange={onZoomChange} />
          <MapViewportSync latitude={centerLatitude} longitude={centerLongitude} zoom={normalizedZoom} />

          {hasSelectedPoint ? (
            <Marker
              position={[latitude as number, longitude as number]}
              draggable
              eventHandlers={{
                dragend(event) {
                  const dragEvent = event as DragEndEvent
                  const marker = dragEvent.target as L.Marker
                  const next = marker.getLatLng()
                  onSelectLocation(next.lat, next.lng)
                },
              }}
            >
              <Popup>
                <p className="font-semibold">{eventTitle || "Event location"}</p>
                <p>{locationName || "Selected event point"}</p>
              </Popup>
            </Marker>
          ) : null}
        </MapContainer>
      </div>

      <p className="text-xs text-muted-foreground">
        Click on the map to set the exact event point. You can also drag the marker for precise adjustment.
      </p>
    </div>
  )
}
