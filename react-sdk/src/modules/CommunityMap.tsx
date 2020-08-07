import React, { useState, useCallback, useEffect } from 'react';
import { MapTypeStyle } from 'google-map-react';
import {
  Loc,
  useAuth,
  MapParams,
  detectLocation,
  ObjectItem,
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
  AuthProvider,
} from '..';
import { RenderAuthorProvider } from '../utils/renderAuthor';
import { Modal, Loader } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';

const isDEV_ENV = process.env.NODE_ENV === 'development';

export interface RenderObjectCallbackProps {
  item: ObjectItem;
  currentUser: firebase.User | null;
  expanded: boolean;
  defaultOnClickHandler?: () => void;
}
export type RenderObjectCallback = (
  props: RenderObjectCallbackProps
) => JSX.Element | boolean | null;

export interface CommunityMapProps {
  // Center coordinates for controlled component
  center?: Loc;
  // Zoom for controlled component
  zoom?: number;

  // Initial coordinates
  defaultCenter?: Loc;
  // Initial zoom
  defaultZoom?: number;

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

const CommunityMapImpl: React.FC<CommunityMapProps> = ({
  onChange,
  centerPin,
  center,
  zoom,
  defaultCenter,
  defaultZoom,
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

  const objects = useLoadObjects(
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

  if (isDEV_ENV && mapParams && mapParams.bounds.maxLat === undefined) {
    return (
      <div style={{ color: 'red' }}>
        Make sure the container element has width and height. The map will try
        to fill the parent container, but if the container has no size, the map
        will collapse to 0 width / height.
      </div>
    );
  }

  return (
    <RenderAuthorProvider value={renderAuthor}>
      <Maps
        styles={mapStyles}
        mapApiKey={mapApiKey}
        centerPin={centerPin}
        center={autodetectedCenter || center}
        zoom={zoom}
        defaultCenter={defaultCenter}
        defaultZoom={defaultZoom}
        showZoomControls={showZoomControls}
        onChange={(center, bounds, zoom) => {
          setMapParams({ center, bounds });
          setAutodetectedCenter(null);
          onChange?.(center, bounds, zoom);
        }}
      >
        {!!objects &&
          objects.map((it) => {
            const defaultOnClickHandler = () => {
              if (onClickObject && !onClickObject(it)) return;
              setIntShowObjectId(it.id);
            };

            return (
              <MapItem key={it.id} lat={it.loc.latitude} lng={it.loc.longitude}>
                {render({
                  item: it,
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
      {profileWidget !== undefined ? profileWidget : <ProfileWidget />}
      {navigationWidget !== undefined ? (
        navigationWidget
      ) : (
        <NavigationWidget
          onChangePosition={(loc) => setAutodetectedCenter(loc)}
        />
      )}
    </RenderAuthorProvider>
  );
};

export const CommunityMap: React.FC<CommunityMapProps> = (props) => {
  return (
    <AuthProvider>
      <CommunityMapImpl {...props} />
    </AuthProvider>
  );
};

const ExpandedObjectView: React.FC<{
  objectId: string;
  renderObject?: RenderObjectCallback;
}> = ({ objectId, renderObject }) => {
  const user = useAuth() || null;

  const object = useLoadSingleObject(objectId, user);

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
        expanded: true,
        currentUser: user,
      })}
    </>
  );
};

const defaultObjectRender: RenderObjectCallback = ({
  item,
  currentUser,
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
      onClick={defaultOnClickHandler}
      onComment={async (comment) => leaveComment(currentUser, item, comment)}
      onVote={async () => voteUp(currentUser, item)}
      onClose={async () => closeObject(currentUser, item)}
      expanded={expanded}
    />
  );
  return expanded ? comp : <PointingSegment>{comp}</PointingSegment>;
};
