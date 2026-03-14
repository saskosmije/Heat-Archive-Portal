export function isFeatureEnabled(flag: string): boolean {
  const value = process.env[flag];
  return value === "true" || value === "1";
}

export function getPaymentRails(): string[] {
  const rails = process.env.FEATURE_PAYMENT_RAILS ?? "stripe";
  return rails.split(",").map((r) => r.trim()).filter(Boolean);
}

export function isDemoMode(): boolean {
  return isFeatureEnabled("FEATURE_DEMO_MODE");
}

export function isCryptoSimEnabled(): boolean {
  return isFeatureEnabled("FEATURE_CRYPTO_SIM");
}
