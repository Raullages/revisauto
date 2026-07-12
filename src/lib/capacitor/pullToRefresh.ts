import { registerPlugin, type PluginListenerHandle } from "@capacitor/core";

type PullToRefreshPlugin = {
  addListener(eventName: "refreshRequested", listenerFunc: () => void): Promise<PluginListenerHandle>;
  beginRefresh(): Promise<void>;
  endRefresh(): Promise<void>;
};

export const PullToRefresh = registerPlugin<PullToRefreshPlugin>("PullToRefresh");
