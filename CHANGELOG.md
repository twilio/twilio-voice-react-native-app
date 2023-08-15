# 1.0.0-beta.1 (In Progress)

## App
* Android `API >= 30` devices now do not have their microphones turn off upon inactivity.
* Upgrade Twilio Voice React Native SDK to `1.0.0-rc7`.
* Upgrade React Native from `0.70.6` to `0.70.9`.
  * Potentially fixes iOS builds for newer versions of Xcode.
* Added tests.
  * e2e tests for outgoing calls
  * e2e test for incoming calls
  * Unit tests for stores, screens, and components

### Features
* Added the ability to select an audio device within the active call screen.

## Server

### Features
* Improve developer experience.
  * Added linting to server.
