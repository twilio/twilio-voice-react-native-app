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

## iOS Build Issues regarding RCT-Folly
On some Xcode versions, RCT-Folly will fail to build. You can temporarily modify
the `hash.h` file that is causing the issue by double-clicking on the Xcode
error message:

```
.../app/ios/Pods/boost/boost/container_hash/hash.hpp:131:33: No template named
'unary_function' in namespace 'std'; did you mean '__unary_function'?
```

And then prepending two `_` characters in front of `unary_function`. The result
should be `__unary_function`:

```
struct hash_base : std::__unary_function<T, std::size_t> {};
```
