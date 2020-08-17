# React SDK for Open Community Map

This SDK helps to integrate [Open Community Map](https://github.com/opencommunitymap/communitymap-ui) into external React project.

This is the early beta version that may be subject to many changes, including the interface.

## Installation

Install _react-sdk_ and firebase packages:

```
npm i @opencommunitymap/react-sdk firebase firebaseui
```

or

```
yarn add @opencommunitymap/react-sdk firebase firebaseui
```

### Google Maps API key

Currently you need to provide your Google Maps API key in `mapApiKey` argument of `<CommunityMap>`.

Follow the steps in [this Google Maps documentation](https://developers.google.com/maps/documentation/javascript/get-api-key) to create the key.

## Examples

Simple example - just showing Community Map at current location.

```jsx
import React from 'react';
import { CommunityMap } from '@opencommunitymap/react-sdk';
const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY || '';

<div style={{ width: '100%', height: 500 }}>
  <CommunityMap mapApiKey={GOOGLE_API_KEY} autolocate />
</div>;
```

Complex example - with autolocation, filtering content by origin (specific project), custom map style, center pin, navigation and new content widgets, map objects widget.

```jsx
import React, { useState } from 'react';
import {
  CommunityMap,
  Pin,
  detectLocation,
  useLoadObjects,
  useAuth,
} from '@opencommunitymap/react-sdk';
import mapStyles from './customGoogleMapsDarkStyle.json';
const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;

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
        mapApiKey={GOOGLE_API_KEY}
        autolocate
        filterOrigin="projectX"
        mapStyles={mapStyles}
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
