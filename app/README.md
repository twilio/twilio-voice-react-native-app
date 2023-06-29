# Twilio Voice React Native Reference App

The Twilio Voice React Native Reference App is an example implementation of the Twilio Voice React Native SDK and serves to inspire developers who want to leverage the power of Twilio Programmable Voice in their React Native applications. See the Twilio Voice React Native SDK [here](https://github.com/twilio/twilio-voice-react-native).

## Incoming call notifications

### Android
On Android platforms, the Twilio Voice Android SDK uses Firebase Cloud Messaging (FCM) to deliver call notifications to users. FCM requires a `google-services.json` file that can be generated in a Firebase project. Once the `google-services.json` file is generated, it must be placed in the `app/android/app` folder before any Android build can be completed.

See the Twilio Voice Android SDK [Quickstart](https://github.com/twilio/voice-quickstart-android#bullet1) for more information.

### iOS
On iOS platforms, the Twilio Voice iOS SDK does not need an equivalent file.

Please follow the Twilio Voice iOS SDK [Quickstart](https://github.com/twilio/voice-quickstart-ios#6-create-a-push-credential-with-your-voip-service-certificate) for more information.

## Setting up Auth0

See [example.env](example.env) for information on Auth0 environment variables required to run the app.

## Launching the App

Ensure that you are within the `app/` folder.

```
cd app/
```

Fetch the dependencies.

```
yarn install
```

Install iOS dependencies if running on iOS

```
cd ios
pod install
cd ../
```

Start a native build and the Metro bundler at the same time by using the command

```
yarn android
```

or

```
yarn ios
```

for your respective target platform.

### Setting it up with the Server

Once the Reference Server is up and running, the Reference App can be directed to it by modifying the following line in `.env`.

```
DEFAULT_URL=...;
```

If developing locally and running the Reference Server locally, consider using a tool like `ngrok` to proxy the server endpoints. Once proxied, change `DEFAULT_URL` to the `ngrok` URL endpoints.

See more info about `ngrok` [here](https://ngrok.com/).

If the Reference Server is deployed to a cloud service (some examples include Google App Engine, Amazon EC2, or similar), then point `DEFAULT_URL` to the deployed service URL.

See some of the following cloud services for production deployment:

- Google App Engine [here](https://cloud.google.com/).
- Amazon EC2 [here](https://aws.amazon.com/).

## Design Patterns

With any substantially complex application, opinionated design practices are formed. Here are some of the more important design patterns we use in the Reference App.

### Directory Structure

Smaller reusable components are found in the `src/components/` folder, where larger compilations of those smaller components can be found in `src/screens/`. The intent of a component, such as `Dialer` or `Home`, in the `src/screens/` folder is that it is connected to the application state through React-Redux and React Navigation, whereas components in the `src/components/` folder are state-less.

### Application State Mangagement

Redux-Toolkit is leveraged to maintain the majority of the application state. Some components might maintain an internal state (e.g. the Dialer screen for the identity and type of the recipient) where it makes sense. Data that needs to be accessible globally is made available through the Redux store. State slices are written using the [ducks file pattern](https://github.com/erikras/ducks-modular-redux) where the actions and reducers are found in the same file.

See the Redux documentation [here](https://redux.js.org/introduction/getting-started).

See the Redux-Toolkit documentation [here](https://redux-toolkit.js.org/introduction/getting-started).

Please be sure to read the style guides and best practices within the above documentation.

### Navigation

React Navigation is used to provide "native"-feeling navigation for the application.

See the React Navigation documentation [here](https://reactnavigation.org/docs/getting-started/).
