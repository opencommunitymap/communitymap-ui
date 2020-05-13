# Open Community Map

This project is home for number of location-based local community services - moderated by the community.

More details about project ideas and structure can be found in the [Wiki](https://github.com/dmitry-yudakov/community-map/wiki)

## Slack workspace

Feel free to [join our Slack space](https://join.slack.com/t/opencommunitymap/shared_invite/zt-e7hqo2zo-rbeP~IoF0pPkAEsa0B7lcw) and ask questions or share your ideas with us!

## Development

For local installation

```
git clone git@github.com:opencommunitymap/communitymap-ui.git

cd community-map/

yarn install

yarn start
```

You will use pre-configured _Community Map Dev_ firebase project.

### Google Maps for Development purposes only

The maps with show 'For development purposes only' watermark all over the map.

To fix that create _.env_ file and fill in your Google Maps Key.

## Configure with different

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

Now you can run the web app:

```
yarn start
```

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
