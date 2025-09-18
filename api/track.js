export const config = { runtime: 'edge' };

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response(null, { status: 405, headers: { Allow: 'POST' } });
  }

  let eventName = '';
  try {
    const body = await request.json();
    eventName = typeof body?.event === 'string' ? body.event : '';
  } catch (_) {
    // ignore invalid JSON
  }

  // Only allow the two whitelisted events; ignore everything else
  if (eventName === 'start_click' || eventName === 'end_click') {
    // Log as structured JSON so it is easy to filter in Vercel Logs
    console.log(JSON.stringify({ event: eventName, ts: new Date().toISOString() }));
  }

  // Always return 204 to keep the request lightweight
  return new Response(null, { status: 204 });
}


