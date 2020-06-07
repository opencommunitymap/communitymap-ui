import React, { useState, useCallback, useEffect } from 'react';
import { Maps, MapItem, MapsProps } from '../components/Maps';
import { MapTypeStyle } from 'google-map-react';
import {
  Loc,
  useAuth,
  MapParams,
  detectLocation,
  ObjectItem,
  ObjectComment,
  ObjectItemComponentProps,
  Place,
  Story,
  Chat,
  leaveComment,
  voteUp,
  closeObject,
  useLoadObjects,
  PointingSegment,
  MapBounds,
} from '..';

export type RenderObjectCallback = (props: {
  item: ObjectItem;
  comments: ObjectComment[];
  votesCount: number;
  currentUser: firebase.User | null;
  userVoted: boolean;
  hover: boolean;
  expanded: boolean;
}) => JSX.Element | null;

export interface CommunityMapProps {
  // Initial coordinates
  center?: Loc;

  // Google Maps style, https://mapstyle.withgoogle.com/
  mapStyles?: MapTypeStyle[];

  // Pin icon showing the center of the map
  centerPin?: JSX.Element | null;

  // Called initially and after moving the map or changing the zoom
  onChange?: (center: Loc, bounds: MapBounds, zoom: number) => void;

  // Detect user location automatically after start. Asks for permission to detect location.
  autolocate?: boolean;

  // Render the objects with custom styling and functionalities
  renderObject?: RenderObjectCallback;

  // filter objects by origin
  filterOrigin?: string;
}

export const CommunityMap: React.FC<CommunityMapProps> = ({
  onChange,
  centerPin,
  center,
  renderObject,
  autolocate,
  filterOrigin,
  mapStyles,
}) => {
  const user = useAuth() || null;
  const [mapParams, setMapParams] = useState<MapParams | null>(null);

  const setMapCenter = useCallback(
    (center: Loc) => {
      setMapParams((mapParams) =>
        mapParams
          ? { ...mapParams, center }
          : { center, bounds: { minLat: 0, maxLat: 0, minLng: 0, maxLng: 0 } }
      );
    },
    [setMapParams]
  );

  useEffect(() => {
    if (autolocate) {
      detectLocation()
        .then((loc) => {
          console.debug('Autolocate:', loc);
          setMapCenter(loc);
        })
        .catch((err) => {
          console.log('Error autodetecting location:', err);
          // silently ignore for the moment
        });
    }
  }, [setMapCenter]);

  const { objects, commentsObj, votesObj } = useLoadObjects(
    mapParams?.bounds || null,
    user,
    filterOrigin
  );

  const render = renderObject || defaultObjectRender;

  return (
    <Maps
      styles={mapStyles}
      centerPin={centerPin}
      center={center}
      onChange={(center, bounds, zoom) => {
        setMapParams({ center, bounds });
        onChange?.(center, bounds, zoom);
      }}
    >
      {commentsObj &&
        votesObj &&
        objects.map((it) => (
          <MapItem key={it.id} lat={it.loc.latitude} lng={it.loc.longitude}>
            {render({
              item: it,
              comments: commentsObj[it.id],
              userVoted: votesObj[it.id]?.userVoted,
              votesCount: votesObj[it.id]?.count,
              expanded: false,
              hover: false,
              currentUser: user,
            })}
          </MapItem>
        ))}
    </Maps>
  );
};

const defaultObjectRender: RenderObjectCallback = ({
  item,
  comments,
  votesCount,
  currentUser,
  userVoted,
  hover,
  expanded,
}) => {
  let RealComponent: React.FC<ObjectItemComponentProps>;

  switch (item.type) {
    case 'place':
      RealComponent = Place;
      break;
    case 'story':
      RealComponent = Story;
      break;
    default:
      RealComponent = Chat;
  }
  return (
    <PointingSegment>
      <RealComponent
        item={item}
        user={currentUser}
        userVoted={userVoted}
        votes={votesCount}
        comments={comments}
        // onClick={() => router.push(`/object/${item.id}`)}
        onClick={() => alert('click TODO')}
        onComment={async (comment) => leaveComment(currentUser, item, comment)}
        onVote={async () => voteUp(currentUser, item)}
        onClose={async () => closeObject(currentUser, item)}
        expanded={expanded}
      />
    </PointingSegment>
  );
};
