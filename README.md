# protyper

Aplikacja webowa do **typowania wyników meczów piłkarskich** w ramach **własnych lig**. Gracze zbierają punkty według zasad punktacji, rywalizują w rankingu i śledzą historię typów. Frontend (Angular) komunikuje się z backendem API (Node/Express, baza przez Prisma).

---

## Role i dostęp

| Rola | Po zalogowaniu trafia do | Dostęp |
|------|---------------------------|--------|
| **Gość** | Strona marketingowa (`/landing`), logowanie, rejestracja | Bez konta |
| **Użytkownik** | Kokpit (`/dashboard`) | Typowanie, ligi, ranking, historia, subskrypcja, profil |
| **Administrator** | Panel admina (`/admin`) | Zarządzanie rozgrywkami, drużynami, meczami i wynikami; strona Support (placeholder) |

Routowanie zależy od roli (np. użytkownik nie wejdzie na `/admin`, admin jest przekierowywany z typowych stron gracza na panel).

---

## 1. Strona marketingowa (Landing)

- Prezentacja produktu: hero, sekcje funkcji, punktacja, plany cenowe (Light / Standard / Gold), FAQ, CTA.
- Linki do rejestracji i logowania.
- Dla zalogowanych użytkowników wejście na `/` lub `/landing` przekierowuje na kokpit lub panel admina.

---

## 2. Konto i uwierzytelnianie

### Rejestracja (`/register`)

- Utworzenie konta: e-mail, hasło, nazwa użytkownika.
- Automatyczne logowanie po udanej rejestracji (token w `localStorage`).

### Logowanie (`/login`)

- Logowanie e-mailem i hasłem.
- Sesja oparta o token JWT (odświeżenie profilu przez `/auth/me` przy starcie aplikacji).

### Wylogowanie

- Czyszczenie tokena i przekierowanie na stronę logowania.

---

## 3. Kokpit (`/dashboard`)

Główny ekran gracza po wyborze **aktywnej ligi** (stan zapamiętywany w aplikacji).

### Kafel „Typuj teraz”

- Skrót do bieżącej kolejki: nazwa ligi, powiązane rozgrywki, Twoje punkty w lidze.
- Stan „Na żywo” vs zakończona liga; przejście do ekranu typów (gdy rozgrywki trwają).

### Statystyki globalne

- **Punkty** łącznie, **dokładne** wyniki, **trafione** (poprawny rezultat / różnica — wg logiki punktacji).

### Ranking (skrót)

- Link do pełnego widoku rankingu w lidze.

### Moje ligi

- Lista lig, które **utworzyłeś** (właściciel).
- Ustawianie **aktywnej ligi** jednym kliknięciem.
- **Nowa liga** (jeśli plan na to pozwala): nazwa + wybór jednej lub wielu **rozgrywek** zdefiniowanych w systemie.
- **Kod zaproszenia** — wyświetlenie i udostępnianie innym.
- **Usunięcie ligi** (właściciel) lub wyjście — w zależności od roli w lidze.

### Dołączyłem

- Ligi, do których dołączono kodem; przełączanie aktywnej ligi, **opuszczenie** ligi.

### Nadchodzące mecze

- Lista meczów bieżącej perspektywy (czas, data, pary drużyn, ewentualnie Twój typ).
- Przejście do pełnego widoku typowania.

---

## 4. Dołączanie do ligi (`/join-league`)

- Wpis **kodu zaproszenia** (udostępnionego przez właściciela).
- Po sukcesie: odświeżenie listy lig, ustawienie nowej ligi jako aktywnej i powrót do kokpitu.

---

## 5. Typowanie (`/predictions`)

Działa w kontekście **aktywnej ligi**.

- Ładowanie **bieżącej kolejki** i meczów.
- Dla każdego meczu: **typ (gole:gole)**, z uwzględnieniem **terminu zamknięcia typów** (deadline); po terminie pola są zablokowane.
- **Zapis typów** do serwera (wielokrotna edycja przed zamknięciem, o ile deadline na to pozwala).
- Po rozegraniu kolejki: widok **rzeczywistych wyników** i **punktów za każdy mecz** (kolorem odróżnione poziomy trafień).
- Podsumowanie **punktów za całą kolejkę**.
- **Właściciel ligi** może przejść do **następnej kolejki** po zakończeniu obecnej (sterowanie progresją rozgrywki w lidze).
- Obsługa stanów brzegowych: brak ligi, brak kolejki, zakończone rozgrywki, błędy sieci.

---

## 6. Ranking (`/ranking`)

- Posortowana lista graczy w **aktywnej lidze**: pozycja, avatar, nazwa, rola (właściciel / uczestnik), suma punktów.
- Wyróżnienie podium i **Twojej** pozycji.
- **Plan Light**: widok ograniczony do **top 3 + Ty**; pełny ranking po ulepszeniu subskrypcji (komunikat z linkiem do `/subscription`).

---

## 7. Historia (`/history`)

- Lista **zakończonych kolejek** w aktywnej lidze.
- Dla każdej kolejki: mecze, **Twój typ** (lub „Brak”), **faktyczny wynik**, **zdobyte punkty** przy meczu oraz suma punktów za kolejkę.

---

## 8. Subskrypcja i płatności (`/subscription`)

### Plany (konfigurowane w API)

Typowo:

- **Light** — darmowy; limity tworzenia / dołączania do lig; ograniczony widok rankingu; bez customowej punktacji.
- **Standard** — płatny; szersze limity / pełniejsze statystyki (wg konfiguracji w bazie).
- **Gold** — m.in. **własne zasady punktacji** (`custom scoring`) dla lig, których jesteś właścicielem (zgodnie z backendem).

### Płatności (Stripe)

- **Kup plan** — przekierowanie do Stripe Checkout (gdy płatności są skonfigurowane).
- **Zarządzaj subskrypcją** — Stripe Customer Portal dla aktywnych płatnych planów.
- **Historia płatności** na tej samej stronie.
- Gdy Stripe nie jest skonfigurowany — komunikat informacyjny zamiast zakupu.

### Strony powrotu z płatności

- `/payment-success`, `/payment-cancel` — obsługa po powrocie z bramki.

---

## 9. Profil (`/profile`)

- Podgląd: nazwa, e-mail, rola, aktualny plan subskrypcji.
- **Edycja profilu** (np. nazwa użytkownika; avatar jako identyfikator ikony Material).
- Globalne statystyki typów (punkty, dokładne, trafione), spójne z kokpitem.

---

## 10. Panel administratora (`/admin`)

Zarządzanie danymi „źródłowymi” używanymi przez ligi graczy. Zakładki:

### Rozgrywki

- **Tworzenie** rozgrywki: nazwa, typ (turniej / liga / własne), sezon.
- **Edycja** (w tym oznaczenie jako zakończonej) i **usuwanie**.
- Lista drużyn przypisanych do rozgrywki.

### Drużyny

- Wybór rozgrywki, **masowe dodawanie** nazw drużyn (wiele linii), edycja i usuwanie pojedynczych drużyn.

### Mecze

- Definiowanie spotkań (gospodarz / gość), terminy typowania (deadline), edycja i usuwanie.

### Wyniki (kolejki)

- Tworzenie **kolejek** i przypisywanie meczów / par.
- **Wprowadzanie wyników** dla kolejki — podstawa do naliczania punktów typów w ligach.

---

## 11. Support (`/support`)

- Miejsce pod przyszły moduł zgłoszeń; obecnie **placeholder** („w budowie”).

---

## 12. Punktacja (logika biznesowa)

Domyślnie (gdy liga nie ma własnych zasad):

- punkty za **dokładny wynik**, **trafioną różnicę bramek**, **trafiony wynik** (zwycięzca / remis), **brak punktów** za pudło.

**Własne zasady** — właściciel ligi z uprawnieniami **Gold** (lub admin) może nadpisać wartości przez API (`PUT /leagues/:id/scoring`); w przeciwnym razie backend zwraca `403`.

Brak typu przy zamkniętej kolejce jest traktowany jak **0 punktów** przy liczeniu.

---

## 13. Backend (skrót)

Główne obszary API (REST):

- **Auth** — rejestracja, logowanie, profil.
- **Competitions / teams / matches / rounds** — model rozgrywek i kolejek (admin + wyniki).
- **Leagues** — CRUD lig, powiązania z rozgrywkami, **kody zaproszeń**, dołączanie / opuszczanie.
- **Predictions** — zapis i odczyt typów w kontekście ligi i kolejki.
- **Ranking, table, history** — agregaty dla ligi (z filtrami rozgrywki tam, gdzie ma to zastosowanie).
- **Scoring** — odczyt i aktualizacja reguł punktacji ligi.
- **Subscription plans, payments** — plany, Stripe checkout, portal, historia płatności.
- **Users (admin)** — m.in. zmiana roli użytkownika i przypisania planu.

---

## Uruchomienie frontendu (skrót)

**Wymagania:** Node.js  

```bash
npm install
npm run dev
```

Konfiguracja API: adres backendu w pliku środowiska aplikacji Angular (`environment`).  

Opcjonalnie: zmienne związane z integracjami (np. klucze) zgodnie z dokumentacją projektu.

Backend uruchamia się osobno z katalogu `backend/` (w razie potrzeby dodaj tam własny opis startu i zmiennych `.env`).

---

## Nazewnictwo w repozytorium

Pakiet npm w `package.json` może nosić nazwę techniczną `protyper`; w interfejsie używana jest marka **protyper** (landing, nagłówki).
