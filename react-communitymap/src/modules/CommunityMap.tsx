import React, { ComponentType } from 'react';
import { Maps, MapItem } from '../components/Maps';
import { MapTypeStyle, Coords } from 'google-map-react';

export interface CommunityMapProps {
  center?: Coords;
  mapStyles?: MapTypeStyle[];
  centerPin?: JSX.Element;
  onChange?: (
    centerLat: number,
    centerLng: number,
    minLat: number,
    maxLat: number,
    minLng: number,
    maxLng: number
  ) => void;
}
const dummyCb = () => {};

export const CommunityMap: React.FC<CommunityMapProps> = ({
  onChange,
  mapStyles,
  centerPin,
  center,
}) => {
  return (
    <Maps
      styles={mapStyles}
      centerPin={centerPin}
      centerLat={center?.lat}
      centerLng={center?.lng}
      onChange={onChange || dummyCb}
    ></Maps>
  );
};
