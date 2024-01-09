package com.twiliovoicereactnativereferenceapp;

import java.lang.reflect.InvocationTargetException;
import android.app.Application;
import android.content.Context;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.config.ReactFeatureFlags;
import com.facebook.soloader.SoLoader;
import com.twiliovoicereactnative.VoiceApplicationProxy;
import com.microsoft.appcenter.AppCenter;
import com.microsoft.appcenter.distribute.Distribute;
import com.twiliovoicereactnativereferenceapp.newarchitecture.MainApplicationReactNativeHost;

public class MainApplication extends Application implements ReactApplication {
    private final MainApplicationReactNativeHost mNewArchitectureNativeHost =
            new MainApplicationReactNativeHost(this);
    private final MainReactNativeHost mReactNativeHost;
    private final VoiceApplicationProxy voiceApplicationProxy;

    public MainApplication() {
        mReactNativeHost = new MainReactNativeHost(this);
        voiceApplicationProxy = new VoiceApplicationProxy(getReactNativeHost());
    }

    @Override
    public VoiceApplicationProxy.VoiceReactNativeHost getReactNativeHost() {
        if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
            return mNewArchitectureNativeHost;
        } else {
            return mReactNativeHost;
        }
    }

    @Override
    public void onCreate() {
        super.onCreate();
        voiceApplicationProxy.onCreate();
        // for app center if available
        if (!"null".equals(BuildConfig.APPCENTER_APP_KEY)) {
            AppCenter.start(this, BuildConfig.APPCENTER_APP_KEY, Distribute.class);
        }
        // If you opted-in for the New Architecture, we enable the TurboModule system
        ReactFeatureFlags.useTurboModules = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED;
        SoLoader.init(this, /* native exopackage */ false);
        initializeFlipper(this, getReactNativeHost().getReactInstanceManager());
    }

    @Override
    public void onTerminate() {
        // Note: this method is not called when running on device, devices just kill the process.
        voiceApplicationProxy.onTerminate();
        super.onTerminate();
    }

    /**
     * Loads Flipper in React Native templates. Call this in the onCreate method with something like
     * initializeFlipper(this, getReactNativeHost().getReactInstanceManager());
     *
     * @param context
     * @param reactInstanceManager
     */
    private static void initializeFlipper(
            Context context, ReactInstanceManager reactInstanceManager) {
        if (BuildConfig.DEBUG) {
            try {
        /*
         We use reflection here to pick up the class that initializes Flipper,
        since Flipper library is not available in release mode
        */
                Class<?> aClass = Class.forName("com.twiliovoicereactnativereferenceapp.ReactNativeFlipper");
                aClass
                        .getMethod("initializeFlipper", Context.class, ReactInstanceManager.class)
                        .invoke(null, context, reactInstanceManager);
            } catch (ClassNotFoundException | NoSuchMethodException | IllegalAccessException |
                     InvocationTargetException e) {
                e.printStackTrace();
            }
        }
    }
}
