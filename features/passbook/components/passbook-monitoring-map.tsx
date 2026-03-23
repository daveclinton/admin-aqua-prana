"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Expand, Shrink } from "lucide-react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { PassbookMonitoringSummary } from "@/features/passbook/api"

type MapPoint = PassbookMonitoringSummary["map_points"][number]

const BAND_STYLES: Record<string, { color: string; badge: "default" | "outline" | "destructive" }> = {
  excellent: { color: "#1f9d55", badge: "default" },
  good: { color: "#14b8a6", badge: "default" },
  fair: { color: "#f59e0b", badge: "outline" },
  poor: { color: "#f97316", badge: "destructive" },
  critical: { color: "#ef4444", badge: "destructive" },
  unknown: { color: "#64748b", badge: "outline" },
}

export function PassbookMonitoringMap({
  points,
}: {
  points: PassbookMonitoringSummary["map_points"]
}) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

  const validPoints = useMemo(
    () =>
      points.filter(
        (point) =>
          Number.isFinite(point.latitude) &&
          Number.isFinite(point.longitude)
      ),
    [points]
  )

  if (!token) {
    return (
      <MapFallback
        title="Map token missing"
        description="Set NEXT_PUBLIC_MAPBOX_TOKEN to render pond locations."
      />
    )
  }

  if (validPoints.length === 0) {
    return (
      <MapFallback
        title="No mapped ponds yet"
        description="Ponds need latitude and longitude before they can appear on the map."
      />
    )
  }

  return (
    <div className="space-y-3">
      <MapHeader
        mappedCount={validPoints.length}
        isFullscreen={isFullscreen}
        onToggleFullscreen={() => setIsFullscreen((current) => !current)}
      />
      <MapCanvas
        token={token}
        points={validPoints}
        className="h-[420px] overflow-hidden rounded-2xl border"
      />
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-background/95 p-4 backdrop-blur-sm">
          <div className="mx-auto flex h-full max-w-7xl flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Mapped Pond Hotspots</h3>
                <p className="text-sm text-muted-foreground">
                  Explore pond locations, score bands, and unresolved alerts.
                </p>
              </div>
              <Button type="button" variant="outline" onClick={() => setIsFullscreen(false)}>
                <Shrink className="mr-2 size-4" />
                Exit full screen
              </Button>
            </div>
            <MapCanvas
              token={token}
              points={validPoints}
              className="min-h-0 flex-1 overflow-hidden rounded-2xl border"
            />
            <MapFooter mappedCount={validPoints.length} />
          </div>
        </div>
      )}
      <MapFooter mappedCount={validPoints.length} />
    </div>
  )
}

function MapHeader({
  mappedCount,
  isFullscreen,
  onToggleFullscreen,
}: {
  mappedCount: number
  isFullscreen: boolean
  onToggleFullscreen: () => void
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap gap-2">
        {(["excellent", "good", "fair", "poor", "critical"] as const).map((band) => (
          <div key={band} className="inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs">
            <span
              className="size-2.5 rounded-full"
              style={{ backgroundColor: BAND_STYLES[band].color }}
            />
            <span className="capitalize">{band}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline">{mappedCount} mapped ponds</Badge>
        <Button type="button" variant="outline" size="sm" onClick={onToggleFullscreen}>
          <Expand className="mr-2 size-4" />
          {isFullscreen ? "Expanded" : "Full screen"}
        </Button>
      </div>
    </div>
  )
}

function MapFooter({ mappedCount }: { mappedCount: number }) {
  return (
    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
      <Badge variant="outline">{mappedCount} mapped ponds</Badge>
      <span>Click a marker to inspect pond score and alert counts.</span>
    </div>
  )
}

function MapCanvas({
  token,
  points,
  className,
}: {
  token: string
  points: MapPoint[]
  className: string
}) {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const mapInstanceRef = useRef<mapboxgl.Map | null>(null)

  useEffect(() => {
    if (!token || !mapRef.current || points.length === 0) return

    mapboxgl.accessToken = token

    const map = new mapboxgl.Map({
      container: mapRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      attributionControl: false,
    })

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right")
    map.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-right")

    const bounds = new mapboxgl.LngLatBounds()

    points.forEach((point) => {
      bounds.extend([point.longitude, point.latitude])

      const marker = document.createElement("button")
      marker.type = "button"
      marker.className = "flex size-5 items-center justify-center rounded-full border-2 border-white shadow-md"
      marker.style.backgroundColor = BAND_STYLES[point.band]?.color ?? BAND_STYLES.unknown.color
      marker.setAttribute("aria-label", point.name)

      const popupHtml = `
        <div style="min-width: 180px; font-family: inherit;">
          <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">${escapeHtml(point.name)}</div>
          <div style="font-size: 12px; color: #64748b; margin-bottom: 8px;">${escapeHtml(point.region)}</div>
          <div style="font-size: 12px; margin-bottom: 4px;">Score: ${point.overall ?? "N/A"}</div>
          <div style="font-size: 12px; margin-bottom: 4px;">Alerts: ${point.active_alerts}</div>
          <div style="font-size: 12px;">Critical alerts: ${point.critical_alerts}</div>
        </div>
      `

      new mapboxgl.Marker(marker)
        .setLngLat([point.longitude, point.latitude])
        .setPopup(new mapboxgl.Popup({ offset: 18 }).setHTML(popupHtml))
        .addTo(map)
    })

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, { padding: 48, maxZoom: 7 })
    }

    mapInstanceRef.current = map

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [token, points])

  return <div ref={mapRef} className={className} />
}

function MapFallback({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="flex h-[420px] items-center justify-center rounded-2xl border border-dashed bg-muted/10 p-6 text-center">
      <div className="space-y-2">
        <p className="text-sm font-medium">{title}</p>
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}
