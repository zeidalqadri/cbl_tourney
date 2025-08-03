// Cloudflare Pages Function to replace Next.js API route
export async function onRequestGET(context: any) {
  // Simple health check for Pages deployment
  const results = {
    status: 'ok',
    deployment: 'cloudflare-pages',
    timestamp: new Date().toISOString(),
    message: 'API endpoint working on Cloudflare Pages',
    note: 'Database connections not available in static export mode'
  };

  return new Response(JSON.stringify(results, null, 2), {
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store, must-revalidate'
    }
  });
}