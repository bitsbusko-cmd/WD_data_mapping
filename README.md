# Workday → Xpertis · analiza danych wejściowych

**PL** · [EN](#english)

Proste narzędzie dla zespołu Xpertis: przejście proces po procesie przez dane, które Workday wysyła w pliku PECI w konfiguracji dla Polski.

Procesy i ich numery są takie jak w `PECI_XML_Sections_fields.xlsm` (32 procesy, pasek ikon u góry). Dla każdego procesu widać dwie listy:

- **Standard PL** – dane z pliku PECI dla Polski przypisanego do procesu (folder „Sample PECI Files -Poland”). 11 procesów bez pliku PL ma tylko dane opcjonalne.
- **Dane opcjonalne** – pola, które `PECI_XML_Sections_fields.xlsm` wskazuje dla procesu (przykład procesu w arkuszu o numerze procesu oraz – na zwiniętej liście – pozostałe pola z arkusza PECI Dictionary w sekcjach procesu), a których nie ma w standardzie.

Analiza procesu ma trzy kroki:

1. **Kompletność danych** – standard PL (zielony): potrzebna / niepotrzebna / do wyjaśnienia; dane opcjonalne (fioletowy): dodać do PECI PL / nie dodawać / do wyjaśnienia. Na końcu zwinięta lista pól z arkusza PECI Dictionary.
2. **Transformacja** – dla wszystkich danych, które trafią do Xpertis (potrzebne ze standardu i opcjonalne do dodania): czy zmienić typ lub zapis i na jaki format Xpertis (z podpowiedzią na podstawie typu w PECI).
3. **Potwierdzenie** – czy dane są kompletne, czego brakuje, uwagi i zatwierdzenie procesu.

**Dyskusje przy danych** – pod przyciskami decyzji każdej danej jest przycisk dyskusji. Można w nim dodać komentarz albo prośbę o decyzję do wybranego zespołu (Xpertis, Chorus, Saint-Gobain), a prośbę oznaczyć jako rozwiązaną, z krótkim ustaleniem. Przy każdym wpisie zapisujemy autora, zespół, datę i godzinę, a przy prośbie – zespół, który ma zdecydować, oraz kto i kiedy ją rozwiązał. Każde rozwiązanie i ponowne otwarcie prośby to osobny rekord we wspólnej bazie, więc w wątku widać pełną historię: kto, kiedy i z jakim ustaleniem. Prośby czekające na zespoły zbiera karta „Prośby o decyzję” na stronie Status; filtr „Dyskusje” w kroku 1 pokazuje tylko dane z wątkami.

Na koniec **PECI data analysis report** – raport Excel po angielsku. Arkusz „PECI data analysis” zawiera wszystkie ustalenia analizy: dla każdego procesu wiersz podsumowania (kompletność, braki, uwagi, zatwierdzenie), każda dana ze standardu PL i każda dana opcjonalna z decyzją – czy jest potrzebna w pliku PECI, co ma zrobić Workday, transformacja do standardu Xpertis (format, szczegóły), komentarz i kolumna na odpowiedzi (Response / resolution). Arkusz „Discussions” zawiera wszystkie dyskusje: dla każdej danej wiersz wątku i jego wpisy w kolejności chronologicznej (autor, zespół, data, rodzaj wpisu, zespół do decyzji, treść, status, kto i kiedy rozwiązał, ustalenie), razem ze zmianami statusu próśb (rozwiązano / otwarto ponownie).

## Wersja wieloosobowa

Na GitHub Pages decyzje zapisują się tylko w przeglądarce danej osoby. Żeby wszyscy widzieli te same decyzje, aplikację trzeba umieścić na hostingu z PHP (np. cyber_START! w cyber_Folks) razem z plikami z folderu [`server/`](server/): `api.php` przechowuje wspólne decyzje w pliku `data/state.json` (bez bazy danych), `config.php` – hasło zespołu. Aplikacja sama wykrywa serwer: przy pierwszym wejściu prosi o imię, zespół i hasło zespołu, wysyła zmiany (decyzje i wpisy dyskusji) od razu i co 15 sekund pobiera zmiany innych osób. Wskaźnik „Wspólna baza” w nagłówku pokazuje stan synchronizacji. Instrukcja: [`server/WDROZENIE.txt`](server/WDROZENIE.txt).

## Źródła

- 30 plików PECI z folderu „Sample PECI Files -Poland”, przypisanych do 21 procesów po kodzie zdarzenia i treści zmian (część plików zawiera kilka zmian – Sequence – rozdzielonych między procesy). `Education_Addition.xml` pominięto – wykształcenie jest poza zakresem (decyzja zespołu Workday).
- `PECI_XML_Sections_fields.xlsm`: lista 32 procesów z kodami zdarzeń, przykłady danych dla procesów (arkusze 1–32) i słownik pól PECI.

Dane osobowe z przykładów są zamaskowane (A/a – litera, 9 – cyfra); kody, daty i identyfikatory organizacyjne pokazano bez zmian.

## Zapisywanie

Przy pierwszym wejściu narzędzie prosi o imię i zespół (Xpertis, Chorus, Saint-Gobain); zapisujemy je przy każdej decyzji i w raporcie, a zmienić można je przyciskiem z imieniem w nagłówku. Decyzje zapisują się automatycznie w przeglądarce. Menu „…” → **Zapisz ustalenia do pliku** tworzy plik JSON; druga osoba wczytuje go przez **Wczytaj ustalenia z pliku** (nowsze wpisy zastępują starsze). Przełącznik **PL | EN** zmienia język interfejsu i raportu (także `?lang=en` w linku).

---

<a id="english"></a>
## English

A simple tool for the Xpertis team to go process by process (the 32 processes of `PECI_XML_Sections_fields.xlsm`) through the data Workday sends in the PECI file in the Polish configuration. Each process shows the **PL standard** (data in the PL sample file) and **optional data** (fields `PECI_XML_Sections_fields.xlsm` lists for the process that are not in the standard). Three steps: data completeness (standard and optional data, including whether to add optional data to PL PECI), conversion to the Xpertis format for everything that will reach Xpertis, and confirmation with sign-off. Each data item has a discussion thread below its decision buttons: comments and decision requests addressed to a team (Xpertis, Chorus, Saint-Gobain), which can be marked as resolved with a short resolution; the author, team and time of every entry are saved, every resolution and reopening is kept as a separate record in the shared database (full history in the thread), and open requests are listed on the Status page. The **PECI data analysis report** is an English Excel report. Its “PECI data analysis” sheet has all analysis results: a review row per process (completeness, gaps, notes, sign-off), every PL standard item and every optional item with a decision – whether it is required in the PECI file, the action for Workday, conversion to the Xpertis standard (format, details), comments and a column for answers (Response / resolution). The “Discussions” sheet lists every thread with its entries in chronological order (author, team, date, entry type, team asked to decide, message, status, resolved by and on, resolution), including request status changes (resolved / reopened). On first use the tool asks for your name and team (Xpertis, Chorus, Saint-Gobain), saved with every decision and in the report. Decisions are saved in the browser and can be exchanged as a JSON file. For a shared, multi-user version host the app on any PHP hosting together with the files in [`server/`](server/) (`api.php` stores shared decisions in `data/state.json`, `config.php` holds the team password); the app detects the server, asks for the team password and syncs decisions every 15 seconds. Personal values from the samples are masked.

## Biblioteki · Libraries

[ExcelJS](https://github.com/exceljs/exceljs) 4.4.0 (`vendor/exceljs.min.js`, MIT) · ikony procesów / process icons [Phosphor Icons](https://phosphoricons.com) 2.1.1 duotone (MIT, `vendor/LICENSE-phosphor-icons.txt`) · krój / typeface Atkinson Hyperlegible Next & Mono (`fonts/`, SIL OFL 1.1).
