package com.pessoauto.app;

import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.ViewGroup;
import android.webkit.WebView;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.PluginHandle;

public class MainActivity extends BridgeActivity {
    private SwipeRefreshLayout swipeRefreshLayout;
    private final Handler refreshTimeoutHandler = new Handler(Looper.getMainLooper());
    private final Runnable refreshTimeoutRunnable = this::endPullToRefresh;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(PullToRefreshPlugin.class);
        super.onCreate(savedInstanceState);
        setupPullToRefresh();
    }

    private void setupPullToRefresh() {
        if (getBridge() == null) {
            return;
        }

        WebView webView = getBridge().getWebView();
        if (webView == null || !(webView.getParent() instanceof ViewGroup)) {
            return;
        }

        ViewGroup parent = (ViewGroup) webView.getParent();
        int webViewIndex = parent.indexOfChild(webView);
        ViewGroup.LayoutParams layoutParams = webView.getLayoutParams();

        parent.removeView(webView);

        swipeRefreshLayout = new SwipeRefreshLayout(this);
        swipeRefreshLayout.setLayoutParams(layoutParams);
        swipeRefreshLayout.setOnChildScrollUpCallback((refreshLayout, child) -> webView.canScrollVertically(-1));
        swipeRefreshLayout.setOnRefreshListener(this::notifyPullToRefreshRequested);
        swipeRefreshLayout.addView(
            webView,
            new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
        );

        parent.addView(swipeRefreshLayout, webViewIndex);
    }

    private void notifyPullToRefreshRequested() {
        refreshTimeoutHandler.removeCallbacks(refreshTimeoutRunnable);
        refreshTimeoutHandler.postDelayed(refreshTimeoutRunnable, 10000);

        if (getBridge() == null) {
            endPullToRefresh();
            return;
        }

        PluginHandle pluginHandle = getBridge().getPlugin("PullToRefresh");
        if (pluginHandle == null || !(pluginHandle.getInstance() instanceof PullToRefreshPlugin)) {
            endPullToRefresh();
            return;
        }

        PullToRefreshPlugin plugin = (PullToRefreshPlugin) pluginHandle.getInstance();
        plugin.notifyRefreshRequested();
    }

    public void endPullToRefresh() {
        refreshTimeoutHandler.removeCallbacks(refreshTimeoutRunnable);
        runOnUiThread(() -> {
            if (swipeRefreshLayout != null) {
                swipeRefreshLayout.setRefreshing(false);
            }
        });
    }
}
