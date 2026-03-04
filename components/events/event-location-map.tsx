"use client"

import { useEffect } from "react"
import Link from "next/link"
import L from "leaflet"
import { MapContainer, Marker, Popup, TileLayer, Tooltip } from "react-leaflet"
import { buildOpenStreetMapPlaceUrl, normalizeMapZoom } from "@/lib/maps"

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

type EventLocationMapProps = {
  latitude: number
  longitude: number
  mapZoom?: number
  title: string
  location: string
}

export function EventLocationMap({ latitude, longitude, mapZoom, title, location }: EventLocationMapProps) {
  useEffect(() => {
    configureLeafletDefaultIcon()
  }, [])

  const zoom = normalizeMapZoom(mapZoom)
  const externalMapUrl = buildOpenStreetMapPlaceUrl(latitude, longitude, zoom)

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-lg border border-border">
        <MapContainer center={[latitude, longitude]} zoom={zoom} className="h-[320px] w-full" scrollWheelZoom>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[latitude, longitude]}>
            <Tooltip permanent direction="top" offset={[0, -16]}>
              {title}
            </Tooltip>
            <Popup>
              <p className="font-semibold">{title}</p>
              <p>{location}</p>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      <Link
        href={externalMapUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex text-xs font-semibold text-tsa-green-deep hover:text-tsa-green-mid"
      >
        Open this location in OpenStreetMap
      </Link>
    </div>
  )
}
