import { Loc, MapBounds } from 'react-communitymap';

export interface EmbedParams {
  appId: string;
}

export interface InitialAppParams extends Partial<EmbedParams> {
  filterOrigin?: string;
  canAdd?: boolean;
  centerLat?: number;
  centerLng?: number;
  theme?: 'standard' | 'silver' | 'dark';
  autolocate?: boolean;
}
