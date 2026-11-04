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

Na koniec **Raport Excel** zbiera wszystkie decyzje w czterech arkuszach: Podsumowanie, Standard PL, Transformacje, Dane opcjonalne.

**Raport dla Workday (EN)** (dashboard albo menu „…”) to jeden arkusz po angielsku dla zespołu technicznego Workday: pola do dodania do PECI PL, pytania („do wyjaśnienia”) i zgłoszone braki – z sekcją, ścieżką XML, opisem z PECI Dictionary, źródłem wymagania i kolumną na odpowiedź Workday.

## Źródła

- 30 plików PECI z folderu „Sample PECI Files -Poland”, przypisanych do 21 procesów po kodzie zdarzenia i treści zmian (część plików zawiera kilka zmian – Sequence – rozdzielonych między procesy). `Education_Addition.xml` pominięto – wykształcenie jest poza zakresem (decyzja zespołu Workday).
- `PECI_XML_Sections_fields.xlsm`: lista 32 procesów z kodami zdarzeń, przykłady danych dla procesów (arkusze 1–32) i słownik pól PECI.

Dane osobowe z przykładów są zamaskowane (A/a – litera, 9 – cyfra); kody, daty i identyfikatory organizacyjne pokazano bez zmian.

## Zapisywanie

Przy pierwszym wejściu narzędzie prosi o imię i zespół (Xpertis, Workday, Saint-Gobain); zapisujemy je przy każdej decyzji i w raporcie, a zmienić można je przyciskiem z imieniem w nagłówku. Decyzje zapisują się automatycznie w przeglądarce. Menu „…” → **Zapisz ustalenia do pliku** tworzy plik JSON; druga osoba wczytuje go przez **Wczytaj ustalenia z pliku** (nowsze wpisy zastępują starsze). Przełącznik **PL | EN** zmienia język interfejsu i raportu (także `?lang=en` w linku).

---

<a id="english"></a>
## English

A simple tool for the Xpertis team to go process by process (the 32 processes of `PECI_XML_Sections_fields.xlsm`) through the data Workday sends in the PECI file in the Polish configuration. Each process shows the **PL standard** (data in the PL sample file) and **optional data** (fields `PECI_XML_Sections_fields.xlsm` lists for the process that are not in the standard). Three steps: data completeness (standard and optional data, including whether to add optional data to PL PECI), conversion to the Xpertis format for everything that will reach Xpertis, and confirmation with sign-off. The **Excel report** collects all decisions. The **Report for Workday (EN)** is a single English sheet for the Workday technical team: fields to add to the PL PECI output, questions and reported gaps, with section, XML path, PECI Dictionary description, requirement source and a column for Workday's response. On first use the tool asks for your name and team (Xpertis, Workday, Saint-Gobain), saved with every decision and in the report. Decisions are saved in the browser and can be exchanged as a JSON file. Personal values from the samples are masked.

## Biblioteki · Libraries

[ExcelJS](https://github.com/exceljs/exceljs) 4.4.0 (`vendor/exceljs.min.js`, MIT) · ikony procesów / process icons [Phosphor Icons](https://phosphoricons.com) 2.1.1 duotone (MIT, `vendor/LICENSE-phosphor-icons.txt`) · krój / typeface Atkinson Hyperlegible Next & Mono (`fonts/`, SIL OFL 1.1).
