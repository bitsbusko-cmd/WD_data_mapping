# Składa aplikację: dev/src (CSS, JS, szablon, EN) + dev/data.json -> index.html w katalogu głównym repozytorium.
# Uruchom z katalogu głównego: python3 dev/build.py  (czcionki i ExcelJS są już w fonts/ i vendor/).
import sys, os, json, re
base = os.path.dirname(os.path.abspath(__file__))
P = lambda *a: os.path.join(base, *a)
tpl = open(P('src/index.tpl.html'), encoding='utf-8').read()
css = open(P('src/app.css'), encoding='utf-8').read()
js = open(P('src/app.js'), encoding='utf-8').read()
en = json.load(open(P('src/en.json'), encoding='utf-8'))
data = json.load(open(P('data.json'), encoding='utf-8'))
# brakujące tłumaczenia: literały T('...') w JS
keys = set(re.findall(r"T\('((?:[^'\\]|\\.)*)'", js))
keys |= set(re.findall(r"\['\w+', '([^']+)'\]", js)) - {'pl', 'en'}
keys |= set(re.findall(r"\b[YNQ]: '([^']+)'", js)) | set(re.findall(r"\b[AUDPad]: '([^']+)'", js))
skip = {k for k in keys if k.startswith('<') or re.fullmatch(r'FF[0-9A-F]{6}', k) or k in ('a', 'q', 'tr', 'txt')}
missing = sorted(k for k in keys - skip if k not in en and not re.fullmatch(r'[A-Za-z_ ]+', k) or (k not in en and k in ('Start', 'Status')))
print('EN missing:', missing)
for k in ['1 plik PL', '{n} pliki PL', 'Ukryj szczegóły', 'Szczegóły']: assert k in en, k
dj = json.dumps(data, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
ej = json.dumps(en, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
import datetime
ver = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=1))).strftime('%d.%m %H:%M')
js = js.replace('{{VER}}', ver)
js = js.replace('{{PICONS}}', open(P('src/picons.js'), encoding='utf-8').read())
html = tpl.replace('{{CSS}}', css).replace('{{DATA}}', dj).replace('{{EN}}', ej).replace('{{JS}}', js)
open(os.path.join(base, '..', 'index.html'), 'w', encoding='utf-8').write(html)
print('index.html bytes', len(html.encode('utf-8')))
