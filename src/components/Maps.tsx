import React, { useMemo } from 'react';
import GoogleMapReact from 'google-map-react';
import './Maps.css';
import silverStyle from './MapsGoogleSilverStyle.json';
import darkStyle from './MapsGoogleDarkStyle.json';

const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY || '';

const PinImg = () => (
  <img style={{ display: 'block' }} alt="here" src="/pin.png" />
);

export const MapItem: React.FC<{ lat: number; lng: number }> = ({
  children,
}) => <>{children}</>;

const getProps = (theme: string) => {
  let styles: any = [
    {
      // disables poi
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
  ];
  if (theme === 'dark') {
    styles = darkStyle;
  } else if (theme === 'silver') {
    styles = silverStyle;
  }
  const options = {
    overviewMapControl: true,
    streetViewControl: false,
    rotateControl: true,
    mapTypeControl: true,
    styles,
  };
  return {
    defaultCenter: { lat: 42.69, lng: 23.32 },
    defaultZoom: 18,
    defaultOptions: options,
    options,
  };
};

interface MapsProps {
  centerLat?: number;
  centerLng?: number;
  theme?: string;
  onChange: (
    centerLat: number,
    centerLng: number,
    minLat: number,
    maxLat: number,
    minLng: number,
    maxLng: number
  ) => void;
}

export const Maps: React.FC<MapsProps> = ({
  children,
  centerLat,
  centerLng,
  theme = 'standard',
  onChange,
}) => {
  const center = useMemo(() => {
    if (!centerLat || !centerLng) return undefined;
    return { lat: centerLat, lng: centerLng };
  }, [centerLat, centerLng]);
  const props = useMemo(() => getProps(theme), [theme]);
  return (
    <>
      <div id="center-pin">
        <PinImg />
      </div>
      <GoogleMapReact
        {...props}
        bootstrapURLKeys={{ key: GOOGLE_API_KEY }}
        center={center}
        onChange={(props) => {
          const {
            center,
            bounds: { sw, ne },
          } = props;
          console.debug('GoogleMaps onChange', props);
          onChange(center.lat, center.lng, sw.lat, ne.lat, sw.lng, ne.lng);
        }}
      >
        {children}
      </GoogleMapReact>
    </>
  );
};
