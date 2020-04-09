import React from 'react';
import GoogleMapReact from 'google-map-react';

const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY || '';

const PinImg = () => (
  <img style={{ display: 'block' }} alt="here" src="/pin.png" />
);

const defaultProps = {
  defaultCenter: { lat: 42.69, lng: 23.32 },
  defaultZoom: 18,
  defaultOptions: {
    overviewMapControl: true,
    streetViewControl: true,
    rotateControl: true,
    mapTypeControl: true,
    styles: [],
  },
};

export const Maps: React.FC = ({ children }) => {
  return (
    <>
      <div id="center-pin">
        <PinImg />
      </div>
      <GoogleMapReact
        bootstrapURLKeys={{ key: GOOGLE_API_KEY }}
        {...defaultProps}
      >
        {children}
      </GoogleMapReact>
    </>
  );
};
