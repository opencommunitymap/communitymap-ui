export * from './components/AuthorWidget';
export * from './components/PointingSegment';
export * from './components/Pin';
export * from './components/Maps';
export * from './components/Chat';
export * from './components/Place';
export * from './components/Story';
export * from './components/Login';
export * from './components/ProfileWidget';
export * from './modules/Auth';
export * from './modules/DB';
export * from './modules/CommunityMap';
export * from './utils';

export type AuthUser = undefined | null | firebase.User;

export interface Loc {
  latitude: number;
  longitude: number;
}
export interface MapBounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

export interface MapParams {
  center: Loc;
  bounds: MapBounds;
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
  type: 'chat' | 'request' | 'offer' | 'donation' | 'place' | 'story';
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
  loc: Loc;
  created: string;
}

export interface ObjectItemComponentProps {
  item: ObjectItem;
  user: firebase.User | null;
  userVoted: boolean;
  votes: number;
  comments?: ObjectComment[];
  expanded?: boolean;
  onClick?: () => void;
  onVote: () => Promise<any>;
  onComment: (comment: string) => Promise<any>;
  onClose: () => Promise<any>;
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

export type RenderAuthorCallback = (user: UserProfile) => JSX.Element;
