// The few site-wide settings the admin can change in src/data/site.json.
export const SETTINGS = [
  { key: 'calendly', path: ['contact', 'calendly'], label: 'Calendly link (shows the Call button)', check: /^https:\/\/[^\s]+$/, hint: 'https://calendly.com/your-name/30min' },
  { key: 'whatsapp', path: ['contact', 'whatsapp'], label: 'WhatsApp number, digits only with country code', check: /^\d{8,15}$/, hint: '201005480636' },
  { key: 'ga4', path: ['analytics', 'ga4'], label: 'Google Analytics 4 measurement ID (turns analytics and the cookie notice on)', check: /^G-[A-Z0-9]{4,}$/, hint: 'G-XXXXXXXXXX' },
];
export const readSettings = (site) => Object.fromEntries(SETTINGS.map((s) => [s.key, s.path.reduce((o, k) => (o ? o[k] : undefined), site) || '']));
export function applySettings(site, values) {
  for (const s of SETTINGS) {
    if (!(s.key in values)) continue;
    const v = String(values[s.key] || '').trim();
    if (v && !s.check.test(v)) throw Object.assign(new Error(`${s.label}: not a valid value (example: ${s.hint})`), { status: 400 });
    let o = site;
    s.path.slice(0, -1).forEach((k) => { o = o[k] = o[k] || {}; });
    o[s.path[s.path.length - 1]] = v;
  }
  return site;
}
