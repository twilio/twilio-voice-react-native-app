# End-to-end Testing

## Structure
The Detox test framework is leveraged heavily to end-to-end test the Twilio Voice React Native Reference App.

## Setup

### Incoming Calls
The Twilio Node.js helper library is used to make calls to the Reference App. In order for the tests to work, the process running the `detox test` command needs three environment variables, as defined in the below table.

| Environment Variable | Description |
| - | - |
| ACCOUNT_SID | The account SID to use for testing. |
| AUTH_TOKEN | The auth token of the account to use for testing. |
| MOCK_CLIENT_ID | The mock identity that the Reference App will register as. This is the same identity that the token is vended with. |
