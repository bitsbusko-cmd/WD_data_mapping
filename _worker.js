// Workday → Xpertis: wspólna baza decyzji na Cloudflare Pages (tryb zaawansowany, baza D1).
// Obsługuje adres /api.php tak samo jak api.php z hostingu PHP; pozostałe adresy to pliki strony.
// Ustawienia projektu Pages:
//   DB          – powiązanie z bazą D1 (Settings → Bindings → D1 database)
//   TEAM_DOMAIN – adres zespołu Cloudflare Access, np. https://saint-gobain-pl.cloudflareaccess.com
//   POLICY_AUD  – Application Audience (AUD) Tag aplikacji Access
//   TEAM_KEY    – (zamiast Access) hasło zespołu, co najmniej 10 znaków, jako sekret

const FIELDS = ['n', 't', 'fmt', 'det', 'note', 'why', 'fmtTouched', 'ts', 'by', 'ok', 'miss', 'notes', 'done'];
const ID_RE = /^\d{1,3}\|[fac]\|.{0,400}$/u;
let ready = false, jwks = null, jwksAt = 0;

const json = (status, body) => new Response(JSON.stringify(body), {
  status, headers: {'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff'}});

function mode(env) {
  if (env.TEAM_DOMAIN && env.POLICY_AUD) return 'access';
  if (typeof env.TEAM_KEY === 'string' && env.TEAM_KEY.length >= 10) return 'key';
  return '';
}

const b64u = s => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)), c => c.charCodeAt(0));

async function accessOk(request, env) {
  const token = request.headers.get('Cf-Access-Jwt-Assertion') || '';
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  let head, claims;
  try { head = JSON.parse(new TextDecoder().decode(b64u(parts[0]))); claims = JSON.parse(new TextDecoder().decode(b64u(parts[1]))); } catch (e) { return false; }
  if (head.alg !== 'RS256') return false;
  const team = env.TEAM_DOMAIN.replace(/\/+$/, '');
  if (!jwks || Date.now() - jwksAt > 3600e3) {
    const r = await fetch(team + '/cdn-cgi/access/certs');
    if (!r.ok) return false;
    jwks = (await r.json()).keys || []; jwksAt = Date.now();
  }
  const jwk = jwks.find(k => k.kid === head.kid);
  if (!jwk) { jwks = null; return false; }
  const key = await crypto.subtle.importKey('jwk', jwk, {name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256'}, false, ['verify']);
  const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64u(parts[2]), new TextEncoder().encode(parts[0] + '.' + parts[1]));
  if (!ok) return false;
  const now = Date.now() / 1000, aud = [].concat(claims.aud || []);
  return claims.iss === team && aud.includes(env.POLICY_AUD) && claims.exp > now && (!claims.nbf || claims.nbf <= now + 60);
}

function keyOk(request, env) {
  const a = new TextEncoder().encode(request.headers.get('X-Team-Key') || ''), b = new TextEncoder().encode(env.TEAM_KEY);
  if (a.length !== b.length) return false;
  let d = 0; for (let i = 0; i < a.length; i++) d |= a[i] ^ b[i];
  return d === 0;
}

async function setup(db) {
  if (ready) return;
  await db.batch([
    db.prepare('CREATE TABLE IF NOT EXISTS e (id TEXT PRIMARY KEY, sq INTEGER NOT NULL, ts TEXT NOT NULL, v TEXT NOT NULL)'),
    db.prepare('CREATE INDEX IF NOT EXISTS e_sq ON e (sq)')]);
  ready = true;
}

async function api(request, env) {
  const url = new URL(request.url), m = mode(env);
  if (url.searchParams.has('ping')) return json(200, {app: 'wd-xpertis', v: 1, configured: !!(m && env.DB), auth: m === 'access' ? 'access' : 'key'});
  if (!m || !env.DB) return json(503, {error: 'config'});
  if (m === 'access' ? !(await accessOk(request, env)) : !keyOk(request, env)) return json(401, {error: 'auth'});
  const db = env.DB;
  await setup(db);
  if (request.method === 'GET') {
    const since = Math.max(0, parseInt(url.searchParams.get('since') || '0', 10) || 0);
    const [rows, top] = await db.batch([
      db.prepare('SELECT id, v FROM e WHERE sq > ?1 ORDER BY sq').bind(since),
      db.prepare('SELECT COALESCE(MAX(sq), 0) AS seq FROM e')]);
    return json(200, {seq: top.results[0].seq, e: rows.results.map(r => [r.id, JSON.parse(r.v)])});
  }
  if (request.method !== 'POST') return json(405, {error: 'method'});
  const body = await request.text();
  if (body.length > 8 * 1024 * 1024) return json(413, {error: 'size'});
  let input; try { input = JSON.parse(body); } catch (e) { return json(400, {error: 'input'}); }
  if (!input || !Array.isArray(input.ch) || input.ch.length > 20000) return json(400, {error: 'input'});
  const stmts = [];
  const up = db.prepare(`INSERT INTO e (id, sq, ts, v) VALUES (?1, (SELECT COALESCE(MAX(sq), 0) + 1 FROM e), ?2, ?3)
    ON CONFLICT(id) DO UPDATE SET sq = excluded.sq, ts = excluded.ts, v = excluded.v WHERE excluded.ts > e.ts`);
  for (const c of input.ch) {
    if (!Array.isArray(c) || c.length !== 2) continue;
    const [id, v] = c;
    if (typeof id !== 'string' || !ID_RE.test(id) || !v || typeof v !== 'object' || Array.isArray(v)) continue;
    const clean = {};
    for (const f of FIELDS) if (f in v) {
      const x = v[f];
      if (typeof x === 'boolean' || Number.isInteger(x)) clean[f] = x;
      else if (typeof x === 'string') clean[f] = x.slice(0, 10000);
    }
    if (typeof clean.ts !== 'string' || clean.ts.length > 40) continue;
    stmts.push(up.bind(id, clean.ts, JSON.stringify(clean)));
  }
  let ok = 0;
  for (let i = 0; i < stmts.length; i += 100) {
    const res = await db.batch(stmts.slice(i, i + 100));
    res.forEach(r => { ok += (r.meta && r.meta.changes) || 0; });
  }
  return json(200, {ok});
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api.php' || url.pathname.endsWith('/api.php')) {
      try { return await api(request, env); } catch (e) { return json(500, {error: 'server'}); }
    }
    if (url.pathname.startsWith('/server/')) return new Response('Not found', {status: 404});
    return env.ASSETS.fetch(request);
  }
};
