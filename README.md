# Twilio Voice React Native Reference

## What is this Project?

The Twilio Voice React Native Reference App is an example implementation of the Twilio Voice React Native SDK and serves to inspire developers who want to leverage the power of Twilio Programmable Voice in their React Native applications.

## Before you use this Project

You should have the React Native development environment set up and have a firm understanding of Twilio Programmable Voice.

Please follow the official React Native guides to set up your environment, and additionally the Twilio Programmable Voice documentation. TODO LINKS

### Structure

This repository is a monorepo hosting two major components.

* A React Native application under:
  ```
  app/
  ```
  The example application uses the Twilio Voice React Native SDK and features a dialpad to make outgoing calls, and registration to receive incoming calls.

* A complimentary backend server under:
  ```
  server/
  ```
  The example backend server features a basic REST API that compliments the React Native application. It interacts with the React Native application to authenticate users, vend tokens, and respond to your TwiML applications.

Please see the `README.md` files within each sub-folder for more information about that component.
