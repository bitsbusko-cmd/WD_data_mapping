# Źródła aplikacji

- `src/app.js`, `src/app.css`, `src/index.tpl.html`, `src/en.json`, `src/picons.js` – kod interfejsu i tłumaczenia EN.
- `data.json` – dane procesów (32 procesy, pola standardu PL i dane opcjonalne); wartości osobowe zamaskowane, te same dane są wbudowane w `index.html`.
- `build.py` – składa `index.html` w katalogu głównym: `python3 dev/build.py`.

Po zmianie kodu: zbuduj, sprawdź stronę i wypchnij do `main` – Cloudflare Pages opublikuje ją automatycznie.
Funkcja API dla Cloudflare to `_worker.js` w katalogu głównym; wersja dla hostingu PHP jest w `server/`.
Surowe pliki źródłowe (PECI_XML_Sections_fields.xlsm, przykładowe pliki PECI) nie są w repozytorium – zawierają dane, których nie publikujemy.
