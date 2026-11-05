(() => {
'use strict';
const D = JSON.parse(document.getElementById('data').textContent);
const VER = '{{VER}}';
const EN = JSON.parse(document.getElementById('en').textContent);
const LS = 'wdx:v1', LSL = 'wdx:lang';
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
const store = {get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }};
let LANG = (new URLSearchParams(location.search).get('lang') || store.get(LSL) || (navigator.language || 'pl').slice(0, 2)) === 'en' ? 'en' : 'pl';
const T = (s, v) => { let r = LANG === 'en' && EN[s] != null ? EN[s] : s; if (v) r = r.replace(/\{(\w+)\}/g, (m, k) => v[k] != null ? v[k] : m); return r; };
const IC = {
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  check: '<path d="M20 6 9 17l-5-5"/>', file: '<path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z"/><path d="M14 3v5h5"/>',
  warn: '<path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>', x: '<path d="M18 6 6 18M6 6l12 12"/>',
  sheet: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/>', dots: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17h.01"/>', save: '<path d="M12 3v12m0 0-4-4m4 4 4-4"/><path d="M4 17v3h16v-3"/>',
  load: '<path d="M12 15V3m0 0L8 7m4-4 4 4"/><path d="M4 17v3h16v-3"/>', trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  plus: '<path d="M12 5v14M5 12h14"/>', left: '<path d="m15 18-6-6 6-6"/>', right: '<path d="m9 18 6-6-6-6"/>', dot: '<circle cx="12" cy="12" r="4"/>', ring: '<circle cx="12" cy="12" r="7"/>'
};
const ic = n => `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">${IC[n]}</svg>`;

/* ---------- dane ---------- */
const FILES = {}; D.files.forEach(f => { FILES[f.id] = f; });
const PROCS = D.procs;
const PBY = {}; PROCS.forEach(p => { PBY[p.id] = p; });
const SEC = {Summary: ['Nagłówek pliku', 'File header'], Worker_Summary: ['Identyfikacja pracownika', 'Worker identification'], Effective_Change: ['Zmiana (zdarzenie)', 'Change (event)'],
  Worker_Status: ['Status zatrudnienia', 'Employment status'], Personal: ['Dane osobowe', 'Personal data'], Person_Communication: ['Dane kontaktowe', 'Contact details'],
  Person_Identification: ['Dokumenty i identyfikatory', 'Documents and identifiers'], Education: ['Wykształcenie', 'Education'], Related_Person: ['Członkowie rodziny', 'Family members'],
  Related_Person_Communication: ['Kontakt członka rodziny', 'Family member contact'], Related_Person_Identification: ['Identyfikatory członka rodziny', 'Family member identifiers'],
  Position: ['Stanowisko', 'Position'], Compensation: ['Wynagrodzenie', 'Compensation'], Compensation_Plans: ['Plany wynagrodzenia', 'Compensation plans'],
  Compensation_Earnings_and_Deductions: ['Składniki płacowe', 'Earnings and deductions'], Compensation_One_Time_Payment: ['Płatność jednorazowa', 'One-time payment'],
  Payment_Election: ['Rachunek do wypłaty', 'Payment election'], Employee_Contract: ['Umowa', 'Employee contract'], Collective_Agreement: ['Układ zbiorowy', 'Collective agreement'],
  Costing_Allocation: ['Alokacja kosztów', 'Costing allocation'], Union_Member: ['Związek zawodowy', 'Union membership'], Leave_of_Absence: ['Nieobecność długotrwała', 'Leave of absence'],
  Time_Off: ['Urlopy', 'Time off'], Time_Off_Earnings_and_Deductions: ['Składniki urlopowe', 'Time off earnings and deductions'], Additional_Information: ['Informacje dodatkowe', 'Additional information'],
  Transaction_Log: ['Dziennik transakcji', 'Transaction log'], Benefit_Elections: ['Świadczenia', 'Benefit elections'], Benefit_Earnings_and_Deductions: ['Składniki świadczeń', 'Benefit earnings and deductions'],
  Recruiting_Information: ['Rekrutacja', 'Recruiting information']};
const secName = s => SEC[s] ? SEC[s][LANG === 'en' ? 1 : 0] : s.replace(/_/g, ' ');
const TYPES = {
  text: ['Tekst', 'Text', 'tekst UTF-8', 'UTF-8 text'], code: ['Kod (lista wartości)', 'Code (list of values)', 'identyfikator referencyjny Workday, np. Hire_Employee_New_Hire_New_Position', 'Workday reference ID, e.g. Hire_Employee_New_Hire_New_Position'],
  id: ['Identyfikator', 'Identifier', 'identyfikator tekstowy', 'text identifier'], lz: ['Identyfikator z zerami wiodącymi', 'Identifier with leading zeros', 'tekst – nie konwertować na liczbę, zera wiodące mają znaczenie', 'text – do not convert to a number, leading zeros matter'],
  int: ['Liczba całkowita', 'Integer', 'liczba bez separatorów', 'number without separators'], dec: ['Liczba dziesiętna', 'Decimal', 'kropka dziesiętna, np. 173.33', 'decimal point, e.g. 173.33'],
  bool: ['Wartość logiczna', 'Boolean', '1 = tak, 0 = nie', '1 = yes, 0 = no'], date: ['Data', 'Date', 'RRRR-MM-DD ze strefą czasową, np. 2025-10-23-07:00', 'YYYY-MM-DD with time zone, e.g. 2025-10-23-07:00'],
  datetime: ['Data i czas', 'Date and time', 'RRRR-MM-DDThh:mm:ss.sss±hh:mm', 'YYYY-MM-DDThh:mm:ss.sss±hh:mm'], wid: ['WID', 'WID', '32 znaki szesnastkowe – identyfikator techniczny Workday', '32 hex characters – Workday technical identifier']};
const tName = t => TYPES[t] ? TYPES[t][LANG === 'en' ? 1 : 0] : T('nieznany (brak wartości w przykładzie)');
const tNote = t => TYPES[t] ? TYPES[t][LANG === 'en' ? 3 : 2] : '';
const FMT = [['txt', 'Tekst (podaj maks. długość)'], ['int', 'Liczba całkowita'], ['dec', 'Liczba dziesiętna (podaj precyzję)'], ['amt', 'Kwota (2 miejsca po przecinku)'],
  ['d1', 'Data RRRR-MM-DD (bez strefy czasowej)'], ['d2', 'Data DD.MM.RRRR'], ['dt', 'Data i czas'], ['yn', 'Tak / Nie (T/N)'], ['map', 'Kod ze słownika Xpertis (tabela mapowania)'],
  ['split', 'Podział na kilka pól Xpertis'], ['oth', 'Inny format (opisz)']];
const FMTBY = {}; FMT.forEach(f => { FMTBY[f[0]] = f[1]; });
const SUGGEST = {date: 'd1', datetime: 'dt', bool: 'yn', code: 'map', int: 'int', dec: 'dec', id: 'txt', lz: 'txt', text: 'txt', wid: 'txt'};
const DEC = {Y: 'Potrzebna', N: 'Niepotrzebna', Q: 'Do wyjaśnienia'};
const ADD = {Y: 'Dodać do PECI PL', N: 'Nie dodawać', Q: 'Do wyjaśnienia'};
const pName = p => p.n;
const pNo = p => String(p.id);
/* ikony procesów: Phosphor Icons (duotone, MIT) – wstawiane przy budowie */
{{PICONS}}const pIcon = p => `<span class="pt c-${PCAT[p.id] || 'job'}"><svg class="pi" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">${PICON[p.id]}</svg></span>`;
const homeIcon = () => `<span class="pt c-home"><svg class="pi" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">${PICON[0]}</svg></span>`;
const humanize = f => f.replace(/_/g, ' ');
const fLabel = e => LANG === 'en' ? humanize(e.f) : (e.pl || humanize(e.f));
const dictOf = e => e.di != null ? D.dict[e.di] : e.dd != null ? D.dict[e.dd] : null;
const scopeTxt = sc => sc === 'Y' ? T('w zakresie Chorus') : sc === 'N' ? T('poza zakresem Chorus') : sc ? T('zakres: {s}', {s: sc}) : T('zakres nieokreślony');

/* ---------- stan ---------- */
let S = {who: '', name: '', team: '', d: {}};
try { const raw = store.get(LS); if (raw) { const o = JSON.parse(raw); if (o && o.d) S = o; } } catch (e) {}
const V = {p: null, step: 1, q: '', flt: 'all', open: {}, dq: '', dscope: true, lflt: 'all', menu: false, modal: null};
const saveLocal = () => store.set(LS, JSON.stringify(S));
const save = () => { saveLocal(); if (SH.on && SH.ok) pushSoon(); };
const TEAMS = ['Xpertis', 'Chorus', 'Saint-Gobain'];
if (S.team === 'Workday') { S.team = 'Chorus'; S.who = S.name + ' · Chorus'; store.set(LS, JSON.stringify(S)); }
const known = () => !!(S.name && S.team);
const now = () => new Date().toISOString();
const pd = id => (S.d[id] = S.d[id] || {f: {}, a: {}, c: {}});
const stamp = o => { o.ts = now(); o.by = S.who || ''; return o; };
const dkey = i => 'd:' + i;

function stats(p) {
  const d = S.d[p.id] || {f: {}, a: {}, c: {}};
  const r = {n: p.fields.length, Y: 0, N: 0, Q: 0, und: 0, trY: 0, trN: 0, trU: 0, ref: 0, refU: 0, addY: 0, addQ: 0, addN: 0, done: !!(d.c && d.c.done), ok: d.c && d.c.ok};
  p.fields.forEach(e => { const x = d.f[e.k]; const v = x && x.n; if (v) r[v]++; else r.und++; if (v === 'Y') { if (x.t === 'Y') r.trY++; else if (x.t === 'N') r.trN++; else r.trU++; } });
  p.adds.forEach(e => { r.ref++; const x = d.a['r:' + e.k]; if (!x || !x.n) r.refU++; });
  r.addTrU = 0; r.addTrY = 0;
  r.addTrN = 0;
  Object.keys(d.a).forEach(k => { const x = d.a[k], v = x.n; if (v === 'Y') { r.addY++; if (x.t === 'Y') r.addTrY++; else if (x.t === 'N') r.addTrN++; else r.addTrU++; } else if (v === 'Q') r.addQ++; else if (v === 'N') r.addN++; });
  r.go = r.Y + r.addY; r.trDone = r.trY + r.trN + r.addTrY + r.addTrN; r.trAllU = r.trU + r.addTrU;
  const tot = r.n + r.ref + r.go, got = (r.n - r.und) + (r.ref - r.refU) + r.trDone;
  r.pct = r.done ? 1 : tot ? got / tot : 0; r.tot = tot; r.got = r.done ? tot : got;
  r.s1 = r.n + r.ref > 0 && r.und === 0 && r.refU === 0; r.s2 = r.s1 && r.go > 0 && r.trAllU === 0; r.started = got > 0 || !!(d.c && (d.c.ok || d.c.notes || d.c.miss));
  return r;
}

/* ---------- powiadomienia, okna ---------- */
function toast(msg) { const t = $('#toast'), d = document.createElement('div'); d.textContent = msg; t.appendChild(d); setTimeout(() => d.remove(), 3800); }
function openModal(kind, arg) { V.modal = {kind, arg}; renderModal(); }
function closeModal() { if (V.modal && V.modal.kind === 'who' && (!known() || needKey())) return; V.modal = null; renderModal(); }

/* ---------- wspólna baza: tryb wieloosobowy, gdy obok aplikacji działa api.php ---------- */
const LSK = 'wdx:key', POLL = 15000;
const SH = {on: false, cfg: true, ok: false, mode: 'key', key: store.get(LSK) || '', seq: 0, synced: {}, st: '', at: null, timer: null, poll: null, busy: false, again: false};
const needKey = () => SH.on && SH.cfg && !SH.ok && SH.mode !== 'access';
const eid = (pid, kind, k) => pid + '|' + kind + '|' + (k || '');
function entries() {
  const out = [];
  Object.keys(S.d).forEach(pid => { const d = S.d[pid];
    ['f', 'a'].forEach(kind => Object.keys(d[kind] || {}).forEach(k => { const v = d[kind][k]; if (v && v.ts) out.push([eid(pid, kind, k), v]); }));
    if (d.c && d.c.ts) out.push([eid(pid, 'c'), d.c]); });
  return out;
}
const dirty = () => entries().filter(([id, v]) => !SH.synced[id] || v.ts > SH.synced[id]);
function api(method, q, body) {
  const h = {'X-Team-Key': SH.key}; if (body) h['Content-Type'] = 'application/json';
  return fetch('api.php' + (q || ''), {method, cache: 'no-store', headers: h, body: body ? JSON.stringify(body) : undefined})
    .then(r => r.status === 401 ? Promise.reject(Object.assign(new Error('auth'), {auth: true})) : r.ok ? r.json() : Promise.reject(new Error('http ' + r.status)));
}
function syncChip() {
  if (!SH.on) return '';
  const L = {ok: [T('Wspólna baza'), SH.at ? T('Zsynchronizowano {t}. Kliknij, aby odświeżyć.', {t: SH.at.toLocaleTimeString(LANG === 'en' ? 'en-GB' : 'pl-PL')}) : ''],
    busy: [T('Synchronizacja…'), ''], pending: [T('Zapisywanie…'), ''], err: [T('Brak połączenia'), T('Zmiany są zapisane w tej przeglądarce i zostaną wysłane po odzyskaniu połączenia.')],
    auth: SH.mode === 'access' ? [T('Zaloguj się ponownie'), T('Sesja logowania wygasła. Kliknij, aby odświeżyć stronę.')] : [T('Podaj hasło zespołu'), T('Bez hasła zespołu decyzje nie trafiają do wspólnej bazy.')], config: [T('Serwer nieskonfigurowany'), T('Ustaw hasło zespołu w pliku config.php na serwerze.')]}[SH.st || 'busy'] || ['', ''];
  return `<button type="button" class="btn ghost sync s-${SH.st || 'busy'}" id="sync" data-act="sync" title="${esc(L[1] || L[0])}"><i class="dot" aria-hidden="true"></i><span class="t">${esc(L[0])}</span></button>`;
}
function setSync(st) { SH.st = st; if (st === 'ok') SH.at = new Date(); const el = $('#sync'); if (el) el.outerHTML = syncChip(); }
function applyRemote(list) {
  let n = 0;
  list.forEach(([id, v]) => { const i = id.indexOf('|'), j = id.indexOf('|', i + 1), pid = +id.slice(0, i), kind = id.slice(i + 1, j), k = id.slice(j + 1);
    if (!PBY[pid] || !v || !v.ts || !/^[fac]$/.test(kind)) return;
    const d = pd(pid), cur = kind === 'c' ? d.c : d[kind][k];
    SH.synced[id] = v.ts;
    if (!cur || !cur.ts || v.ts > cur.ts) { if (kind === 'c') d.c = v; else d[kind][k] = v; n++; } });
  return n;
}
async function pull() {
  const r = await api('GET', '?since=' + SH.seq);
  const n = applyRemote(r.e || []); SH.seq = r.seq || SH.seq;
  if (n) { saveLocal(); rerenderKeep(); }
  return n;
}
async function push() {
  const ch = dirty(); if (!ch.length) return 0;
  await api('POST', '', {ch});
  ch.forEach(([id, v]) => { SH.synced[id] = v.ts; });
  return ch.length;
}
async function sync() {
  if (!SH.on || !SH.ok) return;
  if (SH.busy) { SH.again = true; return; }
  SH.busy = true; clearTimeout(SH.timer); if (SH.st !== 'pending') setSync('busy');
  try { await push(); await pull(); setSync(dirty().length ? 'pending' : 'ok'); }
  catch (e) { if (e.auth && SH.mode === 'access') setSync('auth'); else if (e.auth) { SH.ok = false; SH.key = ''; store.set(LSK, ''); setSync('auth'); openModal('who'); } else setSync('err'); }
  finally { SH.busy = false; if (SH.again) { SH.again = false; sync(); } }
}
function pushSoon() { clearTimeout(SH.timer); if (SH.st !== 'err') setSync('pending'); SH.timer = setTimeout(sync, 700); }
function startPolling() {
  if (SH.poll) return;
  SH.poll = setInterval(() => { if (!document.hidden) sync(); }, POLL);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) sync(); });
  window.addEventListener('online', sync);
}
async function connect(key) {
  SH.key = key; SH.seq = 0; SH.synced = {};
  const r = await api('GET', '?since=0');
  applyRemote(r.e || []); SH.seq = r.seq || 0; SH.ok = true; store.set(LSK, key); saveLocal();
  render(); startPolling(); await sync();
}
async function detectShared() {
  if (location.protocol === 'file:' || /\.github\.io$/.test(location.hostname)) return;
  let j = null;
  try { const r = await fetch('api.php?ping', {cache: 'no-store'}); if (r.ok) j = await r.json(); } catch (e) { return; }
  if (!j || j.app !== 'wd-xpertis') return;
  SH.on = true; SH.cfg = !!j.configured;
  if (!SH.cfg) { SH.st = 'config'; renderTop(); return; }
  SH.st = 'busy'; renderTop();
  if (j.auth === 'access') {
    SH.mode = 'access';
    try { await connect(''); } catch (e) { SH.ok = !e.auth; if (SH.ok) startPolling(); setSync(e.auth ? 'auth' : 'err'); }
    return;
  }
  if (SH.key) {
    try { await connect(SH.key); return; }
    catch (e) { if (!e.auth) { SH.ok = true; startPolling(); setSync('err'); return; } SH.key = ''; store.set(LSK, ''); }
  }
  SH.st = 'auth'; renderTop(); openModal('who');
}

/* ---------- nawigacja ---------- */
function go(hash) { if (location.hash !== hash) location.hash = hash; else route(); }
function route() {
  const m = location.hash.match(/^#p\/(\d+)(?:\/(\d))?/);
  if (m && PBY[+m[1]] != null) { const id = +m[1]; if (V.p !== id) { V.q = ''; V.flt = 'all'; V.open = {}; V.dq = ''; } V.p = id; V.step = m[2] ? Math.min(3, Math.max(1, +m[2])) : 1; }
  else V.p = null;
  V.menu = false;
  render(); window.scrollTo(0, 0);
  if (SH.ok) sync();
}

/* ---------- nagłówek ---------- */
function renderTop() {
  const nav = PROCS.map(p => { const s = stats(p); const cls = [s.done ? 'done' : s.started ? 'prog' : '', !p.std ? 'nofile' : '', V.p === p.id ? 'cur' : ''].join(' ');
    const sub = [p.files.length ? T(p.files.length === 1 ? '1 plik PL' : '{n} pliki PL', {n: p.files.length}) : T('brak pliku PL'), s.done ? T('Zakończony') : s.started ? T('W toku') + ' · ' + Math.round(s.pct * 100) + '%' : T('Nie rozpoczęty')].join(' · ');
    return `<a href="#p/${p.id}" class="${cls}" data-tip="${esc(pNo(p) + '. ' + pName(p))}" data-tip2="${esc(sub)}" aria-label="${esc(pNo(p) + '. ' + pName(p))}"${V.p === p.id ? ' aria-current="page"' : ''}>${pIcon(p)}<span class="pn">${pNo(p)}</span>${s.done ? `<b class="ok" aria-hidden="true">${ic('check')}</b>` : `<i style="width:${Math.round(s.pct * 100)}%"></i>`}</a>`; }).join('');
  $('#top').innerHTML = `<div class="topin">
    <a class="brand" href="#start"><span class="mk" aria-hidden="true"><i></i><i></i><i></i></span><span><b>Workday → Xpertis</b><span>${esc(T('Analiza danych wejściowych'))} · ${esc(T('wersja {v}', {v: VER}))}</span></span></a>
    <span class="grow"></span>
    <div class="tools">
      ${syncChip()}
      ${known() ? `<button type="button" class="btn ghost user" data-act="who" title="${esc(T('Zmień imię lub zespół'))}">${ic('user')}<span class="t">${esc(S.name)} <small>${esc(S.team)}</small></span></button>` : ''}
      <div class="seg" role="group" aria-label="Język / Language"><button type="button" data-act="lang" data-v="pl" aria-pressed="${LANG === 'pl'}">PL</button><button type="button" data-act="lang" data-v="en" aria-pressed="${LANG === 'en'}">EN</button></div>
      <button type="button" class="btn pri" data-act="xlsx">${ic('sheet')}<span class="t">${esc(T('Raport Excel'))}</span></button>
      <div class="menu"><button type="button" class="btn icon" data-act="menu" aria-expanded="${V.menu}" aria-label="${esc(T('Ustalenia'))}" title="${esc(T('Ustalenia'))}">${ic('dots')}</button>
        <div class="pop" ${V.menu ? '' : 'hidden'}>
          <button type="button" data-act="save">${ic('save')}<span>${esc(T('Zapisz ustalenia do pliku'))}<small>${esc(T('Plik JSON do przekazania innym osobom'))}</small></span></button>
          <button type="button" data-act="load">${ic('load')}<span>${esc(T('Wczytaj ustalenia z pliku'))}<small>${esc(T('Nowsze wpisy zastępują starsze'))}</small></span></button>
          ${SH.on ? '' : `<hr><button type="button" data-act="reset">${ic('trash')}<span>${esc(T('Wyczyść wszystkie ustalenia'))}<small>${esc(T('Tylko w tej przeglądarce'))}</small></span></button>`}
        </div></div>
      <button type="button" class="btn icon ghost" data-act="help" aria-label="${esc(T('Pomoc'))}" title="${esc(T('Pomoc'))}">${ic('help')}</button>
    </div></div>
    <nav class="pnav" aria-label="${esc(T('Procesy'))}"><a href="#start" class="home${V.p == null ? ' cur' : ''}" data-tip="${esc(T('Przegląd'))}" data-tip2="${esc(T('Wszystkie procesy i postęp analizy'))}" aria-label="${esc(T('Przegląd'))}">${homeIcon()}<span class="pn">${esc(T('Start'))}</span></a><span class="sep" aria-hidden="true"></span>${nav}</nav>`;
  const cur = $('.pnav a.cur'); if (cur && cur.scrollIntoView) { const n = $('.pnav'); if (n.scrollWidth > n.clientWidth) n.scrollLeft = cur.offsetLeft - n.clientWidth / 2; }
}

/* ---------- lista procesów ---------- */
function stIcon(s) { return s.done ? ic('check') : s.started ? ic('dot') : ic('ring'); }
function listFilter(p) { const s = stats(p); return V.lflt === 'all' || (V.lflt === 'file' && p.std) || (V.lflt === 'nofile' && !p.std) || (V.lflt === 'open' && !s.done); }
function renderSide() {
  const done = PROCS.filter(p => stats(p).done).length;
  const items = PROCS.filter(listFilter).map(p => { const s = stats(p);
    const meta = p.files.length ? T(p.files.length === 1 ? '1 plik PL' : '{n} pliki PL', {n: p.files.length}) : T('brak pliku PL');
    return `<li><a href="#p/${p.id}" class="${V.p === p.id ? 'cur' : ''} ${s.done ? 'done' : ''}"${V.p === p.id ? ' aria-current="page"' : ''}><span class="no">${pIcon(p)}<b>${pNo(p)}</b></span><span class="nm">${esc(pName(p))}</span><span class="st" aria-hidden="true">${stIcon(s)}</span><span class="meta">${esc(meta)}<span class="bar"><i style="width:${Math.round(s.pct * 100)}%"></i></span></span></a></li>`; }).join('');
  const f = [['all', 'Wszystkie'], ['open', 'Niezakończone'], ['file', 'Z plikiem PL'], ['nofile', 'Bez pliku']];
  $('#side').innerHTML = `<h2>${esc(T('Procesy'))}</h2><div class="sub">${esc(T('Zakończone: {a} z {b}', {a: done, b: PROCS.length}))}</div>
    <div class="filters" role="group">${f.map(x => `<button type="button" class="chipbtn" data-act="lflt" data-v="${x[0]}" aria-pressed="${V.lflt === x[0]}">${esc(T(x[1]))}</button>`).join('')}</div>
    <ul class="plist">${items || `<li class="empty sm">${esc(T('Brak procesów dla tego filtra.'))}</li>`}</ul>`;
}
const mobileSelect = () => `<select class="inp mselect" data-act="jump" aria-label="${esc(T('Proces'))}"><option value="start">${esc(T('Start'))}</option>${PROCS.map(p => `<option value="${p.id}"${V.p === p.id ? ' selected' : ''}>${pNo(p)} · ${esc(pName(p))}${stats(p).done ? ' ✓' : ''}</option>`).join('')}</select>`;

/* ---------- start ---------- */
function overall() {
  const all = PROCS.map(stats), tot = all.reduce((a, s) => a + s.tot, 0), got = all.reduce((a, s) => a + s.got, 0);
  const pct = tot ? Math.floor(got / tot * 100) : 0, done = all.filter(s => s.done).length, prog = all.filter(s => s.started && !s.done).length;
  return `<div class="overall${done === PROCS.length ? ' full' : ''}"><div class="oh"><b>${esc(T('Kompletność analizy'))}</b><span class="pc">${pct}%</span></div>
    <div class="obar" role="progressbar" aria-label="${esc(T('Kompletność analizy'))}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><i style="width:${tot ? got / tot * 100 : 0}%"></i></div>
    <div class="sm muted">${esc(T('Zatwierdzone: {a} z {b} procesów · w toku: {c} · decyzje: {d} z {e}', {a: done, b: PROCS.length, c: prog, d: got.toLocaleString(LANG === 'en' ? 'en-GB' : 'pl-PL'), e: tot.toLocaleString(LANG === 'en' ? 'en-GB' : 'pl-PL')}))}</div></div>`;
}
function renderStart() {
  const next = PROCS.find(p => !stats(p).done) || PROCS[0];
  const rows = PROCS.map(p => { const s = stats(p);
    const status = s.done ? `<span class="tag" style="background:var(--need-bg);color:var(--need)">${esc(T('Zakończony'))}</span>` : s.started ? `<span class="tag t">${esc(T('W toku'))}</span>` : `<span class="tag">${esc(T('Nie rozpoczęty'))}</span>`;
    const src = p.files.length ? esc(p.files.map(f => FILES[f[0]].n + (f[1] ? ' (Sequence ' + f[1].join(', ') + ')' : '')).join(', ')) : `<span class="tag out">${esc(T('brak pliku PL'))}</span>`;
    return `<tr class="click" data-act="open" data-p="${p.id}"><td class="mono">${pNo(p)}</td><td><span class="pcell">${pIcon(p)}<b>${esc(pName(p))}</b></span></td><td class="sm">${esc(p.ev)}</td><td class="sm">${src}</td><td class="n">${p.std ? s.n : '–'}</td><td class="n">${p.adds.length}</td><td class="n">${s.addY}</td><td>${status}</td></tr>`; }).join('');
  return `<div class="card start">${mobileSelect()}
    <div class="dash"><h1>${esc(T('Status'))}</h1>
    <div class="acts"><a class="btn pri" href="#p/${next.id}">${esc(stats(next).started ? T('Kontynuuj: proces {n}', {n: pNo(next)}) : T('Zacznij od procesu {n}', {n: pNo(next)}))}</a></div></div>
    ${overall()}
    <div class="tblwrap"><table class="ov"><thead><tr><th>${esc(T('Nr'))}</th><th>${esc(T('Proces'))}</th><th>${esc(T('Kody zdarzeń'))}</th><th>${esc(T('Plik PECI PL'))}</th><th class="n">${esc(T('Standard PL'))}</th><th class="n">${esc(T('Opcjonalne w xlsm'))}</th><th class="n">${esc(T('Do dodania'))}</th><th>${esc(T('Status'))}</th></tr></thead><tbody>${rows}</tbody></table></div>
  </div>`;
}

/* ---------- proces ---------- */
function evChips(p) {
  if (!p.ev) return '';
  return p.ev.split(/\s*\+\s*/).map(c => { const k = c.trim().replace(/^TER-C$/, 'TERM-C'); const e = D.events[k];
    return `<span class="ev"><span class="code" title="${esc(e ? (LANG === 'en' ? e[1] : e[0]) : '')}">${esc(k)}</span>${e ? `<span class="muted">${esc(LANG === 'en' ? e[1] : e[0])}</span>` : ''}</span>`; }).join('');
}
function fileChips(p) {
  return p.files.map(([id, seqs]) => { const f = FILES[id];
    return `<button type="button" class="fchip" data-act="file" data-f="${id}" title="${esc(T('Pokaż zawartość pliku'))}">${ic('file')}${esc(f.n)}${seqs ? `<span class="q">Sequence ${esc(seqs.join(', '))}</span>` : ''}</button>`; }).join(' ');
}
function renderHead(p) {
  const s = stats(p);
  let notes = '';
  if (!p.std) notes = `<div class="note warn">${ic('warn')}<span>${esc(T('Brak pliku PECI dla Polski, więc ten proces nie ma standardu PL. Analizujesz tylko dane opcjonalne z PECI_XML_Sections_fields.xlsm.'))}</span></div>`;
  if (!p.ref) notes += `<div class="note info">${ic('info')}<span>${esc(T('Arkusz {n} w PECI_XML_Sections_fields.xlsm jest pusty – w kroku 1 są tylko pola z arkusza PECI Dictionary w sekcjach tego procesu.', {n: p.id}))}</span></div>`;
  const fnotes = p.files.map(([id]) => FILES[id].note ? `<li><b>${esc(FILES[id].n)}</b>: ${esc(LANG === 'en' ? FILES[id].note[1] : FILES[id].note[0])}</li>` : '').join('');
  const dl = (p.dadd || []).length;
  return `<div class="phead">${mobileSelect()}
    ${s.done ? `<div class="kick"><span class="tag" style="background:var(--need-bg);color:var(--need)">${ic('check')}${esc(T('Zakończony'))}</span></div>` : ''}
    <h2><span class="hic">${pIcon(p)}</span><span class="mono muted" style="font-size:.75em">${pNo(p)}</span> ${esc(pName(p))}</h2>
    <div class="facts">${evChips(p)}</div>
    <div class="split">
      <div class="half std"><b>${esc(T('Standard PL'))}</b><span>${p.std ? esc(T('{n} danych w pliku PECI dla Polski', {n: p.fields.length})) : esc(T('brak pliku PECI dla Polski'))}</span>${p.files.length ? `<div class="fl">${fileChips(p)}</div>` : ''}</div>
      <div class="half add"><b>${esc(T('Dane opcjonalne'))}</b><span>${esc(T('{a} z przykładu procesu w PECI_XML_Sections_fields.xlsm', {a: p.adds.length}))}${dl ? ' · ' + esc(T('{b} pól z arkusza PECI Dictionary', {b: dl})) : ''}</span></div>
    </div>
    ${fnotes ? `<ul class="sm muted" style="margin:-4px 0 12px;padding-left:18px">${fnotes}</ul>` : ''}${notes}</div>`;
}
function renderSteps(p) {
  const s = stats(p);
  const st = [[1, 'Kompletność danych', s.n + s.ref ? T('{a} z {b}', {a: s.n - s.und + s.ref - s.refU, b: s.n + s.ref}) : '–', s.s1], [2, 'Transformacja', s.go ? T('{a} z {b}', {a: s.trDone, b: s.go}) : '–', s.s2],
    [3, 'Potwierdzenie', '', s.done]];
  return `<div class="steps" role="tablist">${st.map(x => `<button type="button" role="tab" data-act="step" data-v="${x[0]}" aria-selected="${V.step === x[0]}" class="${x[3] ? 'ok' : ''}"><span class="k">${x[3] ? ic('check') : x[0]}</span>${esc(T(x[1]))}${x[2] ? ` <span class="c">${esc(x[2])}</span>` : ''}</button>`).join('')}</div>`;
}
const decBtns = (k, cur, map, cls, kind, small) => `<div class="dec${small ? ' sm' : ''}" role="group">${Object.keys(map).map((v, i) => `<button type="button" class="${cls[i]}" data-act="${kind}" data-k="${esc(k)}" data-v="${v}" aria-pressed="${cur === v}">${esc(T(map[v]))}</button>`).join('')}</div>`;
const vals = e => (e.v || []).slice(0, 3).map(v => `<code class="val">${esc(v)}</code>`).join('') + (e.mk ? `<span class="tag out" title="${esc(T('Wartości osobowe zamaskowane: A/a – litera, 9 – cyfra'))}">${esc(T('zamaskowane'))}</span>` : '');
const FLT = {A: 'isAdded', U: 'isUpdated', D: 'isDeleted', P: 'priorValue', a: 'nowy rekord', d: 'usunięty rekord'};
const flagTags = e => (e.fl || '').split('').filter(c => FLT[c]).map(c => `<span class="tag chg" title="${esc(T('Atrybut zmiany w pliku PECI'))}">${esc(T(FLT[c]))}</span>`).join('');
const pathHtml = e => `${esc(e.s)}${e.u ? ' › ' + esc(e.u) : ''} › <b>${esc(e.f)}</b>`;
const match = (e, q) => !q || [e.f, e.pl, e.k, e.u, e.s, (dictOf(e) || {}).d].some(x => x && String(x).toLowerCase().includes(q));
const SECORD = Object.keys(SEC);
function groupBySec(list) { const g = []; const by = {}; list.forEach(e => { if (!by[e.s]) { by[e.s] = {s: e.s, items: []}; g.push(by[e.s]); } by[e.s].items.push(e); }); const o = s => { const i = SECORD.indexOf(s); return i < 0 ? 99 : i; }; return g.sort((a, b) => o(a.s) - o(b.s)); }
function moreHtml(e, extra) {
  const d = dictOf(e) || (e.dd != null ? D.dict[e.dd] : null);
  const files = (e.fs || []).map(id => FILES[id] ? FILES[id].n : id).join(', ');
  return `<div class="more"><dl>
      <dt>${esc(T('Opis Workday'))}</dt><dd>${d && d.d ? esc(d.d) : `<span class="faint">${esc(T('brak opisu w PECI Dictionary'))}</span>`}</dd>
      ${e.en && LANG === 'en' ? '' : e.en ? `<dt>${esc(T('Opis'))}</dt><dd>${esc(e.en)}</dd>` : ''}
      <dt>${esc(T('Typ w PECI'))}</dt><dd>${esc(tName(e.t))}${e.t ? ` – <span class="muted">${esc(tNote(e.t))}</span>` : ''}</dd>
      <dt>PECI Dictionary</dt><dd>${d ? esc(scopeTxt(d.sc)) + (d.m ? ' · ' + esc(T('wartość mapowana w Workday (Mapped_Value)')) : '') : '–'}</dd>
      ${files ? `<dt>${esc(T('Pliki PL'))}</dt><dd>${esc(files)}</dd>` : ''}
      ${e.o === 'ref' ? `<dt>${esc(T('Źródło'))}</dt><dd>${esc(T('przykład procesu w PECI_XML_Sections_fields.xlsm'))}</dd>` : ''}
    </dl><div>${extra || ''}</div></div>`;
}
const stdLine = e => { const fs = (e.fs || []).map(id => FILES[id] ? FILES[id].n : id);
  return `<div class="srcl std" title="${esc(T('Dana w pliku PECI dla Polski: {f}', {f: fs.join(', ')}))}">${ic('check')}<b>${esc(T('Standard PL'))}</b><span>${esc(fs.join(', '))}</span></div>`; };
const addLine = (p, e) => `<div class="srcl opt">${ic('plus')}<b>${esc(T('Dane opcjonalne'))}</b><span>${esc(e.dd != null ? T('arkusz PECI Dictionary') : T('arkusz procesu {n} w xlsm', {n: p.id}))}</span></div>`;
function fieldRow(p, e) {
  const x = (S.d[p.id] && S.d[p.id].f[e.k]) || {};
  const open = V.open[e.k];
  const note = `<label class="sm muted" for="n-${esc(e.k)}">${esc(T('Uwagi do danej'))}</label><textarea class="inp" id="n-${esc(e.k)}" data-act="fnote" data-k="${esc(e.k)}" rows="2">${esc(x.note || '')}</textarea>`;
  return `<div class="row k-std${x.n === 'N' ? ' dim' : ''}" data-k="${esc(e.k)}">
    <div class="fn"><div class="lb">${esc(fLabel(e))}</div><div class="px">${pathHtml(e)}</div>${stdLine(e)}<button type="button" class="lnk" data-act="more" data-k="${esc(e.k)}" aria-expanded="${!!open}">${esc(T(open ? 'Ukryj szczegóły' : 'Szczegóły'))}</button></div>
    <div class="ex"><span class="tag t">${esc(tName(e.t))}</span>${vals(e)}${flagTags(e)}</div>
    ${decBtns(e.k, x.n, DEC, ['y', 'n', 'q'], 'need')}
    ${open ? moreHtml(e, note) : ''}</div>`;
}
function filterBar(counts, kinds) {
  return `<div class="bar2"><input class="inp" type="search" data-act="q" value="${esc(V.q)}" placeholder="${esc(T('Szukaj pola'))}" aria-label="${esc(T('Szukaj pola'))}">
    ${kinds.map(k => `<button type="button" class="chipbtn" data-act="flt" data-v="${k[0]}" aria-pressed="${V.flt === k[0]}">${esc(T(k[1]))} ${counts[k[0]] != null ? counts[k[0]] : ''}</button>`).join('')}</div>`;
}
const dictItems = p => (p.dadd || []).map(i => { const x = D.dict[i]; return {k: dkey(i), dd: i, s: x.s, u: x.u.replace(/ /g, '_'), f: x.f.replace(/ /g, '_'), pl: x.pl, t: '', v: [], sc: x.sc}; });
function dictBlock(p, open) {
  const d = pd(p.id), q = V.dq.trim().toLowerCase(), dl = dictItems(p);
  if (!dl.length) return '';
  const inScope = dl.filter(e => e.sc !== 'N').length;
  const shown = dl.filter(e => (!V.dscope || e.sc !== 'N' || (d.a[e.k] && d.a[e.k].n)) && (!q || [e.f, e.pl, e.u, e.s, D.dict[e.dd].d].some(z => z && String(z).toLowerCase().includes(q))));
  const decided = dl.filter(e => d.a[e.k] && d.a[e.k].n).length;
  return `<details class="dict" ${open || V.dictOpen || decided ? 'open' : ''} data-act="dict"><summary>${esc(T('Pozostałe pola z arkusza PECI Dictionary w sekcjach tego procesu'))} <small>${esc(T('{a} pól, w tym {b} w zakresie Chorus · decyzja opcjonalna', {a: dl.length, b: inScope}))}</small></summary><div class="inner">
    <div class="bar2"><input class="inp" type="search" data-act="dq" value="${esc(V.dq)}" placeholder="${esc(T('Szukaj w PECI Dictionary'))}" aria-label="${esc(T('Szukaj w PECI Dictionary'))}"><label class="sm" style="display:flex;gap:6px;align-items:center"><input type="checkbox" data-act="dscope" ${V.dscope ? 'checked' : ''}>${esc(T('Tylko pola w zakresie Chorus'))}</label><span class="sm muted">${esc(T('Pokazano {a} z {b}', {a: shown.length, b: dl.length}))}</span></div>
    ${groupBySec(shown).map(g => `<section class="sec"><div class="sech"><h3>${esc(secName(g.s))} <code>${esc(g.s)}</code></h3></div>${g.items.map(e => addRow(p, e, e.k, true)).join('')}</section>`).join('') || `<div class="empty">${esc(T('Brak pól dla tego wyszukiwania.'))}</div>`}</div></details>`;
}
function paneData(p) {
  const s = stats(p), d = pd(p.id), q = V.q.trim().toLowerCase();
  if (!p.fields.length && !p.adds.length) return `<div class="note info">${ic('info')}<span>${esc(T('Proces nie ma pliku PECI dla Polski, a jego arkusz w PECI_XML_Sections_fields.xlsm jest pusty. Do wyboru są tylko pola z arkusza PECI Dictionary.'))}</span></div>` + dictBlock(p, true);
  const dec = e => e.kind === 'opt' ? (d.a['r:' + e.k] || {}).n : (d.f[e.k] || {}).n;
  const all = p.fields.map(e => Object.assign({kind: 'std'}, e)).concat(p.adds.map(e => Object.assign({kind: 'opt'}, e)));
  const f = V.flt;
  const list = all.filter(e => match(e, q) && (f === 'all' || (f === 'std' && e.kind === 'std') || (f === 'opt' && e.kind === 'opt') || (f === 'U' && !dec(e)) || (/^[YNQ]$/.test(f) && e.kind === 'std' && dec(e) === f)));
  const legend = `<div class="legend"><span class="lg std">${ic('check')}<b>${esc(T('Standard PL'))}</b> ${esc(T('dane z pliku PECI dla Polski'))}</span><span class="lg opt">${ic('plus')}<b>${esc(T('Dane opcjonalne'))}</b> ${esc(T('dane z arkusza procesu w PECI_XML_Sections_fields.xlsm, których nie ma w standardzie'))}</span></div>`;
  const intro = `<div class="intro"><p>${esc(p.std ? T('Dla danych ze standardu PL zaznacz, czy Xpertis ich potrzebuje. Dla danych opcjonalnych – czy plik PECI dla Polski trzeba o nie uzupełnić.') : T('Ten proces nie ma pliku PECI dla Polski, więc nie ma standardu PL. Dla danych opcjonalnych zaznacz, czy plik PECI dla Polski trzeba o nie uzupełnić.'))}</p>
    ${s.und ? `<button type="button" class="btn sm" data-act="bulk" data-v="Y">${esc(T('Oznacz pozostałe ze standardu ({n}) jako potrzebne', {n: s.und}))}</button>` : ''}</div>`;
  const groups = groupBySec(list).map(g => {
    const std = g.items.filter(e => e.kind === 'std'), opt = g.items.filter(e => e.kind === 'opt');
    const und = std.filter(e => !dec(e)).length;
    const cnt = [std.length ? `<span class="tag std">${esc(T('Standard PL'))} ${std.length}</span>` : '', opt.length ? `<span class="tag addt">${esc(T('Dane opcjonalne'))} ${opt.length}</span>` : ''].join('');
    return `<section class="sec"><div class="sech"><h3>${esc(secName(g.s))} <code>${esc(g.s)}</code>${cnt}</h3><div class="bulk">${und ? `${esc(T('Standard bez decyzji: {n}', {n: und}))} <button type="button" class="btn sm" data-act="bulksec" data-s="${esc(g.s)}" data-v="Y">${esc(T('Wszystkie potrzebne'))}</button><button type="button" class="btn sm" data-act="bulksec" data-s="${esc(g.s)}" data-v="N">${esc(T('Wszystkie niepotrzebne'))}</button>` : ''}</div></div>${std.map(e => fieldRow(p, e)).join('')}${opt.map(e => addRow(p, e, 'r:' + e.k)).join('')}</section>`; }).join('');
  return legend + intro + filterBar({all: all.length, std: s.n, opt: s.ref, U: s.und + s.refU, Y: s.Y, N: s.N, Q: s.Q}, [['all', 'Wszystkie'], ['std', 'Standard PL'], ['opt', 'Dane opcjonalne'], ['U', 'Bez decyzji'], ['Y', 'Potrzebne'], ['N', 'Niepotrzebne'], ['Q', 'Do wyjaśnienia']]) + (groups || `<div class="empty">${esc(T('Brak danych dla tego filtra.'))}</div>`) + dictBlock(p);
}
function trRow(p, e, kind, key) {
  const d = pd(p.id), x = (kind === 'std' ? d.f[key] : d.a[key]) || {};
  const sel = FMT.map(f => `<option value="${f[0]}"${x.fmt === f[0] ? ' selected' : ''}>${esc(T(f[1]))}</option>`).join('');
  const sug = SUGGEST[e.t];
  const trx = x.t === 'Y' ? `<div class="trx"><select class="inp" data-act="fmt" data-kind="${kind}" data-k="${esc(key)}" aria-label="${esc(T('Format w Xpertis'))}"><option value="">${esc(T('Wybierz format w Xpertis'))}</option>${sel}</select>
      <input class="inp" data-act="det" data-kind="${kind}" data-k="${esc(key)}" value="${esc(x.det || '')}" placeholder="${esc(T('Szczegóły: długość, słownik, reguła przekształcenia'))}" aria-label="${esc(T('Szczegóły formatu'))}">
      ${sug && x.fmt === sug && !x.fmtTouched ? `<div class="hint">${esc(T('Podpowiedź na podstawie typu w PECI – zmień, jeśli w Xpertis jest inaczej.'))}</div>` : ''}</div>` : '';
  const btns = `<div class="dec" role="group">${[['N', 'Bez zmian', 'y'], ['Y', 'Transformacja', 'tr']].map(([v, l, c]) => `<button type="button" class="${c}" data-act="tr" data-kind="${kind}" data-k="${esc(key)}" data-v="${v}" aria-pressed="${x.t === v}">${esc(T(l))}</button>`).join('')}</div>`;
  return `<div class="row ${kind === 'std' ? 'k-std' : 'k-opt'}" data-k="${esc(key)}">
    <div class="fn"><div class="lb">${esc(fLabel(e))}</div><div class="px">${pathHtml(e)}</div>${kind === 'std' ? stdLine(e) : addLine(p, e)}</div>
    <div class="peci">${e.t ? `<b>${esc(tName(e.t))}</b> – ${esc(tNote(e.t))}` : `<span class="muted">${esc(T('typ ustal z zespołem Workday (brak wartości w przykładzie)'))}</span>`}<div class="ex" style="margin-top:4px">${vals(e)}</div></div>
    ${btns}${trx}</div>`;
}
function paneTr(p) {
  const s = stats(p), d = pd(p.id), q = V.q.trim().toLowerCase();
  const stdL = p.fields.filter(e => d.f[e.k] && d.f[e.k].n === 'Y').map(e => ({e, kind: 'std', key: e.k}));
  const optL = p.adds.filter(e => d.a['r:' + e.k] && d.a['r:' + e.k].n === 'Y').map(e => ({e, kind: 'opt', key: 'r:' + e.k}))
    .concat(dictItems(p).filter(e => d.a[e.k] && d.a[e.k].n === 'Y').map(e => ({e, kind: 'opt', key: e.k})));
  const all = stdL.concat(optL);
  if (!all.length) return `<div class="empty"><b>${esc(T('Najpierw wskaż dane w kroku 1'))}</b>${esc(T('Transformację określamy dla danych ze standardu oznaczonych jako potrzebne i dla danych opcjonalnych do dodania do PECI PL.'))}<div style="margin-top:12px"><button type="button" class="btn" data-act="step" data-v="1">${esc(T('Przejdź do kroku 1'))}</button></div></div>`;
  const st = it => ((it.kind === 'std' ? d.f[it.key] : d.a[it.key]) || {}).t;
  const list = all.filter(it => match(it.e, q) && (V.flt === 'all' || (V.flt === 'U' ? !st(it) : st(it) === V.flt)));
  const intro = `<div class="intro"><p>${esc(T('Dla danych, które trafią do Xpertis – potrzebnych ze standardu PL i opcjonalnych do dodania – określ, czy wartość trzeba przekształcić do standardu Xpertis (typ, zapis, długość, słownik), a jeśli tak – na jaki format.'))}</p>
    ${s.trAllU ? `<button type="button" class="btn sm" data-act="bulktr" data-v="N">${esc(T('Pozostałe ({n}) bez zmian', {n: s.trAllU}))}</button>` : ''}</div>`;
  const qn = s.Q + s.addQ ? `<div class="note info">${ic('info')}<span>${esc(T('Danych do wyjaśnienia ({n}) tu nie pokazujemy – wrócą, gdy w kroku 1 zostaną oznaczone jako potrzebne albo do dodania.', {n: s.Q + s.addQ}))}</span></div>` : '';
  const groups = groupBySec(list.map(it => Object.assign({}, it.e, {_it: it}))).map(g => {
    const its = g.items.map(x => x._it), so = its.filter(it => it.kind === 'std'), oo = its.filter(it => it.kind === 'opt');
    const cnt = [so.length ? `<span class="tag std">${esc(T('Standard PL'))} ${so.length}</span>` : '', oo.length ? `<span class="tag addt">${esc(T('Dane opcjonalne'))} ${oo.length}</span>` : ''].join('');
    return `<section class="sec"><div class="sech"><h3>${esc(secName(g.s))} <code>${esc(g.s)}</code>${cnt}</h3></div>${so.concat(oo).map(it => trRow(p, it.e, it.kind, it.key)).join('')}</section>`; }).join('');
  return intro + qn + filterBar({all: s.go, U: s.trAllU, Y: s.trY + s.addTrY, N: s.trN + s.addTrN}, [['all', 'Wszystkie'], ['U', 'Bez decyzji'], ['Y', 'Transformacja'], ['N', 'Bez zmian']]) + (groups || `<div class="empty">${esc(T('Brak danych dla tego filtra.'))}</div>`);
}
function addRow(p, e, key, small) {
  const x = (S.d[p.id] && S.d[p.id].a[key]) || {};
  const open = V.open[key];
  const why = `<label class="sm muted" for="w-${esc(key)}">${esc(T('Uzasadnienie / uwagi'))}</label><textarea class="inp" id="w-${esc(key)}" data-act="why" data-k="${esc(key)}" rows="2">${esc(x.why || '')}</textarea>`;
  const d = e.dd != null ? D.dict[e.dd] : dictOf(e);
  return `<div class="row k-opt${small ? ' k-dict' : ''}${x.n === 'N' ? ' dim' : ''}" data-k="${esc(key)}">
    <div class="fn"><div class="lb">${esc(fLabel(e))}</div><div class="px">${pathHtml(e)}</div>${addLine(p, e)}${small ? '' : `<button type="button" class="lnk" data-act="more" data-k="${esc(key)}" aria-expanded="${!!open}">${esc(T(open ? 'Ukryj szczegóły' : 'Szczegóły'))}</button>`}</div>
    <div class="ex">${e.t ? `<span class="tag t">${esc(tName(e.t))}</span>` : ''}${vals(e)}${d ? `<span class="tag ${d.sc === 'Y' ? 'ref' : 'out'}">${esc(scopeTxt(d.sc))}</span>` : ''}${small && d && d.d ? `<span class="sm muted" style="flex-basis:100%"${d.d.length > 170 ? ` title="${esc(d.d)}"` : ''}>${esc(d.d.length > 170 ? d.d.slice(0, 165).replace(/\s+\S*$/, '') + '…' : d.d)}</span>` : ''}</div>
    ${decBtns(key, x.n, ADD, ['ad', 'n', 'q'], 'add', small)}
    ${open || (small && x.n) ? (small ? `<div class="more" style="grid-template-columns:minmax(0,1fr)"><div>${why}</div></div>` : moreHtml(e, why)) : ''}</div>`;
}
function paneSum(p) {
  const s = stats(p), d = pd(p.id), c = d.c || {};
  const warn = [];
  if (s.und) warn.push(T('{n} danych ze standardu bez decyzji w kroku 1', {n: s.und}));
  if (s.refU) warn.push(T('{n} danych opcjonalnych bez decyzji w kroku 1', {n: s.refU}));
  if (s.trAllU) warn.push(T('{n} danych bez decyzji o transformacji w kroku 2', {n: s.trAllU}));
  return `${c.done ? `<div class="donebar">${ic('check')}<span><b>${esc(T('Analiza zatwierdzona'))}</b> ${esc(T('{who}, {when}', {who: c.by || T('bez podpisu'), when: new Date(c.done).toLocaleString(LANG === 'en' ? 'en-GB' : 'pl-PL')}))}</span><button type="button" class="btn sm" data-act="undone">${esc(T('Otwórz ponownie'))}</button></div>` : ''}
    <div class="grid4"><div class="stat"><b>${p.std ? s.n : '–'}</b><span>${esc(T('dane w standardzie PL'))}</span></div><div class="stat y"><b>${s.Y}</b><span>${esc(T('potrzebne w Xpertis'))}</span></div><div class="stat t"><b>${s.trY + s.addTrY}</b><span>${esc(T('wymagają transformacji'))}</span></div><div class="stat a"><b>${s.addY}</b><span>${esc(T('do dodania w PECI PL'))}</span></div></div>
    ${warn.length ? `<div class="note warn">${ic('warn')}<span>${esc(T('Zostało do decyzji:'))} ${warn.map(esc).join('; ')}.</span></div>` : ''}
    <div class="qblock"><h3>${esc(T('Czy dane do integracji tego procesu są kompletne?'))}</h3><p>${esc(T('Razem z danymi opcjonalnymi wybranymi do dodania. Jeśli czegoś brakuje (także spoza PECI), opisz to poniżej.'))}</p>
      ${decBtns('ok', c.ok, {Y: 'Tak, kompletne', N: 'Nie – brakuje danych'}, ['y', 'q'], 'ok')}</div>
    <div class="qblock"><h3><label for="miss">${esc(T('Brakujące dane i sprawy do ustalenia'))}</label></h3><textarea class="inp" id="miss" data-act="miss" rows="3" placeholder="${esc(T('np. brak daty końca okresu próbnego; potrzebny kod ZUS tytułu ubezpieczenia'))}">${esc(c.miss || '')}</textarea></div>
    <div class="qblock"><h3><label for="pnotes">${esc(T('Uwagi do procesu'))}</label></h3><textarea class="inp" id="pnotes" data-act="pnotes" rows="3">${esc(c.notes || '')}</textarea></div>
    ${c.done ? '' : `<button type="button" class="btn pri" data-act="done">${ic('check')}${esc(T('Zatwierdź analizę procesu'))}</button>`}`;
}
function renderProc(p) {
  const pane = V.step === 1 ? paneData(p) : V.step === 2 ? paneTr(p) : paneSum(p);
  const idx = PROCS.indexOf(p), next = PROCS[idx + 1];
  const stepN = ['', 'Kompletność danych', 'Transformacja', 'Potwierdzenie'];
  const back = V.step > 1 ? `<button type="button" class="btn" data-act="step" data-v="${V.step - 1}">${ic('left')}${esc(T('Wstecz'))}</button>` : idx > 0 ? `<a class="btn" href="#p/${PROCS[idx - 1].id}/3">${ic('left')}${esc(T('Poprzedni proces'))}</a>` : '<span></span>';
  const fwd = V.step < 3 ? `<button type="button" class="btn pri" data-act="step" data-v="${V.step + 1}">${esc(T('Dalej: {s}', {s: T(stepN[V.step + 1])}))}${ic('right')}</button>`
    : next ? `<a class="btn pri" href="#p/${next.id}">${esc(T('Następny proces: {n}', {n: pNo(next)}))}${ic('right')}</a>` : `<a class="btn pri" href="#start">${esc(T('Wróć do przeglądu'))}</a>`;
  return `<div class="card">${renderHead(p)}${renderSteps(p)}<div class="pane" role="tabpanel">${pane}</div><div class="foot">${back}${fwd}</div></div>`;
}

/* ---------- okna ---------- */
function renderModal() {
  const m = $('#modal');
  if (!V.modal) { m.hidden = true; m.innerHTML = ''; return; }
  let title = '', body = '';
  if (V.modal.kind === 'file') {
    const f = FILES[V.modal.arg]; title = f.n;
    let seq = null;
    const rows = f.rows.map(r => { let h = '';
      if (r[0] !== '' && r[0] !== seq) { seq = r[0]; const code = (f.rows.find(z => z[0] === seq && z[1] === 'Derived_Event_Code') || [])[2] || ''; h += `<tr class="seq"><td colspan="3">Effective_Change · Sequence ${esc(seq)} ${code ? '· ' + esc(code) : ''}</td></tr>`; }
      const fl = r[3] ? r[3].split('').filter(c => FLT[c]).map(c => `<span class="tag chg">${esc(T(FLT[c]))}</span>`).join(' ') : '';
      return h + `<tr class="${/[AUDP]/.test(r[3]) ? 'c' : ''}"><td class="p">${esc(r[1])}</td><td class="v">${esc(r[2])}${r[4] ? `<div class="faint">${esc(T('poprzednio:'))} ${esc(r[4])}</div>` : ''}</td><td>${fl}</td></tr>`; }).join('');
    body = `<p class="sm muted" style="margin:0 0 10px">${esc(T('Wartości osobowe zamaskowane: A/a – litera, 9 – cyfra'))}. ${esc(T('Pogrubione ścieżki – pola z atrybutem zmiany.'))}</p><table class="fx"><tbody>${rows}</tbody></table>`;
  } else if (V.modal.kind === 'who') {
    const req = !known() || needKey(), old = $('#who-form'), oldTeam = old && (old.querySelector('input[name="team"]:checked') || {}).value;
    const nm = old ? old.name.value : S.name || (!S.team ? S.who : '') || '', tm = old ? oldTeam : S.team;
    m.hidden = false;
    m.innerHTML = `<div class="box whobox" role="dialog" aria-modal="true" aria-labelledby="who-h"><form id="who-form" novalidate>
      <div class="mh"><h2 id="who-h">${esc(req ? T('Kto prowadzi analizę?') : T('Zmień imię lub zespół'))}</h2>${req ? '' : `<button type="button" class="btn icon ghost" data-act="close" aria-label="${esc(T('Zamknij'))}">${ic('x')}</button>`}</div>
      <div class="mb">
        <label class="fl" for="who-name">${esc(T('Imię'))}</label>
        <input id="who-name" class="inp" name="name" autocomplete="given-name" maxlength="40" value="${esc(nm)}" placeholder="${esc(T('np. Anna'))}">
        <fieldset><legend class="fl">${esc(T('Zespół'))}</legend><div class="teams">${TEAMS.map(t => `<label><input type="radio" name="team" value="${esc(t)}"${tm === t ? ' checked' : ''}><span>${esc(t)}</span></label>`).join('')}</div></fieldset>
        ${needKey() ? `<label class="fl kl" for="who-key">${esc(T('Hasło zespołu'))}</label><input id="who-key" class="inp" name="key" type="password" autocomplete="current-password" maxlength="200">` : ''}
        <div class="note info">${ic('info')}<span>${esc(SH.on ? T('Imię i zespół zapisujemy przy każdej decyzji oraz w raporcie Excel. Decyzje trafiają do wspólnej bazy – widzą je wszyscy użytkownicy.') : T('Imię i zespół zapisujemy przy każdej decyzji oraz w raporcie Excel. Dane zostają w tej przeglądarce.'))}</span></div>
        <p class="err" id="who-err" role="alert"></p>
        <div class="mf"><button type="submit" class="btn pri">${esc(req ? T('Rozpocznij') : T('Zapisz'))}</button></div>
      </div></form></div>`;
    const inp = old && known() && $('#who-key') ? $('#who-key') : $('#who-name'); inp.focus(); if (inp.type !== 'password') inp.setSelectionRange(inp.value.length, inp.value.length);
    return;
  } else if (V.modal.kind === 'help') {
    title = T('Jak korzystać z narzędzia');
    body = `<div class="help"><p>${esc(T('Narzędzie prowadzi zespół Xpertis przez procesy kadrowe jeden po drugim. Każdy proces ma trzy kroki.'))}</p>
      <ol><li><b>${esc(T('Kompletność danych'))}</b> – ${esc(T('Standard PL (zielony): potrzebna, niepotrzebna albo do wyjaśnienia. Dane opcjonalne z xlsm (fioletowy): dodać do PECI PL czy nie.'))}</li><li><b>${esc(T('Transformacja'))}</b> – ${esc(T('Dla danych, które trafią do Xpertis: czy zmienić typ lub zapis i na jaki format Xpertis.'))}</li><li><b>${esc(T('Potwierdzenie'))}</b> – ${esc(T('Potwierdzenie kompletności, braki i zatwierdzenie procesu.'))}</li></ol>
      <h3>${esc(T('Standard i dane opcjonalne'))}</h3><p>${esc(T('Standard PL to dane z pliku PECI dla Polski przypisanego do procesu. Dane opcjonalne to pola z PECI_XML_Sections_fields.xlsm, których nie ma w standardzie: z arkusza procesu (numer arkusza = numer procesu) oraz – na zwiniętej liście na końcu kroku 1 – pozostałe pola z arkusza PECI Dictionary w sekcjach procesu. Procesy bez pliku PECI dla Polski mają tylko dane opcjonalne.'))}</p>
      <h3>${esc(T('Pasek u góry'))}</h3><p>${esc(T('Każda ikona to proces z numerem z PECI_XML_Sections_fields.xlsm. Kreska pod ikoną pokazuje postęp, zielona ikona – proces zatwierdzony, przerywana ramka – brak pliku PECI dla Polski.'))}</p>
      <h3>${esc(T('Zapisywanie'))}</h3><p>${SH.on ? esc(T('Decyzje zapisują się we wspólnej bazie i widzą je wszyscy użytkownicy; zmiany innych osób pojawiają się co kilkanaście sekund. Wskaźnik w nagłówku pokazuje stan synchronizacji. Plik JSON z menu „…” służy jako kopia zapasowa.')) : esc(T('Decyzje zapisują się automatycznie w tej przeglądarce. Aby przekazać je innym, użyj menu „…” → Zapisz ustalenia do pliku, a druga osoba – Wczytaj ustalenia z pliku. Raport Excel zbiera wszystkie decyzje.'))}</p>
      <h3>${esc(T('Źródła'))}</h3><p>${esc(T('Pliki PECI dla Polski z folderu „Sample PECI Files -Poland” oraz PECI_XML_Sections_fields.xlsm (lista procesów, przykłady danych, słownik pól). Dane osobowe w przykładach są zamaskowane.'))}</p></div>`;
  }
  m.hidden = false;
  m.innerHTML = `<div class="box" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="mh"><h2>${esc(title)}</h2><button type="button" class="btn icon ghost" data-act="close" aria-label="${esc(T('Zamknij'))}">${ic('x')}</button></div><div class="mb">${body}</div></div>`;
  $('.box [data-act="close"]', m).focus();
}

/* ---------- render ---------- */
function render() {
  document.documentElement.lang = LANG;
  document.title = T('Workday → Xpertis – analiza danych');
  renderTop(); renderSide();
  const p = V.p != null ? PBY[V.p] : null;
  $('#main').innerHTML = p ? renderProc(p) : renderStart();
}
function rerenderKeep() {
  const a = document.activeElement, id = a && a.id, k = a && a.dataset && a.dataset.k, act = a && a.dataset && a.dataset.act, pos = a && a.selectionStart;
  const y = window.scrollY; render(); window.scrollTo(0, y);
  let el = id ? document.getElementById(id) : null;
  if (!el && act) el = document.querySelector(`[data-act="${act}"]${k ? `[data-k="${CSS.escape(k)}"]` : ''}`);
  if (el && el.focus) { el.focus({preventScroll: true}); if (pos != null && el.setSelectionRange) try { el.setSelectionRange(pos, pos); } catch (e) {} }
}

/* ---------- akcje ---------- */
function setNeed(p, k, v) { const f = pd(p.id).f; const x = f[k] || {}; x.n = x.n === v ? '' : v; if (x.n !== 'Y') { delete x.t; delete x.fmt; } f[k] = stamp(x); }
function setTr(p, k, v, e) { const f = pd(p.id).f; const x = f[k] || {}; x.t = x.t === v ? '' : v; if (x.t === 'Y' && !x.fmt && e && SUGGEST[e.t]) { x.fmt = SUGGEST[e.t]; x.fmtTouched = false; } f[k] = stamp(x); }
function setAdd(p, k, v) { const a = pd(p.id).a; const x = a[k] || {}; x.n = x.n === v ? '' : v; if (x.n !== 'Y') { delete x.t; delete x.fmt; } a[k] = stamp(x); }
const field = (p, k) => p.fields.find(e => e.k === k);

document.addEventListener('click', ev => {
  const t = ev.target.closest('[data-act]');
  if (!t) { if (V.menu && !ev.target.closest('.menu')) { V.menu = false; renderTop(); } if (ev.target.id === 'modal') closeModal(); return; }
  const act = t.dataset.act, p = V.p != null ? PBY[V.p] : null;
  if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.tagName === 'DETAILS') return;
  switch (act) {
    case 'who': openModal('who'); break;
    case 'lang': LANG = t.dataset.v; store.set(LSL, LANG); render(); break;
    case 'menu': V.menu = !V.menu; renderTop(); break;
    case 'help': V.menu = false; openModal('help'); break;
    case 'close': closeModal(); break;
    case 'file': openModal('file', t.dataset.f); break;
    case 'open': go('#p/' + t.dataset.p); break;
    case 'lflt': V.lflt = t.dataset.v; renderSide(); break;
    case 'step': V.step = +t.dataset.v; V.q = ''; V.flt = 'all'; history.replaceState(null, '', '#p/' + p.id + '/' + V.step); render(); window.scrollTo(0, 0); break;
    case 'flt': V.flt = t.dataset.v; rerenderKeep(); break;
    case 'more': V.open[t.dataset.k] = !V.open[t.dataset.k]; rerenderKeep(); break;
    case 'need': setNeed(p, t.dataset.k, t.dataset.v); save(); rerenderKeep(); break;
    case 'tr': { const store = t.dataset.kind === 'opt' ? pd(p.id).a : pd(p.id).f, k = t.dataset.k, x = store[k] || {};
      const e = t.dataset.kind === 'opt' ? (p.adds.find(z => 'r:' + z.k === k) || {}) : (field(p, k) || {});
      x.t = x.t === t.dataset.v ? '' : t.dataset.v; if (x.t === 'Y' && !x.fmt && SUGGEST[e.t]) { x.fmt = SUGGEST[e.t]; x.fmtTouched = false; }
      store[k] = stamp(x); save(); rerenderKeep(); break; }
    case 'add': setAdd(p, t.dataset.k, t.dataset.v); save(); rerenderKeep(); break;
    case 'bulk': { const f = pd(p.id).f; let n = 0; p.fields.forEach(e => { if (!(f[e.k] && f[e.k].n)) { f[e.k] = stamp(Object.assign(f[e.k] || {}, {n: t.dataset.v})); n++; } }); save(); rerenderKeep(); toast(T('Oznaczono {n} danych.', {n})); break; }
    case 'bulksec': { const f = pd(p.id).f; let n = 0; p.fields.filter(e => e.s === t.dataset.s).forEach(e => { if (!(f[e.k] && f[e.k].n)) { f[e.k] = stamp(Object.assign(f[e.k] || {}, {n: t.dataset.v})); n++; } }); save(); rerenderKeep(); toast(T('Oznaczono {n} danych.', {n})); break; }
    case 'bulktr': { const dd = pd(p.id); let n = 0; [dd.f, dd.a].forEach(m => Object.keys(m).forEach(k => { const x = m[k]; if (x && x.n === 'Y' && !x.t) { x.t = 'N'; stamp(x); n++; } })); save(); rerenderKeep(); toast(T('Oznaczono {n} danych.', {n})); break; }
    case 'bulkadd': { const a = pd(p.id).a; let n = 0; p.adds.filter(e => e.s === t.dataset.s).forEach(e => { const k = 'r:' + e.k; if (!(a[k] && a[k].n)) { a[k] = stamp(Object.assign(a[k] || {}, {n: t.dataset.v})); n++; } }); save(); rerenderKeep(); toast(T('Oznaczono {n} danych.', {n})); break; }
    case 'ok': { const c = pd(p.id).c; c.ok = c.ok === t.dataset.v ? '' : t.dataset.v; stamp(c); save(); rerenderKeep(); break; }
    case 'done': { const c = pd(p.id).c; stamp(c); c.done = now(); save(); render(); toast(T('Zatwierdzono analizę procesu {n}.', {n: pNo(p)})); break; }
    case 'undone': { const c = pd(p.id).c; c.done = ''; stamp(c); save(); render(); break; }
    case 'xlsx': V.menu = false; exportWorkday(); break;
    case 'sync': if (needKey()) openModal('who'); else if (SH.mode === 'access' && (SH.st === 'auth' || SH.st === 'err')) location.reload(); else sync(); break;
    case 'save': V.menu = false; renderTop(); exportJson(); break;
    case 'load': V.menu = false; renderTop(); $('#file-in').click(); break;
    case 'reset': V.menu = false; renderTop(); if (confirm(T('Usunąć wszystkie ustalenia zapisane w tej przeglądarce?'))) { S = {who: S.who, name: S.name, team: S.team, d: {}}; save(); render(); toast(T('Ustalenia wyczyszczone.')); } break;
  }
});
document.addEventListener('input', ev => {
  const t = ev.target, act = t.dataset && t.dataset.act, p = V.p != null ? PBY[V.p] : null;
  if (!act) return;
  if (act === 'q') { V.q = t.value; rerenderKeep(); }
  else if (act === 'dq') { V.dq = t.value; V.dictOpen = true; rerenderKeep(); }
  else if (act === 'fnote') { const f = pd(p.id).f; f[t.dataset.k] = stamp(Object.assign(f[t.dataset.k] || {}, {note: t.value})); save(); }
  else if (act === 'det') { const m = t.dataset.kind === 'opt' ? pd(p.id).a : pd(p.id).f; m[t.dataset.k] = stamp(Object.assign(m[t.dataset.k] || {}, {det: t.value})); save(); }
  else if (act === 'why') { const a = pd(p.id).a; a[t.dataset.k] = stamp(Object.assign(a[t.dataset.k] || {}, {why: t.value})); save(); }
  else if (act === 'miss') { const c = pd(p.id).c; c.miss = t.value; stamp(c); save(); }
  else if (act === 'pnotes') { const c = pd(p.id).c; c.notes = t.value; stamp(c); save(); }
});
document.addEventListener('change', ev => {
  const t = ev.target, act = t.dataset && t.dataset.act, p = V.p != null ? PBY[V.p] : null;
  if (act === 'fmt') { const m = t.dataset.kind === 'opt' ? pd(p.id).a : pd(p.id).f; m[t.dataset.k] = stamp(Object.assign(m[t.dataset.k] || {}, {fmt: t.value, fmtTouched: true})); save(); rerenderKeep(); }
  else if (act === 'dscope') { V.dscope = t.checked; V.dictOpen = true; rerenderKeep(); }
  else if (act === 'jump') go(t.value === 'start' ? '#start' : '#p/' + t.value);
  else if (act === 'q' || act === 'dq') { /* już obsłużone */ }
});
document.addEventListener('toggle', ev => { if (ev.target.dataset && ev.target.dataset.act === 'dict') V.dictOpen = ev.target.open; }, true);
document.addEventListener('keydown', ev => {
  if (ev.key !== 'Tab' || !V.modal) return;
  const f = [...document.querySelectorAll('#modal .box button, #modal .box input, #modal .box select, #modal .box textarea, #modal .box a[href]')].filter(x => !x.disabled && x.offsetParent !== null);
  if (!f.length) return; const i = f.indexOf(document.activeElement);
  if (ev.shiftKey && i <= 0) { ev.preventDefault(); f[f.length - 1].focus(); } else if (!ev.shiftKey && (i === f.length - 1 || i < 0)) { ev.preventDefault(); f[0].focus(); }
});
document.addEventListener('submit', async ev => {
  if (ev.target.id !== 'who-form') return; ev.preventDefault();
  const f = ev.target, name = f.name.value.trim().replace(/\s+/g, ' '), team = (f.querySelector('input[name="team"]:checked') || {}).value, key = f.key ? f.key.value : '';
  const err = !name && !team ? T('Podaj imię i wybierz zespół.') : !name ? T('Podaj imię.') : !team ? T('Wybierz zespół.') : f.key && !key ? T('Podaj hasło zespołu.') : '';
  if (err) { $('#who-err').textContent = err; (!name ? f.name : !team ? f.querySelector('input[name="team"]') : f.key).focus(); return; }
  const first = !known(); S.name = name; S.team = team; S.who = name + ' · ' + team; saveLocal();
  if (f.key) {
    const b = f.querySelector('[type=submit]'); b.disabled = true; $('#who-err').textContent = '';
    try { await connect(key); }
    catch (e) { b.disabled = false; $('#who-err').textContent = e.auth ? T('Nieprawidłowe hasło zespołu.') : T('Brak połączenia z serwerem. Spróbuj ponownie.'); f.key.select(); return; }
  }
  V.modal = null; renderModal(); render(); toast(first ? T('Witaj, {n}!', {n: name}) : T('Zapisano: {w}', {w: S.who}));
});
document.addEventListener('keydown', ev => { if (ev.key === 'Escape') { if (V.modal) closeModal(); else if (V.menu) { V.menu = false; renderTop(); } } });
window.addEventListener('hashchange', route);

/* ---------- dymki z nazwami procesów na górnym pasku ---------- */
const tip = $('#tip');
function showTip(a) {
  tip.innerHTML = `<b>${esc(a.dataset.tip)}</b>${a.dataset.tip2 ? `<span>${esc(a.dataset.tip2)}</span>` : ''}`;
  tip.hidden = false;
  const r = a.getBoundingClientRect(), w = tip.offsetWidth, x = Math.max(8, Math.min(innerWidth - w - 8, r.left + r.width / 2 - w / 2));
  tip.style.left = x + 'px'; tip.style.top = (r.bottom + 8) + 'px'; tip.style.setProperty('--ax', (r.left + r.width / 2 - x) + 'px');
}
const hideTip = () => { tip.hidden = true; };
document.addEventListener('mouseover', ev => { const a = ev.target.closest && ev.target.closest('.pnav a[data-tip]'); if (a) showTip(a); else if (!tip.hidden) hideTip(); });
document.addEventListener('focusin', ev => { const a = ev.target.closest && ev.target.closest('.pnav a[data-tip]'); if (a && a.matches(':focus-visible')) showTip(a); else hideTip(); });
document.addEventListener('focusout', hideTip);
document.addEventListener('scroll', hideTip, true);
window.addEventListener('hashchange', hideTip);

/* ---------- wymiana ustaleń (JSON) ---------- */
const APP = 'wd-xpertis-analiza';
function download(name, blob) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); }
const ymd = () => new Date().toISOString().slice(0, 10);
const slug = s => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[łŁ]/g, 'l').replace(/[^A-Za-z0-9]+/g, '_').replace(/^_|_$/g, '');
function exportJson() {
  const body = {app: APP, v: 1, at: now(), by: S.who, d: S.d};
  download(`WD_Xpertis_ustalenia_${slug(S.who) || 'zespol'}_${ymd()}.json`, new Blob([JSON.stringify(body, null, 1)], {type: 'application/json'}));
  toast(T('Zapisano plik z ustaleniami.'));
}
function newer(a, b) { return !a || (b && (b.ts || '') > (a.ts || '')); }
function importJson(text) {
  let o; try { o = JSON.parse(text); } catch (e) { toast(T('To nie jest plik ustaleń tego narzędzia.')); return; }
  if (!o || o.app !== APP || !o.d) { toast(T('To nie jest plik ustaleń tego narzędzia.')); return; }
  let n = 0;
  Object.keys(o.d).forEach(pid => { if (!PBY[pid]) return; const src = o.d[pid], dst = pd(pid);
    ['f', 'a'].forEach(kind => Object.keys(src[kind] || {}).forEach(k => { if (newer(dst[kind][k], src[kind][k])) { dst[kind][k] = src[kind][k]; n++; } }));
    if (src.c && newer(dst.c && dst.c.ts ? dst.c : null, src.c)) { dst.c = src.c; n++; } });
  save(); render(); toast(T('Wczytano ustalenia{by}. Zaktualizowane wpisy: {n}.', {by: o.by ? ' – ' + o.by : '', n}));
}
$('#file-in').addEventListener('change', ev => { const f = ev.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => importJson(String(r.result)); r.readAsText(f); ev.target.value = ''; });

/* ---------- raport Excel ---------- */
function loadExcelJS() {
  if (window.ExcelJS) return Promise.resolve(window.ExcelJS);
  return new Promise((res, rej) => { const s = document.createElement('script'); s.src = 'vendor/exceljs.min.js'; s.onload = () => res(window.ExcelJS); s.onerror = () => rej(new Error('ExcelJS')); document.head.appendChild(s); });
}

/* ---------- PECI data analysis report (EN, jeden arkusz) – wszystkie ustalenia z analizy ---------- */
function workdayRows() {
  const L0 = LANG; LANG = 'en';
  try {
    const out = [];
    const scope = sc => sc === 'Y' ? 'In scope' : sc === 'N' ? 'Out of scope' : sc ? sc : 'Not specified';
    const files = p => p.files.map(f => FILES[f[0]].n + (f[1] ? ' (Sequence ' + f[1].join(', ') + ')' : '')).join('\n') || 'No PL sample file';
    const dt = ts => ts ? new Date(ts).toLocaleDateString('en-GB') : '';
    const conv = x => x.t === 'Y' ? 'Yes – convert' : x.t === 'N' ? 'No – use as is' : 'Not decided';
    const fmt = x => x.t === 'Y' && x.fmt ? T(FMTBY[x.fmt]) : '';
    const det = x => x.t === 'Y' ? (x.det || '') : '';
    const STD = {Y: ['Yes – needed', 'None – already in PL PECI', 'Y'], N: ['No – not needed', 'None – not used by Xpertis', 'N'], Q: ['To clarify', 'Answer question', 'Q'], '': ['Not reviewed yet', 'Pending Xpertis review', '']};
    const OPT = {Y: ['Yes – add to PL PECI', 'Add field to PL PECI output', 'A'], N: ['No – do not add', 'None', 'N'], Q: ['To clarify', 'Answer question', 'Q']};
    PROCS.forEach(p => { const d = S.d[p.id]; if (!d) return;
      const c = d.c || {}, any = Object.keys(d.f || {}).some(k => d.f[k].n) || Object.keys(d.a || {}).some(k => d.a[k].n) || c.ok || c.miss || c.notes || c.done;
      if (!any) return;
      const base = {pid: p.id, proc: pName(p), ev: p.ev || '', file: files(p)};
      const cm = [c.miss ? 'Missing data: ' + c.miss : '', c.notes ? 'Notes: ' + c.notes : ''].filter(Boolean).join('\n');
      out.push(Object.assign({}, base, {kind: 'Process review', sec: '', path: '', fld: '', desc: '', sc: '', type: '', ex: '',
        need: c.ok === 'Y' ? 'Data set complete: Yes' : c.ok === 'N' ? 'Data set complete: No' : 'Data set complete: not confirmed', act: c.miss || c.ok === 'N' ? 'Review missing data' : 'None',
        conv: '', fmt: '', det: '', note: cm, by: c.done ? (c.by || '') : (c.by || ''), dt: c.done ? 'Signed off ' + dt(c.done) : dt(c.ts), f: c.ok === 'N' ? 'Q' : c.ok === 'Y' ? 'Y' : '', proc_row: true}));
      groupBySec(p.fields).forEach(g => g.items.forEach(e => { const x = d.f[e.k] || {}, m = STD[x.n || ''], dd = dictOf(e);
        out.push(Object.assign({}, base, {kind: 'PL standard', sec: e.s, path: e.k, fld: e.f, desc: dd ? dd.d : '', sc: dd ? scope(dd.sc) : '', type: e.t ? tName(e.t) : '', ex: (e.v || []).join(' | '),
          need: m[0], act: m[1], conv: x.n === 'Y' ? conv(x) : '', fmt: x.n === 'Y' ? fmt(x) : '', det: x.n === 'Y' ? det(x) : '', note: x.note || '', by: x.by || '', dt: dt(x.ts), f: m[2], t: x.n === 'Y' && x.t === 'Y'})); }));
      groupBySec(p.adds).forEach(g => g.items.forEach(e => { const x = d.a['r:' + e.k]; if (!x || !x.n) return; const m = OPT[x.n], dd = dictOf(e);
        out.push(Object.assign({}, base, {kind: 'Optional (xlsm sheet ' + p.id + ')', sec: e.s, path: e.k, fld: e.f, desc: dd ? dd.d : '', sc: dd ? scope(dd.sc) : '', type: e.t ? tName(e.t) : '', ex: (e.v || []).join(' | '),
          need: m[0], act: m[1], conv: x.n === 'Y' ? conv(x) : '', fmt: x.n === 'Y' ? fmt(x) : '', det: x.n === 'Y' ? det(x) : '', note: x.why || '', by: x.by || '', dt: dt(x.ts), f: m[2], t: x.n === 'Y' && x.t === 'Y'})); }));
      (p.dadd || []).forEach(i => { const x = d.a[dkey(i)]; if (!x || !x.n) return; const m = OPT[x.n], dd = D.dict[i];
        out.push(Object.assign({}, base, {kind: 'Optional (PECI Dictionary)', sec: dd.s, path: [dd.s, dd.u.replace(/ /g, '_'), dd.f.replace(/ /g, '_')].filter(Boolean).join('/'), fld: dd.f.replace(/ /g, '_'), desc: dd.d || '', sc: scope(dd.sc), type: '', ex: '',
          need: m[0], act: m[1], conv: x.n === 'Y' ? conv(x) : '', fmt: x.n === 'Y' ? fmt(x) : '', det: x.n === 'Y' ? det(x) : '', note: x.why || '', by: x.by || '', dt: dt(x.ts), f: m[2], t: x.n === 'Y' && x.t === 'Y'})); });
    });
    return out;
  } finally { LANG = L0; }
}
async function exportWorkday() {
  let X; try { X = await loadExcelJS(); } catch (e) { toast(T('Nie udało się wczytać modułu Excel. Sprawdź połączenie i spróbuj ponownie.')); return; }
  const rows = workdayRows(), items = rows.filter(r => !r.proc_row);
  // kolumny w grupach: kto/proces → dana PECI → decyzja Xpertis → standard Xpertis → komentarze → dane referencyjne
  const G = [['Process', 'FF17232E', [['#', 5], ['No.', 6], ['Business process', 26]]],
    ['PECI data item', 'FF3A4855', [['Data origin', 17], ['PECI section', 18], ['PECI field', 32], ['XML path', 48]]],
    ['Xpertis decision', 'FF1B7446', [['Required in PECI file', 20], ['Action for Workday', 24]]],
    ['Xpertis standard', 'FF0A6A80', [['Conversion', 15], ['Target format', 24], ['Conversion details', 32]]],
    ['Comments', 'FF1E5DAA', [['Comment / question', 40], ['By', 16], ['Date', 12], ['Response / resolution', 36]]],
    ['Reference (PECI Dictionary, PL sample file)', 'FF66727F', [['Workday description', 44], ['PECI data type', 14], ['Example value (masked)', 27], ['Chorus scope', 11], ['Event code(s)', 10], ['PL sample file', 26]]]];
  const cols = [].concat(...G.map(g => g[2])), NC = cols.length;
  const C = {}; let k = 1; G.forEach(g => g[2].forEach(c => { C[c[0]] = k++; }));
  const FILL = {Y: 'FFE1F2E8', A: 'FFECE8F9', N: 'FFEEF1F4', Q: 'FFFAEED7', T: 'FFDEF1F5'};
  const wb = new X.Workbook(); wb.creator = S.who || 'Workday → Xpertis'; wb.created = new Date();
  const HR = 5;
  const ws = wb.addWorksheet('PECI data analysis', {views: [{state: 'frozen', ySplit: HR, xSplit: 3, showGridLines: false, zoomScale: 90}],
    pageSetup: {orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0, paperSize: 9, printTitlesRow: '4:5', margins: {left: .4, right: .4, top: .5, bottom: .5, header: .3, footer: .3}},
    headerFooter: {oddFooter: '&LPECI data analysis report&RPage &P of &N'}});
  ws.columns = cols.map(c => ({width: c[1]}));
  const A = {name: 'Arial', size: 10}, ink = 'FF17232E', line = {style: 'thin', color: {argb: 'FFD9DFE5'}};
  const fill = argb => ({type: 'pattern', pattern: 'solid', fgColor: {argb}});
  ws.getCell(1, 1).value = 'PECI data analysis report'; ws.getCell(1, 1).font = Object.assign({}, A, {size: 16, bold: true, color: {argb: ink}}); ws.getRow(1).height = 26;
  ws.getCell(2, 1).value = `Workday → Xpertis integration (Poland) · Generated ${new Date().toLocaleString('en-GB', {dateStyle: 'medium', timeStyle: 'short'})} · Prepared by ${S.who || '–'}`;
  ws.getCell(2, 1).font = Object.assign({}, A, {color: {argb: 'FF66727F'}});
  // wiersz grup i nagłówki kolumn
  let c0 = 1;
  G.forEach(([name, col, cs]) => { const c1 = c0 + cs.length - 1; if (c1 > c0) ws.mergeCells(4, c0, 4, c1);
    const cell = ws.getCell(4, c0); cell.value = name; for (let i = c0; i <= c1; i++) { const x = ws.getCell(4, i); x.fill = fill(col); x.border = {left: i === c0 ? {style: 'thin', color: {argb: 'FFFFFFFF'}} : undefined}; }
    cell.font = Object.assign({}, A, {bold: true, color: {argb: 'FFFFFFFF'}}); cell.alignment = {vertical: 'middle', horizontal: 'left', indent: 1};
    for (let i = c0; i <= c1; i++) { const h = ws.getCell(HR, i); h.value = cols[i - 1][0]; h.font = Object.assign({}, A, {bold: true, color: {argb: ink}}); h.fill = fill('FFEEF1F4');
      h.alignment = {vertical: 'middle', wrapText: true}; h.border = {bottom: {style: 'medium', color: {argb: col}}, left: i === c0 ? {style: 'thin', color: {argb: 'FFC2CBD4'}} : undefined}; }
    c0 = c1 + 1; });
  ws.getRow(4).height = 20; ws.getRow(HR).height = 30;
  if (!rows.length) { const c = ws.getCell(HR + 1, 1); c.value = 'No analysis data yet.'; c.font = Object.assign({}, A, {italic: true}); }
  const firstCol = new Set(); c0 = 1; G.forEach(g => { firstCol.add(c0); c0 += g[2].length; });
  rows.forEach((r, i) => { const row = ws.getRow(HR + 1 + i), pr = !!r.proc_row, pend = !pr && r.f === '';
    const v = {'#': i + 1, 'No.': r.pid, 'Business process': r.proc, 'Data origin': r.kind, 'PECI section': r.sec, 'PECI field': r.fld, 'XML path': r.path, 'Required in PECI file': r.need, 'Action for Workday': r.act,
      'Conversion': r.conv, 'Target format': r.fmt, 'Conversion details': r.det, 'Comment / question': r.note, 'By': r.by, 'Date': r.dt, 'Response / resolution': '',
      'Workday description': r.desc, 'PECI data type': r.type, 'Example value (masked)': r.ex, 'Chorus scope': r.sc, 'Event code(s)': r.ev, 'PL sample file': r.file};
    row.values = cols.map(c => v[c[0]]);
    row.eachCell({includeEmpty: true}, (c, ci) => {
      const f = Object.assign({}, A);
      if (pr) Object.assign(f, {bold: true});
      else if (ci <= 3) f.color = {argb: 'FF8D98A4'};
      if (ci === C['Data origin'] && !pr) f.color = {argb: r.kind === 'PL standard' ? 'FF1B7446' : 'FF6A3FB5'}, f.bold = true;
      if (ci === C['PECI field'] || ci === C['XML path']) f.name = 'Consolas';
      if (ci === C['PECI field'] && !pr) f.bold = true;
      if ((ci === C['Required in PECI file'] || ci === C['Action for Workday']) && !pr) { if (pend) Object.assign(f, {italic: true, color: {argb: 'FF8D98A4'}}); else f.bold = true; }
      if (ci >= C['Workday description'] && !pr) f.color = {argb: 'FF3A4855'};
      c.font = f;
      c.alignment = {vertical: 'top', wrapText: true, horizontal: ci <= 2 ? 'left' : undefined};
      c.border = pr ? {top: {style: 'thin', color: {argb: 'FF8D98A4'}}, bottom: line, left: firstCol.has(ci) ? {style: 'thin', color: {argb: 'FFC2CBD4'}} : undefined}
        : {bottom: line, left: firstCol.has(ci) ? {style: 'thin', color: {argb: 'FFC2CBD4'}} : undefined};
      let fl = pr ? 'FFF4F6F8' : null;
      if (ci === C['Required in PECI file'] && r.f && FILL[r.f]) fl = FILL[r.f];
      if (ci === C['Action for Workday'] && /^(Add field|Answer question|Review missing)/.test(r.act)) fl = /^Add/.test(r.act) ? FILL.A : FILL.Q;
      if (ci === C['Conversion'] && r.t) fl = FILL.T;
      if (ci === C['Response / resolution'] && !pr) fl = 'FFF7FAFE';
      if (fl) c.fill = fill(fl); }); });
  ws.autoFilter = {from: {row: HR, column: 1}, to: {row: HR + Math.max(rows.length, 1), column: NC}};
  const buf = await wb.xlsx.writeBuffer();
  download(`PECI_data_analysis_report_${ymd()}.xlsx`, new Blob([buf], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));
  toast(rows.length ? T('Pobrano PECI data analysis report ({n} pozycji).', {n: items.length}) : T('Pobrano PECI data analysis report – na razie bez pozycji.'));
}

route();
if (!known()) openModal('who');
detectShared();
})();
