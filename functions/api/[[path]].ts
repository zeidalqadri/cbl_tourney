/**
 * Cloudflare Pages Function to proxy API requests to the Worker
 * This allows /api/* requests on the Pages domain to be handled by the Worker
 */

export async function onRequest(context: {
  request: Request;
  env: any;
  params: { path: string[] };
}): Promise<Response> {
  const { request, params } = context;
  
  // Construct the Worker URL
  const workerUrl = 'https://cbl-tourney-api.zeidalqadri.workers.dev';
  const apiPath = params.path ? params.path.join('/') : '';
  const url = new URL(request.url);
  
  // Forward the request to the Worker
  const workerRequest = new Request(
    `${workerUrl}/api/${apiPath}${url.search}`,
    {
      method: request.method,
      headers: request.headers,
      body: request.body,
    }
  );
  
  try {
    const response = await fetch(workerRequest);
    return response;
  } catch (error) {
    console.error('Error proxying to Worker:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to connect to API' }),
      {
        status: 502,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}