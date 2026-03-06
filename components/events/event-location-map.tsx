"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { MapPin, Navigation } from "lucide-react"
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
  const [tileMode, setTileMode] = useState<"street" | "satellite">("street")

  useEffect(() => {
    configureLeafletDefaultIcon()
  }, [])

  const zoom = normalizeMapZoom(mapZoom)
  const externalMapUrl = buildOpenStreetMapPlaceUrl(latitude, longitude, zoom)
  const googleDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
  const tileUrl =
    tileMode === "satellite"
      ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

  const tileAttribution =
    tileMode === "satellite"
      ? 'Tiles &copy; Esri'
      : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

  const markerIcon = useMemo(
    () =>
      L.divIcon({
        className: "",
        html: `
          <span style="position:relative;display:inline-flex;height:30px;width:22px;align-items:flex-start;justify-content:center;">
            <span style="position:absolute;left:50%;top:0;height:22px;width:22px;transform:translateX(-50%);border-radius:9999px;background:#1e3a2f;box-shadow:0 2px 6px rgba(0,0,0,0.28);"></span>
            <span style="position:absolute;left:50%;top:6px;height:10px;width:10px;transform:translateX(-50%);border-radius:9999px;background:#ffffff;"></span>
            <span style="position:absolute;left:50%;top:18px;height:12px;width:12px;transform:translateX(-50%) rotate(45deg);background:#1e3a2f;"></span>
          </span>
        `,
        iconSize: [22, 30],
        iconAnchor: [11, 30],
        popupAnchor: [0, -26],
        tooltipAnchor: [0, -26],
      }),
    [],
  )

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-lg border border-border">
        <MapContainer center={[latitude, longitude]} zoom={zoom} className="h-[400px] w-full" scrollWheelZoom={false}>
          <TileLayer
            attribution={tileAttribution}
            url={tileUrl}
          />
          <Marker position={[latitude, longitude]} icon={markerIcon}>
            <Tooltip permanent direction="top" offset={[0, -16]}>
              {title}
            </Tooltip>
            <Popup>
              <p className="font-semibold">{title}</p>
              <p>{location}</p>
            </Popup>
          </Marker>
        </MapContainer>

        <div className="absolute right-3 top-3 z-[500] inline-flex items-center rounded-full border border-border bg-card/95 p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setTileMode("street")}
            className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-colors ${
              tileMode === "street" ? "bg-tsa-green-deep text-primary-foreground" : "text-foreground hover:bg-secondary"
            }`}
          >
            Street
          </button>
          <button
            type="button"
            onClick={() => setTileMode("satellite")}
            className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-colors ${
              tileMode === "satellite" ? "bg-tsa-green-deep text-primary-foreground" : "text-foreground hover:bg-secondary"
            }`}
          >
            Satellite
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href={googleDirectionsUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-tsa-green-deep hover:bg-secondary"
        >
          <Navigation className="h-3.5 w-3.5" />
          Get Directions (Google Maps)
        </Link>
        <Link
          href={externalMapUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-tsa-green-deep hover:bg-secondary"
        >
          <MapPin className="h-3.5 w-3.5" />
          View on OpenStreetMap
        </Link>
      </div>
    </div>
  )
}
