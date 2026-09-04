# Domain Glossary

Terms and concepts specific to this project. Used across all project skills to maintain a consistent language.

| Term | Code Name | Definition | Avoid saying |
|------|-----------|------------|--------------|
| Droga | `Path` | Najwyższy poziom hierarchii — długoterminowy kierunek życia (np. droga sportu, droga zarobków). Zawiera jedną wizję, listę celów egzekucyjnych i przypisane działania. | "projekt", "kategoria", "obszar" jako osobny byt |
| Wizja | `Vision` | Obraz przyszłości dla danej Drogi: kontener na krótkie notatki i kafelki zdjęć (styl Notion), nie jeden długi dokument. Jedna wizja na Drogę. Eksport scala kafelki w jeden dokument markdown. | "cel", "opis Drogi", "jeden dokument" |
| Notatka wizji | `VisionNote` | Krótki blok tekstu w wizji (jak się chcę czuć, drobne rzeczy). Celowo mały — bez redagowania jednej wielkiej ściany tekstu. | "opis", "dokument wizji" |
| Kafelek zdjęcia | `VisionImage` | Kafelek zdjęcia na tablicy wizji — osobny byt od notatek, tworzy galerię. Z uploadu lub pobrany z Unsplash. | "załącznik notatki" |
| Rzecz po drodze / osiągnięcie | `Achievement` | Coś, co chce się osiągnąć wzdłuż Drogi — niezależne od kolejności, nie zadanie i nie wymaga twardych działań (np. "podciągam się", "muscle-up", "100 pompek"). Wisi bezpośrednio na Drodze. Stan `open` ↔ `achieved` odwracalny. | "milestone" (brzmi sekwencyjnie), "cel egzekucyjny", "zadanie" |
| Cel egzekucyjny | `Goal` | Konkretny podcel z warstwą wykonawczą — zawiera zadania i wymaga konkretnych działań. Zawsze jedna Droga, drzewo podcelów, ręczna kolejność wg priorytetu, opcjonalny deadline z odliczaniem dni. Osiągnięcie ręczne. Stany: `active`/`achieved`/`abandoned`. | "wizja", "achievement", "marzenie" |
| Zadanie / działanie / akcja | `Action` | Atomowa rzecz do zrobienia. Mieszka w inboxie, pod jednym `Goal` (max 1), albo samodzielnie wprost pod `Path`. Przenaszalna między Drogami/celami. Stany: `inbox`/`assigned`/`done`/`abandoned`. `scheduled` = obecność `scheduledDate`. W triage można ją awansować na `Goal`. | "cel", "projekt"; nie mieszać z `Achievement` |
| Inbox | `Inbox` | Miejsce szybkiego przechwytywania pomysłów na działania, zanim zdecyduje się, gdzie należą. | "lista zadań", "backlog celów" |
| Przegląd inboxa | `Triage` | Osobny tryb procesowania inboxa zadanie po zadaniu (wzorzec DoItDone / AutoWork): przypisanie do Path/Goal lub oznaczenie jako samodzielne, ustawienie priorytetu, opcjonalne zaplanowanie lub odrzucenie. | "przeglądanie listy", "sortowanie" |
| Priorytetyzacja parami | `PairwisePrioritization` | Odłożone: porównania każdy-z-każdym wg `Leverage`. Zakres nierozstrzygnięty (cele w Drodze vs akcje). Pomijamy w pierwszej wersji. | "sortowanie", "ustawianie ważności" |
| Właściciel | `Owner` | Jedyny użytkownik. Pełny dostęp do wszystkiego. Brak trybu gościa / read-only / współdzielenia. | "admin", "user" jako osobna rola |
| Unsplash | `Unsplash` | Zewnętrzne źródło zdjęć do kafelków wizji — wyszukiwanie i pobieranie. Wymaga API; zdjęcia niosą atrybucję. | — |
| Zwrot z czasu i energii | `Leverage` | Szacowana wartość działania względem zainwestowanego czasu i energii; podstawa priorytetyzacji. | "ważność", "trudność", "ROI" bez kontekstu |
| Żaba | `Frog` | Wartościowe, nieprzyjemne działanie/cel, które trzeba wykonać, żeby odblokować postęp ("zjedz żabę z rana"). Przełącznik (jak gwiazdka) na `Goal` lub `Action`; żaba na celu propaguje na jego zadania. | "trudne zadanie", "blocker" |
| Widok Dziś | `TodayView` | Główny ekran po wejściu: sekcje per Droga, w każdej zadania z `scheduledDate = dzisiaj`. Osobny widok od list. Nawigacja po dniach (jutro, pojutrze, wstecz). | "dashboard", "lista zadań" |
| Widok harmonogramu | `ScheduleView` | Agenda: nagłówek dnia + zadania, kolejny dzień + zadania. Prawdopodobnie osobny moduł później (kalendarz). | "kalendarz" (na razie) |
| Plan tygodnia | `WeeklyPlan` | Odłożone: miękki wybór działań na tydzień z góry. Nie w pierwszej wersji — `TodayView` + nawigacja po dniach + `ScheduleView` na razie wystarczą. | "sprint", "deadline" |
| Log / historia małych zwycięstw | `WinLog` | Dopisywalna (append-only) historia ukończonych działań i osiągniętych celów. Główne paliwo motywacyjne — przeciwwaga dla negative bias. | "dziennik", "raport", "statystyki" |
| Małe zwycięstwo | `Win` | Pojedynczy wpis w logu: ukończone `Action` lub osiągnięty `Goal`. | "zadanie", "event" |
| Wykres kontrybucji | `ContributionGraph` | Wizualizacja w stylu GitHub contribution graph — skumulowana liczba zwycięstw w stronę celu / Drogi w czasie. Nacisk na kumulację, nie na procent ukończenia. | "wykres postępu %", "statystyki", "burndown" |

**Code Name** to angielska nazwa używana w kodzie (foldery, komponenty, encje, endpointy) — nawet gdy rozmowa toczy się po polsku.
