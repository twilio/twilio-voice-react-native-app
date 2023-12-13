package com.twiliovoicereactnativereferenceapp;

import android.Manifest;
import android.os.Build;

import com.wix.detox.Detox;
import com.wix.detox.config.DetoxConfig;

import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.filters.LargeTest;
import androidx.test.rule.ActivityTestRule;
import androidx.test.rule.GrantPermissionRule;

@RunWith(AndroidJUnit4.class)
@LargeTest
public class DetoxTest {
    private static final String[] permissionList;
    @Rule
    public ActivityTestRule<MainActivity> mActivityRule = new ActivityTestRule<>(MainActivity.class, false, false);
    @Rule
    public GrantPermissionRule permissionRule = GrantPermissionRule.grant(permissionList);

    @Test
    public void runDetoxTests() {
        DetoxConfig detoxConfig = new DetoxConfig();
        detoxConfig.idlePolicyConfig.masterTimeoutSec = 90;
        detoxConfig.idlePolicyConfig.idleResourceTimeoutSec = 60;
        detoxConfig.rnContextLoadTimeoutSec = 180;

        Detox.runTests(mActivityRule, detoxConfig);
    }

    static {
        if (Build.VERSION.SDK_INT > Build.VERSION_CODES.S_V2) {
            permissionList = new String[] {
                    Manifest.permission.RECORD_AUDIO,
                    Manifest.permission.BLUETOOTH_CONNECT,
                    Manifest.permission.POST_NOTIFICATIONS };
        } else if (Build.VERSION.SDK_INT > Build.VERSION_CODES.R) {
            permissionList = new String[] {
                    Manifest.permission.RECORD_AUDIO, Manifest.permission.BLUETOOTH_CONNECT };
        } else {
            permissionList = new String[] { Manifest.permission.RECORD_AUDIO };
        }
    }
}
