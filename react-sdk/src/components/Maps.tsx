import React, { useMemo } from 'react';
import GoogleMapReact, { MapTypeStyle, Coords } from 'google-map-react';
import { Pin } from './Pin';
import { Loc, MapBounds } from '..';
import './Maps.css';

export const MapItem: React.FC<{ lat: number; lng: number }> = ({
  children,
}) => <>{children}</>;

const getProps = (
  customStyles?: MapTypeStyle[],
  showZoomControls?: boolean
) => {
  let defaultStyles: any = [
    {
      // disables poi
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
  ];
  const options = {
    overviewMapControl: true,
    streetViewControl: false,
    rotateControl: true,
    mapTypeControl: false,
    zoomControl: showZoomControls,
    styles: customStyles || defaultStyles,
  };
  return {
    defaultCenter: { lat: 42.69, lng: 23.32 },
    defaultZoom: 18,
    defaultOptions: options,
    options,
  };
};

export interface MapsProps {
  center?: Loc;
  zoom?: number;
  styles?: MapTypeStyle[];
  centerPin?: JSX.Element | null;
  showZoomControls?: boolean;
  mapApiKey?: string;
  onChange?: (center: Loc, bounds: MapBounds, zoom: number) => void;
}

const coord2loc = (c: Coords): Loc => ({ latitude: c.lat, longitude: c.lng });

export const Maps: React.FC<MapsProps> = ({
  children,
  center,
  zoom,
  centerPin = <Pin />,
  styles,
  showZoomControls,
  mapApiKey,
  onChange,
}) => {
  const centerCoords = useMemo(
    () =>
      center ? { lat: center.latitude, lng: center.longitude } : undefined,
    [center]
  );
  const props = useMemo(() => getProps(styles, showZoomControls), [
    styles,
    showZoomControls,
  ]);
  return (
    <>
      <div id="center-pin">{centerPin}</div>
      <GoogleMapReact
        {...props}
        bootstrapURLKeys={{ key: mapApiKey || '' }}
        center={centerCoords}
        zoom={zoom}
        onChange={(props) => {
          const {
            center,
            bounds: { sw, ne },
            zoom,
          } = props;
          console.debug('GoogleMaps onChange', props);
          onChange?.(
            coord2loc(center),
            { minLat: sw.lat, maxLat: ne.lat, minLng: sw.lng, maxLng: ne.lng },
            zoom
          );
        }}
      >
        {children}
      </GoogleMapReact>
    </>
  );
};
