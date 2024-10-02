package com.twiliovoicereactnativereferenceapp;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.ReactRootView;
import com.twiliovoicereactnative.VoiceActivityProxy;

import android.Manifest;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.widget.Toast;

public class MainActivity extends ReactActivity {
  public static class MainActivityDelegate extends ReactActivityDelegate {
    public MainActivityDelegate(ReactActivity activity, String mainComponentName) {
      super(activity, mainComponentName);
    }

    @Override
    protected ReactRootView createRootView() {
      ReactRootView reactRootView = new ReactRootView(getContext());
      // If you opted-in for the New Architecture, we enable the Fabric Renderer.
      reactRootView.setIsFabric(BuildConfig.IS_NEW_ARCHITECTURE_ENABLED);
      return reactRootView;
    }

    @Override
    protected boolean isConcurrentRootEnabled() {
      // If you opted-in for the New Architecture, we enable Concurrent Root (i.e. React 18).
      // More on this on https://reactjs.org/blog/2022/03/29/react-v18.html
      return BuildConfig.IS_NEW_ARCHITECTURE_ENABLED;
    }
  }

  private final VoiceActivityProxy activityProxy = new VoiceActivityProxy(
          this,
          permission -> {
            if (Manifest.permission.RECORD_AUDIO.equals(permission)) {
              Toast.makeText(
                      MainActivity.this,
                      "Microphone permissions needed. Please allow in your application settings.",
                      Toast.LENGTH_LONG).show();
            } else if ((Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) &&
                    Manifest.permission.BLUETOOTH_CONNECT.equals(permission)) {
              Toast.makeText(
                      MainActivity.this,
                      "Bluetooth permissions needed. Please allow in your application settings.",
                      Toast.LENGTH_LONG).show();
            } else if ((Build.VERSION.SDK_INT > Build.VERSION_CODES.S_V2) &&
                    Manifest.permission.POST_NOTIFICATIONS.equals(permission)) {
              Toast.makeText(
                      MainActivity.this,
                      "Notification permissions needed. Please allow in your application settings.",
                      Toast.LENGTH_LONG).show();
            }
          });
  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "TwilioVoiceReactNativeReferenceApp";
  }

  /**
   * Returns the instance of the {@link ReactActivityDelegate}. There the RootView is created and
   * you can specify the renderer you wish to use - the new renderer (Fabric) or the old renderer
   * (Paper).
   */
  @Override
  protected ReactActivityDelegate createReactActivityDelegate() {
    return new MainActivityDelegate(this, getMainComponentName());
  }

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    activityProxy.onCreate(savedInstanceState);
  }

  @Override
  public void onDestroy() {
    activityProxy.onDestroy();
    super.onDestroy();
  }

  @Override
  public void onNewIntent(Intent intent) {
    super.onNewIntent(intent);
    activityProxy.onNewIntent(intent);
  }
}
