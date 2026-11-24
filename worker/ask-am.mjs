// Ask AM! worker (Cloudflare Workers). The site sends the visitor's question plus the best-matching passages from
// its own pages; this calls Claude with those passages and returns a short answer. The API key stays here, never in the site.
// Setup: see worker/README.md. Secrets: ANTHROPIC_API_KEY. Variables: ALLOWED_ORIGIN (https://abdelfattah.site), MODEL.
const SYSTEM = `You are "Ask AM!", the assistant on Abdelfattah Aboulfoutoh's personal website. He is an engineer, entrepreneur and creative (MSc.) based in Cairo.
Answer the visitor's question using ONLY the passages provided. Be warm, direct and brief (2 to 5 sentences). Reply in the visitor's language (English or Arabic).
If the passages do not contain the answer, say you do not have that on the site yet and suggest the contact page. Never invent facts, prices, dates or credentials.
You speak about Abdelfattah in the third person ("he"), as his assistant, unless asked who you are: you are Ask AM!, an AI assistant for his site.`;

export default {
  async fetch(request, env) {
    const origin = env.ALLOWED_ORIGIN || 'https://abdelfattah.site';
    const cors = { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', Vary: 'Origin' };
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (request.method !== 'POST' || request.headers.get('Origin') !== origin) return new Response('Forbidden', { status: 403, headers: cors });
    let b;
    try { b = await request.json(); } catch { return new Response('Bad request', { status: 400, headers: cors }); }
    const q = String(b.q || '').slice(0, 500);
    if (!q) return new Response('Bad request', { status: 400, headers: cors });
    const passages = (Array.isArray(b.passages) ? b.passages : []).slice(0, 6).map((p, i) => `[${i + 1}] ${String(p.t).slice(0, 120)} (${String(p.u).slice(0, 120)})\n${String(p.x).slice(0, 700)}`).join('\n\n');
    const history = (Array.isArray(b.history) ? b.history : []).slice(-6).map((h) => ({ role: h.r === 'assistant' ? 'assistant' : 'user', content: String(h.t).slice(0, 600) }));
    const messages = [...history, { role: 'user', content: `Passages from the site:\n\n${passages || '(none found)'}\n\nQuestion: ${q}` }];
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: env.MODEL || 'claude-haiku-5-5', max_tokens: 450, system: SYSTEM, messages }),
    });
    if (!r.ok) return new Response(JSON.stringify({ error: 'upstream' }), { status: 502, headers: { ...cors, 'Content-Type': 'application/json' } });
    const j = await r.json();
    const answer = (j.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('').trim();
    return new Response(JSON.stringify({ answer }), { headers: { ...cors, 'Content-Type': 'application/json' } });
  },
};
