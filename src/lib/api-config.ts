/**
 * API Configuration for Cloudflare Worker endpoints
 */

// Determine API base URL based on environment
export function getApiUrl(): string {
  if (typeof window === 'undefined') {
    // Server-side rendering (shouldn't happen with static export)
    return ''
  }
  
  const hostname = window.location.hostname
  
  // Production URLs on Cloudflare Pages - Use relative path (Pages Function will proxy)
  if (hostname.includes('pages.dev')) {
    return ''  // Pages Function at /api/* will proxy to Worker
  }
  
  // Direct Worker access
  if (hostname.includes('workers.dev')) {
    return 'https://cbl-tourney-api.zeidalqadri.workers.dev'
  }
  
  // Local development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:8787'  // Wrangler dev server for local testing
  }
  
  // Custom domain - use relative path (assumes Pages Function proxy)
  return ''
}

export const API_BASE_URL = getApiUrl()