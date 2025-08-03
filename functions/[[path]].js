// This file enables nodejs_compat for all Pages Functions
export const onRequest = async (context) => {
  // Pass through to Next.js
  return context.env.ASSETS.fetch(context.request);
};

// Export configuration
export const config = {
  compatibilityFlags: ["nodejs_compat"],
  compatibilityDate: "2025-01-01"
};