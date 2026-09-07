import React, { useEffect, useRef } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl/maplibre';
import type { MapRef, ViewState } from 'react-map-gl/maplibre';
import type { Map as MapLibreMap, StyleSpecification } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Pin } from './Pin';
import { Loc, MapBounds } from '..';
import './Maps.css';

export const OPEN_FREE_MAP_STYLES = {
  standard: 'https://tiles.openfreemap.org/styles/liberty',
  silver: 'https://tiles.openfreemap.org/styles/positron',
  dark: 'https://tiles.openfreemap.org/styles/dark',
} as const;

export type MapStyle = string | StyleSpecification;

export const MapItem: React.FC<
  React.PropsWithChildren<{ lat: number; lng: number }>
> = ({ children, lat, lng }) => (
  <Marker latitude={lat} longitude={lng} anchor="center">
    <div className="map-item">{children}</div>
  </Marker>
);

export interface MapsProps {
  children?: React.ReactNode;
  center?: Loc;
  zoom?: number;
  defaultCenter?: Loc;
  defaultZoom?: number;
  mapStyle?: MapStyle;
  centerPin?: JSX.Element | null;
  showZoomControls?: boolean;
  onChange?: (center: Loc, bounds: MapBounds, zoom: number) => void;
}

const DEFAULT_CENTER: Loc = { latitude: 42.69, longitude: 23.32 };
const DEFAULT_ZOOM = 18;

const createViewState = (center: Loc, zoom: number): ViewState => ({
  latitude: center.latitude,
  longitude: center.longitude,
  zoom,
  bearing: 0,
  pitch: 0,
  padding: { top: 0, bottom: 0, left: 0, right: 0 },
});

export const Maps: React.FC<MapsProps> = ({
  children,
  center,
  zoom,
  defaultCenter = DEFAULT_CENTER,
  defaultZoom = DEFAULT_ZOOM,
  mapStyle = OPEN_FREE_MAP_STYLES.standard,
  centerPin = <Pin />,
  showZoomControls = true,
  onChange,
}) => {
  const mapRef = useRef<MapRef | null>(null);
  const initialViewState = useRef(
    createViewState(center || defaultCenter, zoom ?? defaultZoom)
  );

  useEffect(() => {
    const map = mapRef.current;
    if (!map || (!center && zoom === undefined)) return;

    const currentCenter = map.getCenter();
    const nextLongitude = center?.longitude ?? currentCenter.lng;
    const nextLatitude = center?.latitude ?? currentCenter.lat;
    const nextZoom = zoom ?? map.getZoom();
    if (
      nextLongitude === currentCenter.lng &&
      nextLatitude === currentCenter.lat &&
      nextZoom === map.getZoom()
    ) {
      return;
    }

    map.jumpTo({
      center: [nextLongitude, nextLatitude],
      zoom: nextZoom,
    });
  }, [center?.latitude, center?.longitude, zoom]);

  const reportMapPosition = (map: MapLibreMap) => {
    const mapCenter = map.getCenter();
    const bounds = map.getBounds();
    onChange?.(
      { latitude: mapCenter.lat, longitude: mapCenter.lng },
      {
        minLat: bounds.getSouth(),
        maxLat: bounds.getNorth(),
        minLng: bounds.getWest(),
        maxLng: bounds.getEast(),
      },
      map.getZoom()
    );
  };

  return (
    <>
      <div id="center-pin">{centerPin}</div>
      <Map
        ref={mapRef}
        initialViewState={initialViewState.current}
        mapStyle={mapStyle}
        style={{ width: '100%', height: '100%' }}
        onLoad={(event) => reportMapPosition(event.target)}
        onMoveEnd={(event) => reportMapPosition(event.target)}
      >
        <NavigationControl
          position="top-right"
          showCompass
          showZoom={showZoomControls}
        />
        {children}
      </Map>
    </>
  );
};
