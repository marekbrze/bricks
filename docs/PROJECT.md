# Bricks

## Core Idea
Osobiste, lokalne narzędzie do świadomego osiągania celów, zbudowane wokół metafory **Drogi** (np. droga sportu, droga zarobków). Każde wykonane działanie to cegiełka, która odkłada się w historii — a rosnąca seria małych zwycięstw jest głównym paliwem motywacyjnym.

Inspirowane kursami Rafała Mazura ("Motywacja bez motywacji", "Uwolnij zakładnika"): osiąganie celów = określona droga + proces codziennego działania + dużo małych zwycięstw, które kumulują się w czasie.

## User Problems

- **Griply jest zamknięte**: brak API, więc nie da się budować własnych narzędzi do procesowania i rozdzielania zadań między cele. Dziś użytkownik jest uwiązany do tego, co narzędzie oferuje, i mu się to nie podoba.
- **Trudne przenoszenie zadań między celami**: w Griply nie da się łatwo przeciągać zadań pomiędzy celami; struktura jest sztywna.
- **Brak logu codziennego działania**: Griply nie pokazuje historii tego, co robiło się dzień po dniu w stronę celu. To najważniejszy brak — bez tej historii nie widać postępu, a człowiek z natury (negative bias) patrzy na to, czego brakuje, zamiast na przebytą drogę. Dziś użytkownik prowadzi log ręcznie w osobnym projekcie na GitHubie.
- **Brak poczucia postępu i kumulacji**: po serii zwycięstw chce się kolejnego — ale tylko jeśli widać tę serię. Bez wizualizacji "ile już zrobiłem" (jak GitHub contribution graph) trudno utrzymać rozpęd.
- **Brak priorytetyzacji wg dźwigni**: użytkownik chce wiedzieć, które działania dają największy zwrot z zainwestowanego czasu i energii, a które są "żabami" do rozwiązania — dziś musi to trzymać w głowie.

## Target Users
Przede wszystkim sam autor. Osoba pracująca nad kilkoma długoterminowymi kierunkami życia jednocześnie (sport, zarobki), która myśli w kategoriach świadomego budowania przyszłości, a nie reaktywnego zarządzania listą zadań. Ceni narzędzia otwarte (API, własne skrypty), lokalną kontrolę nad danymi, i procesy zadanie-po-zadaniu (zna DoItDone, AutoFocus/AutoWork, prowadzi własne Open Loops). Odbił się od zamkniętych aplikacji do celów.

Narzędzie osobiste, single-user, dane trzymane lokalnie (planowany Dexie + LocalStorage), bez kont i współdzielenia.

## Key Actions

1. **Zbuduj Drogę i jej wizję** — utwórz Drogę, opisz wizję (dokument markdown + zdjęcia + checklista rzeczy "po drodze", które nie wymagają twardych działań, np. "podciągam się", "dotykam rękami podłogi").
2. **Wrzuć pomysł do inboxa** — szybkie przechwycenie pomysłu na działanie (np. "kupić gumę do rozciągania") bez decydowania od razu, gdzie należy.
3. **Przejrzyj inbox (triage)** — osobny tryb, zadanie po zadaniu: przypisz do Drogi/celu albo oznacz jako samodzielne działanie, ustaw priorytet (porównania parami wg zwrotu z czasu i energii), opcjonalnie zaplanuj na dzień lub wyrzuć.
4. **Zaplanuj i wykonaj działania dnia** — głównie codziennie wybierasz z puli dostępnych działań (opcjonalnie planujesz tydzień z góry, ale bieżący tydzień wpływa na to, co realnie można wziąć). Jasno oznaczone, co jest wartościowe i co jest "żabą".
5. **Domknij zwycięstwo i przejrzyj log** — ukończone działanie / osiągnięty cel odkłada się w logu; wracasz do historii i wykresu kontrybucji, żeby zobaczyć skumulowany postęp w stronę celu.

## Happy Path

1. Użytkownik otwiera aplikację rano.
2. Widzi krótkie podsumowanie swojej wizji i celów — do czego dąży (akapit, nie ściana tekstu).
3. Widzi listę działań na dziś, z zaznaczeniem, które są najbardziej wartościowe i które są "żabami".
4. Wybiera działanie i je wykonuje; oznacza jako ukończone.
5. Zwycięstwo trafia do logu; licznik działań w stronę danego celu rośnie, wykres kontrybucji dostaje kolejny wpis.
6. W ciągu dnia wrzuca nowe pomysły do inboxa, nie przerywając pracy na decydowanie, gdzie należą.
7. W osobnym momencie (przegląd inboxa) procesuje zebrane pomysły zadanie po zadaniu: przypisanie do Drogi/celu lub samodzielne działanie + priorytet parami.
8. Wieczorem / na koniec tygodnia zagląda do logu i wykresu, żeby zobaczyć przebytą drogę — co napędza kolejny dzień.

## Open Questions

- **Otwartość / API** to jawny wyróżnik wobec Griply, ale prototyp jest lokalny (Dexie + LocalStorage). Ile z "otwartości" ma być widoczne w prototypie (eksport/import, kształt danych, hooki), a ile to cel na później?
- **Do czego może należeć działanie?** Do celu egzekucyjnego, wprost do Drogi (przykład "kupić gumę"), czy także do pozycji na checkliście wizji? Checklista wizji z definicji "nie ma twardych działań" — jak to pogodzić.
- **Wizja: jedna czy wiele na Drogę?** Na początku padło "mam dwie wizje", później ustaliliśmy jedną wizję na Drogę. Do potwierdzenia.
- **Osiągnięcie celu** — automatyczne po ukończeniu wszystkich zadań, czy ręczne oznaczenie?
- **Priorytetyzacja parami** — pełne porównania każdy-z-każdym czy lżejszy mechanizm? Jak to skaluje się przy dużym inboxie?
- **"Żaba"** — ręczna flaga czy pochodna czegoś (np. wysoka dźwignia + niski komfort)?
- **Planowanie tygodnia vs dnia** — jak współistnieją? Czy plan tygodnia to tylko lista sugestii na dni?
- **Licznik działań** — "względem wszystkich zadań" vs czysto kumulatywny wykres. Ustalono, że ważniejszy jest kumulatywny wykres w stylu GitHub; czy licznik "X z Y" jest w ogóle potrzebny?
- **Wizja jako markdown + zdjęcia** — jak wygląda edycja i gdzie lądują zdjęcia przy przechowywaniu lokalnym?
