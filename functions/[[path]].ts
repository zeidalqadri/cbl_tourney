export const onRequest = {
  // Enable Node.js compatibility
  async fetch(request: Request, env: any, ctx: any) {
    // This enables nodejs_compat for all routes
    return env.ASSETS.fetch(request);
  }
};

// Export compatibility flags
export const compatibilityFlags = ['nodejs_compat'];