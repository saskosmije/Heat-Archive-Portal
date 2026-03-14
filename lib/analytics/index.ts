import type { AnalyticsEvent } from "./events";

interface TrackOptions {
  userId?: string;
  properties?: Record<string, unknown>;
}

export function track(event: AnalyticsEvent, options?: TrackOptions): void {
  // Stub implementation — replace with actual analytics provider
  if (process.env.NODE_ENV === "development") {
    console.log(`[Analytics] ${event}`, options?.properties ?? {});
  }

  // Future: send to analytics provider
  // const writeKey = process.env.ANALYTICS_WRITE_KEY;
  // if (writeKey) { ... }
}
