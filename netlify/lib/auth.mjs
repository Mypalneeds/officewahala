// Dashboard password check. Set DASHBOARD_KEY in Netlify → Site configuration → Environment variables.
export function checkKey(req) {
  const want = (globalThis.Netlify && Netlify.env && Netlify.env.get('DASHBOARD_KEY')) || process.env.DASHBOARD_KEY || '';
  if (!want || want.length < 8) return 'not-configured';
  const got = req.headers.get('x-dashboard-key') || '';
  if (got.length !== want.length) return 'bad';
  let diff = 0;
  for (let i = 0; i < want.length; i++) diff |= want.charCodeAt(i) ^ got.charCodeAt(i);
  return diff === 0 ? 'ok' : 'bad';
}
