export { Coords } from 'google-map-react';

export interface ObjectItem {
  type: 'chat' | 'petition';
  author: string;
  title: string;
  description: string;
  loc: Coords;
}
