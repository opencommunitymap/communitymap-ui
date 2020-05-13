# Open Community Map

Open Community Map is a platform intended to gather various local community and location-based services on one map.

It can be used from:
- https://communitymap.online 
- Partner 3rd party website with the map embedded with `<iframe>`
- Self-hosted solution

More details about project ideas and structure can be found in the [Wiki](https://github.com/opencommunitymap/communitymap-ui/wiki)

## Slack workspace

Feel free to [join our Slack space](https://join.slack.com/t/opencommunitymap/shared_invite/zt-e7hqo2zo-rbeP~IoF0pPkAEsa0B7lcw) and ask questions or share your ideas with us!

## Embedding into 3rd party site

It's possible to embed the map into 3rd party site. You need to use the _appId_ we'll provide you.

```
https://communitymap.online/embed/?appId=<your-app-id>
```

Example:

```
<iframe
  src="https://communitymap.online/embed?appId=Test42"
  allow="geolocation"
  style="border-width: 0;"
  width="100%"
  height="850"
></iframe>
```

Currently you can filter to show only your objects on the map using optional _filterOrigin_ query parameter. If it's missing, all types of objects are shown.

Optional _centerLat_ and _centerLng_ parameters define the default coordinates to the map.

Optional _canAdd_ allows to hide UI elements for adding objects from this view. If you need to add them your own way, hide them and use the [API](#API).

```
<iframe
  src="https://communitymap.online/embed?appId=Test42&filterOrigin=Test42&centerLat=43.123&centerLng=24.122&canAdd=false"
  allow="geolocation"
  style="border-width: 0;"
  width="100%"
  height="850"
></iframe>
```

## API

Check out the [API documentation](https://github.com/opencommunitymap/communitymap-cloud-functions/blob/master/docs/API.md)

## Collaborators needed!

Fork the project and then clone your fork. [Read more about Fork & PR strategy](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/working-with-forks)

```
git clone git@github.com:<YOUR_GITHUB_USER>/communitymap-ui.git

cd community-map/

yarn install
```


Now you can run the web app:

```
yarn start
```

It runs the app in the development mode.

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.

You will also see any lint errors in the console.

You will use pre-configured _Community Map Dev_ firebase project.

### Google Maps for Development purposes only

The maps with show 'For development purposes only' watermark all over the map.

To fix that create _.env_ file and fill in your Google Maps Key.

## Configure with different Firebase project

For self-hosted installation you need to configure different Firebase project.

```
cp .env.sample .env
```

Init firebase and choose your firebase project

```
firebase init
```

Copy web app firebase config from **Firebase Project Settings -> General -> Your Apps -> Web apps -> (\*) Config** and store it in _src/firebaseConfig.ts_ like this:

```
export const firebaseConfig = {
  ...
}
```
------

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
