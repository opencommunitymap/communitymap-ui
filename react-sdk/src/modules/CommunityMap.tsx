import React, { useState, useCallback, useEffect } from 'react';
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
  useLoadSingleObject,
  ProfileWidget,
  NavigationWidget,
  RenderAuthorCallback,
  Maps,
  MapItem,
} from '..';
import { RenderAuthorProvider } from '../utils/renderAuthor';
import { Modal, Loader } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';

export interface RenderObjectCallbackProps {
  item: ObjectItem;
  comments: ObjectComment[];
  votesCount: number;
  currentUser: firebase.User | null;
  userVoted: boolean;
  expanded: boolean;
  defaultOnClickHandler?: () => void;
}
export type RenderObjectCallback = (
  props: RenderObjectCallbackProps
) => JSX.Element | boolean | null;

export interface CommunityMapProps {
  // Initial coordinates
  center?: Loc;

  zoom?: number;

  // Google Maps style, https://mapstyle.withgoogle.com/
  mapStyles?: MapTypeStyle[];

  // Api Key for Google Maps
  mapApiKey?: string;

  // Pin icon showing the center of the map
  centerPin?: JSX.Element | null;

  profileWidget?: JSX.Element | null;

  navigationWidget?: JSX.Element | null;

  // Called initially and after moving the map or changing the zoom
  onChange?: (center: Loc, bounds: MapBounds, zoom: number) => void;

  // Detect user location automatically after start. Asks for permission to detect location.
  autolocate?: boolean;

  // Render the objects with custom styling and functionalities
  // return true to apply default behavior
  // return falsy value to prevent object from displaying
  renderObject?: RenderObjectCallback;

  // Allows to render custom element for author of posts or comments on variious places
  renderAuthor?: RenderAuthorCallback;

  // allows hiding default map zoom controls, default true
  showZoomControls?: boolean;

  onClickObject?: (objectItem: ObjectItem) => boolean | undefined | null;
  showObjectId?: string;
  onObjectModalClose?: () => void;

  // filter loading objects by origin
  filterOrigin?: string;
}

export const CommunityMap: React.FC<CommunityMapProps> = ({
  onChange,
  centerPin,
  center,
  zoom,
  renderObject,
  renderAuthor,
  showZoomControls,
  profileWidget,
  navigationWidget,
  autolocate,
  filterOrigin,
  mapStyles,
  mapApiKey,
  onClickObject,
  showObjectId: extShowObjectId,
  onObjectModalClose,
}) => {
  const user = useAuth() || null;
  const [mapParams, setMapParams] = useState<MapParams | null>(null);
  const [autodetectedCenter, setAutodetectedCenter] = useState<Loc | null>(
    null
  );

  const doAutolocate = useCallback(
    () =>
      detectLocation()
        .then((loc) => {
          console.debug('Autolocate:', loc);
          setAutodetectedCenter(loc);
        })
        .catch((err) => {
          console.log('Error autodetecting location:', err);
          // silently ignore for the moment
        }),
    [setAutodetectedCenter]
  );

  useEffect(() => {
    autolocate && doAutolocate();
  }, [doAutolocate]);

  const { objects, commentsObj, votesObj } = useLoadObjects(
    mapParams?.bounds || null,
    user,
    filterOrigin
  );

  const render: RenderObjectCallback = (props) => {
    const rend = renderObject || defaultObjectRender;
    const itemView = rend(props);
    if (!itemView) return null;
    if (itemView === true) return defaultObjectRender(props);
    return itemView;
  };

  const [intShowObjectId, setIntShowObjectId] = useState<null | string>(null);
  const showObjectId = extShowObjectId || intShowObjectId;

  const onModalClose = useCallback(() => {
    onObjectModalClose?.();
    setIntShowObjectId(null);
  }, [setIntShowObjectId, onObjectModalClose]);

  return (
    <RenderAuthorProvider value={renderAuthor}>
      <Maps
        styles={mapStyles}
        mapApiKey={mapApiKey}
        centerPin={centerPin}
        center={autodetectedCenter || center}
        zoom={zoom}
        showZoomControls={showZoomControls}
        onChange={(center, bounds, zoom) => {
          setMapParams({ center, bounds });
          setAutodetectedCenter(null);
          onChange?.(center, bounds, zoom);
        }}
      >
        {commentsObj &&
          votesObj &&
          objects.map((it) => {
            const defaultOnClickHandler = () => {
              if (onClickObject && !onClickObject(it)) return;
              setIntShowObjectId(it.id);
            };

            return (
              <MapItem key={it.id} lat={it.loc.latitude} lng={it.loc.longitude}>
                {render({
                  item: it,
                  comments: commentsObj[it.id],
                  userVoted: votesObj[it.id]?.userVoted,
                  votesCount: votesObj[it.id]?.count,
                  defaultOnClickHandler,
                  expanded: false,
                  currentUser: user,
                })}
              </MapItem>
            );
          })}
      </Maps>
      <Modal open={!!showObjectId} onClose={onModalClose} closeIcon>
        <Modal.Content scrolling>
          {!!showObjectId && (
            <ExpandedObjectView
              objectId={showObjectId}
              renderObject={renderObject}
            />
          )}
        </Modal.Content>
      </Modal>
      {profileWidget || <ProfileWidget />}
      {navigationWidget || (
        <NavigationWidget
          onChangePosition={(loc) => setAutodetectedCenter(loc)}
        />
      )}
    </RenderAuthorProvider>
  );
};

const ExpandedObjectView: React.FC<{
  objectId: string;
  renderObject?: RenderObjectCallback;
}> = ({ objectId, renderObject }) => {
  const user = useAuth() || null;

  const { object, comments, votesInfo } = useLoadSingleObject(objectId, user);

  if (object === undefined) return <Loader active />;
  if (object === null) return <div>Object not found :(</div>;

  const render: RenderObjectCallback = (props) => {
    const rend = renderObject || defaultObjectRender;
    const itemView = rend(props);
    if (!itemView) return null;
    if (itemView === true) return defaultObjectRender(props);
    return itemView;
  };

  return (
    <>
      {render({
        item: object,
        comments: comments || [],
        userVoted: votesInfo?.userVoted || false,
        votesCount: votesInfo?.count || 0,
        expanded: true,
        currentUser: user,
      })}
    </>
  );
};

const defaultObjectRender: RenderObjectCallback = ({
  item,
  comments,
  votesCount,
  currentUser,
  userVoted,
  expanded,
  defaultOnClickHandler,
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
  const comp = (
    <RealComponent
      item={item}
      user={currentUser}
      userVoted={userVoted}
      votes={votesCount}
      comments={comments}
      onClick={defaultOnClickHandler}
      onComment={async (comment) => leaveComment(currentUser, item, comment)}
      onVote={async () => voteUp(currentUser, item)}
      onClose={async () => closeObject(currentUser, item)}
      expanded={expanded}
    />
  );
  return expanded ? comp : <PointingSegment>{comp}</PointingSegment>;
};
