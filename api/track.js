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

  // Only allow the whitelisted events; ignore everything else
  // Match DK events: DK_{day}start_click, DK_{day}end_click, DK_{day}completed_game, DK_{day}give_up_click, DK_{day}LK_click
  const isDKEvent = /^DK_\d+(start_click|end_click|completed_game|give_up_click|LK_click)$/.test(eventName);
  
  // Legacy events (without DK_ prefix)
  const isLegacyEvent = 
    eventName === 'start_click' ||
    eventName === 'end_click' ||
    eventName === 'completed_game' ||
    eventName === 'give_up_click';
  
  if (isDKEvent || isLegacyEvent) {
    const now = new Date();
    const copenhagenTime = now.toLocaleString('sv-SE', {
      timeZone: 'Europe/Copenhagen',
      hour12: false
    });
    // Log as structured JSON so it is easy to filter in Vercel Logs
    console.log(JSON.stringify({
      event: eventName,
      ts_utc: now.toISOString(),
      ts_cet: copenhagenTime
    }));
  }

  // Always return 204 to keep the request lightweight
  return new Response(null, { status: 204 });
}


