package com.twiliovoicereactnativereferenceapp;

import java.lang.reflect.InvocationTargetException;
import android.app.Application;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.soloader.SoLoader;
import com.twiliovoicereactnative.VoiceApplicationProxy;
import com.microsoft.appcenter.AppCenter;
import com.microsoft.appcenter.distribute.Distribute;

public class MainApplication extends Application implements ReactApplication {
    private final MainReactNativeHost mReactNativeHost;
    private final VoiceApplicationProxy voiceApplicationProxy;

    public MainApplication() {
        mReactNativeHost = new MainReactNativeHost(this);
        voiceApplicationProxy = new VoiceApplicationProxy(getReactNativeHost());
    }

    @Override
    public VoiceApplicationProxy.VoiceReactNativeHost getReactNativeHost() {
        return mReactNativeHost;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        voiceApplicationProxy.onCreate();

        // for app center if available
        if (!"null".equals(BuildConfig.APPCENTER_APP_KEY)) {
            AppCenter.start(this, BuildConfig.APPCENTER_APP_KEY, Distribute.class);
        }

        SoLoader.init(this, /* native exopackage */ false);
        if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
            // If you opted-in for the New Architecture, we load the native entry point for this app.
            DefaultNewArchitectureEntryPoint.load();
        }
        ReactNativeFlipper.initializeFlipper(this, getReactNativeHost().getReactInstanceManager());
    }

    @Override
    public void onTerminate() {
        // Note: this method is not called when running on device, devices just kill the process.
        voiceApplicationProxy.onTerminate();
        super.onTerminate();
    }
}
