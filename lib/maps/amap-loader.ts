'use client';

type AMapSecurityConfig = {
  securityJsCode?: string;
  serviceHost?: string;
};

export type AMapMapInstance = {
  add: (overlay: unknown) => void;
  destroy: () => void;
  getCenter?: () => AMapLngLatInstance;
  setCenter: (position: [number, number]) => void;
  on?: (eventName: string, handler: (event: unknown) => void) => void;
  off?: (eventName: string, handler: (event: unknown) => void) => void;
};

export type AMapLngLatInstance = {
  getLng?: () => number;
  getLat?: () => number;
  lng?: number;
  lat?: number;
};

export type AMapMarkerInstance = {
  setMap?: (map: unknown) => void;
  setPosition: (position: [number, number]) => void;
};

export type AMapGeocoderInstance = {
  getAddress: (
    location: [number, number],
    callback: (status: string, result: unknown) => void,
  ) => void;
};

export type AMapNamespace = {
  Map: new (
    container: string | HTMLElement,
    options?: Record<string, unknown>,
  ) => AMapMapInstance;
  Marker: new (options?: Record<string, unknown>) => AMapMarkerInstance;
  Geocoder: new (options?: Record<string, unknown>) => AMapGeocoderInstance;
};

declare global {
  interface Window {
    _AMapSecurityConfig?: AMapSecurityConfig;
  }
}

const AMAP_VERSION = "2.0";
const AMAP_DEFAULT_PLUGINS = ["AMap.Geocoder"];

let amapPromise: Promise<AMapNamespace> | null = null;

type AMapLoaderOptions = {
  key: string;
  version: string;
  plugins: string[];
};

type AMapLoaderModule = {
  default?: {
    load: (options: AMapLoaderOptions) => Promise<unknown>;
  };
  load?: (options: AMapLoaderOptions) => Promise<unknown>;
};

async function getAMapLoader() {
  const loaderModule =
    (await import("@amap/amap-jsapi-loader")) as AMapLoaderModule;
  const load = loaderModule.load ?? loaderModule.default?.load;

  if (!load) {
    throw new Error("AMap loader module did not expose a load() function.");
  }

  return {
    load,
  };
}

function getAMapRuntimeConfig() {
  const key = process.env.NEXT_PUBLIC_AMAP_KEY?.trim() ?? "";
  const securityJsCode =
    process.env.NEXT_PUBLIC_AMAP_SECURITY_JS_CODE?.trim() ?? "";
  const serviceHost = process.env.NEXT_PUBLIC_AMAP_SERVICE_HOST?.trim() ?? "";

  return {
    key,
    securityJsCode,
    serviceHost,
  };
}

export function getMissingAMapEnvVars() {
  const { key, securityJsCode, serviceHost } = getAMapRuntimeConfig();
  const missing: string[] = [];

  if (!key) {
    missing.push("NEXT_PUBLIC_AMAP_KEY");
  }

  if (!securityJsCode && !serviceHost) {
    missing.push("NEXT_PUBLIC_AMAP_SECURITY_JS_CODE or NEXT_PUBLIC_AMAP_SERVICE_HOST");
  }

  return missing;
}

export async function loadAMap() {
  if (typeof window === "undefined") {
    throw new Error("AMap can only be loaded in the browser.");
  }

  const { key, securityJsCode, serviceHost } = getAMapRuntimeConfig();
  const missing = getMissingAMapEnvVars();

  if (missing.length > 0) {
    throw new Error(`Missing AMap runtime config: ${missing.join(", ")}`);
  }

  window._AMapSecurityConfig = serviceHost
    ? { serviceHost }
    : { securityJsCode };

  if (!amapPromise) {
    amapPromise = getAMapLoader()
      .then((AMapLoader) =>
        AMapLoader.load({
          key,
          version: AMAP_VERSION,
          plugins: AMAP_DEFAULT_PLUGINS,
        }),
      )
      .then((AMap) => AMap as unknown as AMapNamespace)
      .catch((error) => {
        amapPromise = null;
        throw error;
      });
  }

  return amapPromise;
}
