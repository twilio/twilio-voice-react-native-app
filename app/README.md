# Twilio Voice React Native SDK Reference App

The **Twilio Voice React Native SDK Reference App** is an application showcasing the features of the **Twilio Voice React Native SDK**. The **Reference App** serves to inspire developers and give them an example of how to implement the **Twilio React Native Voice SDK**.

* See the **Twilio Voice React Native SDK** [here](https://github.com/twilio/twilio-voice-react-native).

## Features

The **Reference App** showcases the following possibilities using **Twilio Voice**:
* Login flow for authenticating and authorizing users
* Dialpad for making outgoing calls
* Registration and notifications for incoming calls
* Active call screen to interact with and control ongoing calls

## Using the App

### Prerequisites

Please ensure that you have a React Native development environment set up for the platform(s) you want to build for. Please see the official React Native documentation [here](https://reactnative.dev/docs/0.70/environment-setup).

### Launching the App

Ensure that you are within the `app/` folder.
```
cd app/
```
Fetch the dependencies.
```
yarn install
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

## Design Patterns

With any substantially complex application, opinionated design practices are formed. Here are some of the more important design patterns we use in the Reference App.

### Directory Structure

Smaller reusable components are found in the `src/components/` folder, where larger compilations of those smaller components can be found in `src/screens/`. The intent of a component, such as `Dialer` or `Home`, in the `src/screens/` folder is that it is "connected" to the application state through React-Redux and React Navigation, whereas components in the `src/components/` folder are state-less.

### Application State Mangagement

Redux-Toolkit is leveraged to maintain the majority of the application state. Some components might maintain an internal state (e.g. the Dialer screen for the identity and type of the recipient) where it makes sense. Data that needs to be accessible globally is made available through the Redux store. State slices are written using the "ducks" file pattern where the actions and reducers are found in the same file.

See the Redux documentation [here](https://redux.js.org/introduction/getting-started).

See the Redux-Toolkit documentation [here](https://redux-toolkit.js.org/introduction/getting-started).

### Navigation

React Navigation is used to provide "native"-feeling navigation for the application.

See the React Navigation documentation [here](https://reactnavigation.org/docs/getting-started/).
