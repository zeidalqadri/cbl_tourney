// Cloudflare Pages middleware for security headers and caching
export async function onRequest(context: any) {
  try {
    const response = await context.next();
    
    // Only set headers if response is successful
    if (response && response.headers) {
      // Security headers
      response.headers.set('X-Frame-Options', 'DENY');
      response.headers.set('X-Content-Type-Options', 'nosniff');
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
      response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
      
      // Cache control for different paths
      const url = new URL(context.request.url);
      
      if (url.pathname.startsWith('/_next/static/')) {
        // Static assets - cache for 1 year
        response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
      } else if (url.pathname.startsWith('/api/')) {
        // API routes - no cache
        response.headers.set('Cache-Control', 'no-store, must-revalidate');
      } else {
        // HTML pages - cache for 5 minutes
        response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=300, stale-while-revalidate=600');
      }
    }
    
    return response;
  } catch (error) {
    // If middleware fails, return a basic response
    return new Response('Internal Server Error', { 
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
        'X-Error': 'Middleware failed'
      }
    });
  }
}