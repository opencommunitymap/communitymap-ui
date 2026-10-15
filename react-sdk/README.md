# React SDK for Open Community Map

This SDK helps to integrate [Open Community Map](https://github.com/opencommunitymap/communitymap-ui) into external React project.

This is the early beta version that may be subject to many changes, including the interface.

## Installation

Install _react-sdk_ and firebase packages:

```
npm i @opencommunitymap/react-sdk firebase@^12 react@^19 react-dom@^19
```

or

```
yarn add @opencommunitymap/react-sdk firebase@^12 react@^19 react-dom@^19
```

The SDK requires Firebase 11 or 12 and React / React DOM 19. FirebaseUI v7 and its
styles are installed by the SDK. Remove the old `firebaseui` package when upgrading
from `0.1.0-rc10` or earlier. See the [SDK reference](../docs/react-sdk.md) for
authentication setup and optional sign-in policy links.

### Basemap

The default basemap is OpenFreeMap's Liberty style and does not require an API
key. Pass a MapLibre-compatible style URL or specification through `mapStyle` to
use another map provider.

## Examples

Simple example - just showing Community Map at current location.

```jsx
import React from 'react';
import { CommunityMap } from '@opencommunitymap/react-sdk';

<div style={{ width: '100%', height: 500 }}>
  <CommunityMap autolocate />
</div>;
```

Complex example - with autolocation, filtering content by origin (specific project), custom map style, center pin, navigation and new content widgets, map objects widget.

```jsx
import React, { useState } from 'react';
import {
  CommunityMap,
  Pin,
  detectLocation,
  OPEN_FREE_MAP_STYLES,
  useLoadObjects,
  useAuth,
} from '@opencommunitymap/react-sdk';

const defaultCenter = { latitude: 42.69, longitude: 23.32 };
const defaultZoom = 18;
// include your custom Navigation, NewContentWidget, MapItemWidget

const Map = () => {
  const [center, setCenter] = useState();
  const [zoom, setZoom] = useState();
  const [bounds, setBounds] = useState();

  const user = useAuth();

  const objects = useLoadObjects(bounds, user || null);

  return (
    <>
      <CommunityMap
        autolocate
        filterOrigin="projectX"
        mapStyle={OPEN_FREE_MAP_STYLES.dark}
        centerPin={<Pin color="#79CAB5" />}
        center={center}
        zoom={zoom}
        data={objects || []}
        defaultCenter={defaultCenter}
        defaultZoom={defaultZoom}
        showZoomControls={false}
        renderObject={({ item }) => <MapItemWidget item={item} />}
        navigationWidget={
          <Navigation
            autolocate={() =>
              detectLocation()
                .then((loc) => setCenter(loc))
                .catch((err) => alert(err.message))
            }
            zoomIn={() => setZoom((zoom = 18) => zoom + 1)}
            zoomOut={() => setZoom((zoom = 18) => zoom - 1)}
          />
        }
        onChange={(center, bounds, zoom) => {
          setCenter(center);
          setBounds(bounds);
          setZoom(zoom);
        }}
      />
      <NewContentWidget loc={center} />
    </>
  );
};

const App = () => (
  <div style={{ width: '100%', height: '100%' }}>
    <Map />
  </div>
);
```
