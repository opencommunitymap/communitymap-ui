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
  type: 'chat' | 'request' | 'offer' | 'donation' | 'place';
  title: string;
  short_description?: string;
  description: string;
  logoURL?: string;
  url?: string;
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

export interface EmbedParams {
  appId: string;
}

export interface InitialAppParams extends Partial<EmbedParams> {
  filterOrigin?: string;
  canAdd?: boolean;
  centerLat?: number;
  centerLng?: number;
  theme?: 'standard' | 'silver' | 'dark';
}

export interface UserProfile {
  id: string;
  created?: string;
  updated?: string;
  name: string;
  // gender: 'male'|'female'|null;
}

export interface DirectMessageInfo {
  id: string;
  members: string[];
  created: string;
  updated: string;
  lastMsgId: string;
  lastReadBy: { [uid: string]: string };
}

export interface DirectMessageItem {
  id: string;
  author: string;
  timestamp: string;
  content: string;
}
