# End-to-end Testing

## Structure
The Detox test framework is leveraged heavily to end-to-end test the Twilio Voice React Native Reference App.

## Setup

### Incoming Calls
The Twilio Node.js helper library is used to make calls to the Reference App. In order for the tests to work, the process running the `detox test` command needs three environment variables, as defined in the below table. CI runs should use a randomly generated and unique identity for `CLIENT_IDENTITY`. For example, having the following step before running either the `detox test` or the server will suffice:

```shell
export ACCOUNT_SID=foo
export AUTH_TOKEN=bar
export CLIENT_IDENTITY=$(uuidgen)
```

Or if you prefer not to set session-wide environment variables
```shell
ACCOUNT_SID=foo \
AUTH_TOKEN=bar \
CLIENT_IDENTITY=$(uuidgen) \
yarn run detox:test --configuration android.emu.debug
```

| Environment Variable | Description |
| - | - |
| ACCOUNT_SID | The account SID to use for testing. |
| AUTH_TOKEN | The auth token of the account to use for testing. |
| CLIENT_IDENTITY | The mock identity that the Reference App will register as. This is the same identity that the token is vended with. |
