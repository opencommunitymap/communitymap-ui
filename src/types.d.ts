export interface Location {
  latitude: number;
  longitude: number;
}

export interface ObjectComment {
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
  type: 'chat' | 'petition';
}
export interface ObjectItem extends ObjectItemInput {
  id: string;
  author: string;
  loc: Location;
}
