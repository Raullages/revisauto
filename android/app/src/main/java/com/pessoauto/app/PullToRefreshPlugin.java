package com.pessoauto.app;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "PullToRefresh")
public class PullToRefreshPlugin extends Plugin {
    @PluginMethod
    public void endRefresh(PluginCall call) {
        if (getActivity() instanceof MainActivity) {
            ((MainActivity) getActivity()).endPullToRefresh();
        }
        call.resolve();
    }

    public void notifyRefreshRequested() {
        notifyListeners("refreshRequested", new JSObject(), true);
    }
}
