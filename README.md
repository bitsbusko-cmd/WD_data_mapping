# Workday → Xpertis · analiza danych wejściowych

**PL** · [EN](#english)

Proste narzędzie dla zespołu Xpertis: przejście proces po procesie przez dane, które Workday wysyła w pliku PECI w konfiguracji dla Polski.

Dla każdego procesu są cztery kroki:

1. **Kompletność danych** – każda dana z pliku PECI PL: potrzebna, niepotrzebna albo do wyjaśnienia.
2. **Transformacja** – dla potrzebnych danych: czy trzeba zmienić typ lub zapis i na jaki format Xpertis (z podpowiedzią na podstawie typu w PECI).
3. **Uzupełnienie PECI** – pola, które Workday może wysłać w tym procesie (przykład procesu i słownik PECI z `PECI_XML_Sections_fields.xlsm`), a których nie ma w pliku PL: dodać, nie dodawać albo do wyjaśnienia.
4. **Podsumowanie** – czy dane są kompletne, czego brakuje, uwagi i zatwierdzenie procesu.

Na koniec **Raport Excel** zbiera wszystkie decyzje w czterech arkuszach: Podsumowanie, Dane PECI PL, Transformacje, Uzupełnienie PECI.

## Źródła

- 31 plików PECI z folderu „Sample PECI Files -Poland”, przypisanych do procesów po kodzie zdarzenia i treści zmian (część plików zawiera kilka zmian – Sequence – rozdzielonych między procesy).
- `PECI_XML_Sections_fields.xlsm`: lista 32 procesów z kodami zdarzeń, przykłady danych dla procesów (arkusze 1–32) i słownik pól PECI.

Dane osobowe z przykładów są zamaskowane (A/a – litera, 9 – cyfra); kody, daty i identyfikatory organizacyjne pokazano bez zmian.

## Zapisywanie

Decyzje zapisują się automatycznie w przeglądarce. Menu „…” → **Zapisz ustalenia do pliku** tworzy plik JSON; druga osoba wczytuje go przez **Wczytaj ustalenia z pliku** (nowsze wpisy zastępują starsze). Przełącznik **PL | EN** zmienia język interfejsu i raportu (także `?lang=en` w linku).

---

<a id="english"></a>
## English

A simple tool for the Xpertis team to go process by process through the data Workday sends in the PECI file in the Polish configuration. Each process has four steps: data completeness (needed / not needed / to clarify), conversion to the Xpertis format, PECI additions (fields Workday can send that are missing from the PL file, from the process examples and PECI dictionary in `PECI_XML_Sections_fields.xlsm`) and a summary with sign-off. The **Excel report** collects all decisions. Decisions are saved in the browser and can be exchanged as a JSON file. Personal values from the samples are masked.

## Biblioteki · Libraries

[ExcelJS](https://github.com/exceljs/exceljs) 4.4.0 (`vendor/exceljs.min.js`, MIT) · krój / typeface Atkinson Hyperlegible Next & Mono (`fonts/`, SIL OFL 1.1).
