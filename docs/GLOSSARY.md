# Domain Glossary

Terms and concepts specific to this project. Used across all project skills to maintain a consistent language.

| Term | Code Name | Definition | Avoid saying |
|------|-----------|------------|--------------|
| Droga | `Path` | Najwyższy poziom hierarchii — długoterminowy kierunek życia (np. droga sportu, droga zarobków). Zawiera jedną wizję, listę celów egzekucyjnych i przypisane działania. | "projekt", "kategoria", "obszar" jako osobny byt |
| Wizja | `Vision` | Obraz przyszłości dla danej Drogi: dokument markdown + zdjęcia (vision board) + checklista rzeczy "po drodze". Jedna wizja na Drogę. | "cel", "opis Drogi", "notatka" |
| Rzecz po drodze | `Milestone` | Pozycja na checkliście wizji — coś, co chce się osiągnąć wzdłuż Drogi, bez wymaganych twardych działań (np. "podciągam się", "dotykam rękami podłogi"). Aspiracyjny znacznik, nie jednostka pracy. | "cel egzekucyjny", "zadanie", "task" |
| Cel egzekucyjny | `Goal` | Konkretny podcel z warstwą wykonawczą — zawiera zadania i wymaga konkretnych działań, żeby iść do przodu. Byt osobny od wizji i od Milestone. | "wizja", "milestone", "marzenie" |
| Zadanie / działanie / akcja | `Action` | Atomowa rzecz do zrobienia. Należy do Goala albo jest samodzielna (podpięta wprost pod Path). Można ją zaplanować na konkretny dzień. Po ukończeniu trafia do logu. | "cel", "projekt"; nie mieszać z `Milestone` |
| Inbox | `Inbox` | Miejsce szybkiego przechwytywania pomysłów na działania, zanim zdecyduje się, gdzie należą. | "lista zadań", "backlog celów" |
| Przegląd inboxa | `Triage` | Osobny tryb procesowania inboxa zadanie po zadaniu (wzorzec DoItDone / AutoWork): przypisanie do Path/Goal lub oznaczenie jako samodzielne, ustawienie priorytetu, opcjonalne zaplanowanie lub odrzucenie. | "przeglądanie listy", "sortowanie" |
| Priorytetyzacja parami | `PairwisePrioritization` | Ustalanie kolejności działań przez porównania każdy-z-każdym (albo lżejszy wariant) wg przewidywanego zwrotu z czasu i energii. Element Triage. | "sortowanie", "ustawianie ważności" |
| Zwrot z czasu i energii | `Leverage` | Szacowana wartość działania względem zainwestowanego czasu i energii; podstawa priorytetyzacji. | "ważność", "trudność", "ROI" bez kontekstu |
| Żaba | `Frog` | Wartościowe, nieprzyjemne działanie, które trzeba wykonać, żeby odblokować postęp ("zjedz żabę z rana"). Wyróżniane na liście dnia. | "trudne zadanie", "blocker" |
| Plan dnia | `DailyPlan` | Zestaw działań wybranych na konkretny dzień. Wybierane głównie codziennie z puli dostępnych; bieżący tydzień wpływa na to, co realnie można wziąć. | "harmonogram", "kalendarz" |
| Plan tygodnia | `WeeklyPlan` | Opcjonalny wstępny wybór działań na tydzień; miękka rama, nie zobowiązanie. | "sprint", "deadline" |
| Log / historia małych zwycięstw | `WinLog` | Dopisywalna (append-only) historia ukończonych działań i osiągniętych celów. Główne paliwo motywacyjne — przeciwwaga dla negative bias. | "dziennik", "raport", "statystyki" |
| Małe zwycięstwo | `Win` | Pojedynczy wpis w logu: ukończone `Action` lub osiągnięty `Goal`. | "zadanie", "event" |
| Wykres kontrybucji | `ContributionGraph` | Wizualizacja w stylu GitHub contribution graph — skumulowana liczba zwycięstw w stronę celu / Drogi w czasie. Nacisk na kumulację, nie na procent ukończenia. | "wykres postępu %", "statystyki", "burndown" |

**Code Name** to angielska nazwa używana w kodzie (foldery, komponenty, encje, endpointy) — nawet gdy rozmowa toczy się po polsku.
