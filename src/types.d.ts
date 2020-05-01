export type AuthUser = undefined | null | firebase.User;

export interface Location {
  latitude: number;
  longitude: number;
}

export interface ObjectComment {
  id: string;
  object_id: string;
  author: string;
  comment: string;
  created: string;
}

export interface ObjectVote {
  object_id: string;
  author: string;
  value: number;
  created: string;
}

export interface ObjectItemInput {
  title: string;
  description: string;
  type: 'chat' | 'request' | 'offer' | 'donation' | 'place';
  valid_until: string;
}
export interface ObjectItem extends ObjectItemInput {
  id: string;
  author: string;
  loc: Location;
  created: string;
}

export interface MapParams {
  centerLat: number;
  centerLng: number;
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

export interface UserProfile {
  id: string;
  created?: string;
  updated?: string;
  name: string;
  // gender: 'male'|'female'|null;
}
