# Community map

This project is home for number of location-based local community services.

## Development

For local installation first clone the project

```
git clone git@github.com:dmitry-yudakov/community-map.git

cd community-map/

yarn install
```

Create _.env_ file and fill in your Google Maps Key

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
