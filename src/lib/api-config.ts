/**
 * API Configuration for Cloudflare Worker endpoints
 */

// Determine API base URL based on environment
export function getApiUrl(): string {
  if (typeof window === 'undefined') {
    // Server-side rendering (shouldn't happen with static export)
    return 'http://localhost:8787'
  }
  
  const hostname = window.location.hostname
  
  // Production URLs
  if (hostname.includes('pages.dev') || hostname.includes('workers.dev')) {
    // Use the same domain for API calls (handled by Worker routes)
    return ''
  }
  
  // Local development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:8787'  // Wrangler dev server
  }
  
  // Custom domain
  return ''
}

export const API_BASE_URL = getApiUrl()