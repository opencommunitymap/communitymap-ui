export interface Location {
  latitude: number;
  longitude: number;
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
