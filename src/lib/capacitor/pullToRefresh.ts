import { registerPlugin, type PluginListenerHandle } from "@capacitor/core";

type PullToRefreshPlugin = {
  addListener(eventName: "refreshRequested", listenerFunc: () => void): Promise<PluginListenerHandle>;
  endRefresh(): Promise<void>;
};

export const PullToRefresh = registerPlugin<PullToRefreshPlugin>("PullToRefresh");
