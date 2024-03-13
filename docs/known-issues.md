# Known Issues
This document lists known issues and workarounds.

## iOS Build Issues regarding Flipper
Flipper has an upstream issue that prevents builds from completing on Xcode
version 15.3.

If you are not using Flipper in your workflow, you can disable Flipper during
the `pod install` step by passing an environment variable `NO_FLIPPER` with a
value of `1`.

```sh
NO_FLIPPER=1 pod install
```
