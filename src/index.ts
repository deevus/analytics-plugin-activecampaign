import { AnalyticsPlugin } from "analytics";
import { isScriptLoaded } from "analytics-utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Metadata = Record<string, any>;

interface ActiveCampaignStatic {
  (
    action: "setAccount",
    accountId: string,
  ): void;
  (
    action: "setTrackByDefault",
    trackByDefault: boolean,
  ): void;
  (
    action: "process",
  ): void;

  q?: IArguments[];
  l?: number;
}

declare global {
  interface Window {
    vgo: ActiveCampaignStatic;
    visitorGlobalObjectAlias: "vgo";
  }
}

export interface ActiveCampaignPluginConfig {
  accountId: string;
  trackByDefault?: boolean;
}

interface Params {
  payload: {
    userId: string;
    traits: Metadata;
  };
  config: ActiveCampaignPluginConfig;
}

const scriptSrc = "https://diffuser-cdn.app-us1.com/diffuser/diffuser.js";

const activecampaignPlugin = (config: ActiveCampaignPluginConfig): AnalyticsPlugin => {
  const sharedConfig = {
    name: "activecampaign",
    config,
  };

  if (process.env.BROWSER) {
    return {
      ...sharedConfig,

      initialize({ config }: Params): void {
        if (!config.accountId)
          throw new Error("No ActiveCampaign accountId defined");

        (function(e, t, o, n: "vgo", r?: HTMLScriptElement, i?: HTMLScriptElement) { e.visitorGlobalObjectAlias = n; e[e.visitorGlobalObjectAlias] = e[e.visitorGlobalObjectAlias] || function() { (e[e.visitorGlobalObjectAlias].q = e[e.visitorGlobalObjectAlias].q || []).push(arguments) }; e[e.visitorGlobalObjectAlias].l = (new Date).getTime(); r = t.createElement("script"); r.src = o; r.async = true; i = t.getElementsByTagName("script")[0]; i?.parentNode?.insertBefore(r, i) })(window, document, scriptSrc, "vgo");

        window.vgo("setAccount", config.accountId);
        window.vgo("setTrackByDefault", config.trackByDefault ?? true);
        window.vgo("process");
      },

      loaded() {
        return isScriptLoaded(scriptSrc);
      },
    };
  } else {
    // TODO: Node API
    return sharedConfig;
  }
};

export default activecampaignPlugin;
