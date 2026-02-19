# TrygKode — QA Bug Report

**Dato:** 19. februar 2026  
**Scope:** Alle skærme og flows (Onboarding, MitID, Hjem, Kontakt-detalje, Tilføj kontakt, Svindelinfo, Indstillinger)  
**Metode:** Code review (appen kører på localhost:8081; der kunne ikke tages skærmbilleder fra testmiljøet)

---

## Kort overblik

| Severity | Antal |
|----------|--------|
| Critical | 1 |
| Major | 5 |
| Minor | 5 |
| Cosmetic | 4 |

---

## Critical

### C-1: Tilføj kontakt — Gemt kodeord kan afvige fra det viste kodeord

**Skærm:** Tilføj kontakt (alle 3 trin)  
**Fil:** `src/features/contacts/AddContactScreen.tsx`

**Problem:**  
`generatedCode` beregnes på hver render:

```ts
const generatedCode = codeType === 'static' ? generateCodeWord() : generateRotatingCode();
```

Når brugeren er på trin 2 (kodeord) eller 3 (del), genereres der et nyt kodeord ved hver re-render. Det betyder:

- Brugeren ser f.eks. "jordbær-solskin" på trin 2 og 3.
- Ved "Gem kontakt" bruges `finalCode = customCode.trim() || generatedCode`, hvor `generatedCode` nu kan være et nyt ord (f.eks. "vikinge-rugbrød").
- Resultat: Kontakten gemmes med et andet kodeord end det, brugeren har set og evt. delt.

**Anbefaling:**  
Gem det valgte/genererede kodeord i state, når brugeren går til trin "code", eller når de vælger type (static/rotating). Brug derefter kun denne værdi til visning og ved "Gem kontakt". F.eks. `const [generatedCode, setGeneratedCode] = useState('')` og sæt den ved step-skift eller ved ændring af `codeType`.

---

## Major

### M-1: Hjem — Mock-kontakter kommer tilbage efter sletning af alle

**Skærm:** Hjem  
**Fil:** `src/features/home/HomeScreen.tsx`

**Problem:**  
Mock-kontakter tilføjes hver gang `contacts.length === 0`:

```ts
useEffect(() => {
  if (contacts.length === 0) {
    mockContacts.forEach(addContact);
  }
}, []);
```

Hvis brugeren sletter alle kontakter og vender tilbage til Hjem, bliver de 4 mock-kontakter (Mor, Far, Søster, Bedstefar) tilføjet igen. Det strider mod forventningen om, at "fjern kontakt" er permanent.

**Anbefaling:**  
Kun seed mock data én gang (f.eks. ved første kørsel eller via en "dev seed"-flag i store), ikke når listen tilfældigvis er tom.

---

### M-2: Tilføj kontakt — Ingen validering af længde for eget kodeord

**Skærm:** Tilføj kontakt (trin 2 og 3)  
**Fil:** `src/features/contacts/AddContactScreen.tsx`

**Problem:**  
På kontakt-detalje er der krav om mindst 3 tegn ved "Skriv eget kodeord". I Tilføj kontakt kan brugeren skrive 1–2 tegn i "Skriv jeres kodeord", gå videre til "Del kodeordet" og trykke "Gem kontakt" uden validering. Korte kodeord gemmes dermed.

**Anbefaling:**  
Tilføj samme krav (min. 3 tegn) i Tilføj kontakt: enten i `handleContinue` ved overgang fra "code" til "share", eller i `handleSave` med en Alert ved for kort `customCode`, og brug ellers `generatedCode` hvis feltet er tomt.

---

### M-3: Indstillinger — "Privatlivspolitik" og "Hjælp og support" gør intet

**Skærm:** Indstillinger  
**Fil:** `src/features/settings/SettingsScreen.tsx`

**Problem:**  
Begge links har tom handler:

```ts
onPress: () => {},  // Privatlivspolitik
onPress: () => {},  // Hjælp og support
```

Ingen navigation, ingen Alert, ingen ekstern side. Brugeren får ingen feedback.

**Anbefaling:**  
Tilføj mindst en midlertidig handling (f.eks. Alert med "Kommer snart" eller link til en side/URL), indtil rigtig privatlivspolitik og support er på plads.

---

### M-4: Indstillinger — Rediger profil (blyant-ikon) gør intet

**Skærm:** Indstillinger  
**Fil:** `src/features/settings/SettingsScreen.tsx`

**Problem:**  
`TouchableOpacity` omkring blyant-ikonet har ingen `onPress`:

```ts
<TouchableOpacity style={styles.editProfile}>
  <Ionicons name="pencil" size={18} color={colors.primary} />
</TouchableOpacity>
```

Brugeren kan ikke redigere profil.

**Anbefaling:**  
Tilføj `onPress` der åbner en profilredigeringsskærm eller Alert, indtil funktionen er implementeret.

---

### M-5: MitID fejlskærm — Teknisk "Redirect URI" vises til brugeren

**Skærm:** MitID (fejlstate)  
**Fil:** `src/features/onboarding/MitIDScreen.tsx`

**Problem:**  
I fejlvisningen står:

```ts
<Text style={styles.debugText}>
  Redirect URI: {mitidConfig.redirectUri}
</Text>
```

Det er udvikler-/debug-info og kan forvirre eller bekymre almindelige brugere.

**Anbefaling:**  
Fjern denne linje fra brugerfladen, eller vis den kun i `__DEV__` / ved debug-tilstand.

---

## Minor

### N-1: MitID verificeret — Demo-kort kan vise "MitID verificeret" i stedet for "Demo-tilstand"

**Skærm:** MitID (efter "Prøv uden MitID (demo)")  
**Fil:** `src/features/onboarding/MitIDScreen.tsx`

**Problem:**  
Ved demo-login sættes `setUseDemo(true)` og derefter kaldes `handleDemoLogin()`. Da setState er asynkron, kan `useDemo` stadig være `false` når "verified"-skærmen renderer, så brugeren ser "MitID verificeret" i stedet for "Demo-tilstand — ikke MitID-verificeret".

**Anbefaling:**  
Overvej at sende en demo-flag direkte til `handleDemoLogin` (f.eks. `handleDemoLogin(true)`) og bruge den til at vælge korttekst, så det ikke afhænger af state-timing.

---

### N-2: Hjem — Notifikationsklokke har ingen handling

**Skærm:** Hjem  
**Fil:** `src/features/home/HomeScreen.tsx`

**Problem:**  
`rightAction` på header er sat sådan her:

```ts
rightAction={{ icon: 'notifications-outline', onPress: () => {} }}
```

Ingen feedback eller navigation ved tryk.

**Anbefaling:**  
Tilføj f.eks. navigation til en notifikationsliste eller en Alert ("Kommer snart"), indtil funktionen er implementeret.

---

### N-3: Ordliste til kodeord — Stavefejl i dansk ord

**Fil:** `src/utils/codeGenerator.ts`

**Problem:**  
I `DANISH_WORDS` står:

```ts
'kanelsngl'  // forkert
```

Korrekt dansk er **kanelsnegl** (snegle).

**Anbefaling:**  
Ret til `'kanelsnegl'`.

---

### N-4: Onboarding — scrollToIndex kan fejle før layout

**Skærm:** Onboarding  
**Fil:** `src/features/onboarding/OnboardingScreen.tsx`

**Problem:**  
Ved "Næste" bruges `flatListRef.current?.scrollToIndex({ index: currentIndex + 1 })`. På nogle enheder/tidspunkter kan FlatList ikke have målt layout endnu, hvilket kan give fejl eller ingen scroll.

**Anbefaling:**  
Brug `scrollToOffset` med `width * (currentIndex + 1)` som fallback, eller forsink "Næste"-scroll til efter layout (f.eks. med `onLayout` eller `requestAnimationFrame`).

---

### N-5: Mock-data — "Bedstefor" bør være "Bedstefar"

**Fil:** `src/utils/mockData.ts`

**Problem:**  
Kontaktnavnet er "Bedstefor (Ole)". I dansk er det normalt **Bedstefar** (bedstefar) eller **Bedstemor**.

**Anbefaling:**  
Ret til f.eks. `'Bedstefar (Ole)'` medmindre "Bedstefor" er bevidst.

---

## Cosmetic

### CO-1: Mock-kontakter — Navne med parenteser

**Fil:** `src/utils/mockData.ts`

**Observation:**  
Testbeskrivelsen nævnte "Mor Karen, Far Henrik, Søster Maria, Bedstefor Ole". I koden står "Mor (Karen)", "Far (Henrik)" osv. Det er konsistent og læsbart; det er kun en forskel i præsentation (med/uden parenteser).

**Anbefaling:**  
Ingen ændring nødvendig, medmindre design specifikt kræver "Mor Karen" uden parenteser.

---

### CO-2: Svindelinfo-modal — Titel er kategori, ikke tip-titel

**Skærm:** Svindelinfo → Læs mere  
**Fil:** `src/features/scaminfo/ScamInfoScreen.tsx`

**Observation:**  
Modal-header bruger `getCategoryLabel(selectedTip?.category)` som titel ("Advarsel", "Tip", "Nyhed") i stedet for tip-titlen. Indholdet viser tip-titlen i brødteksten. Det kan være bevidst, men brugeren ser ikke tip-titlen i headeren.

**Anbefaling:**  
Overvej at vise tip-titlen i header (evt. sammen med kategori-badge) for bedre genkendelighed.

---

### CO-3: Button — Ikone og tekst kan stå i forkert rækkefølge

**Fil:** `src/components/Button.tsx`

**Observation:**  
I render står `{icon}` før `<Text>`. På kontakt-detalje bruges icon i alle tre knapper; rækkefølgen er dermed ikon → tekst. Hvis designet ønsker "tekst først" på visse knapper, kræver det enten en `iconPosition` prop eller at parent sender ikon efter teksten (hack). Ingen fejl, men begrænset fleksibilitet.

**Anbefaling:**  
Evt. tilføj `iconPosition?: 'left' | 'right'` til Button for konsistent layout.

---

### CO-4: Ingen skærmbilleder i rapport

**Metode:**  
Appen kører på localhost:8081; der kunne ikke tages skærmbilleder fra testmiljøet. Alle fund er baseret på code review.

**Anbefaling:**  
Kør manuel eller automatiseret UI-test på enhed/emulator og tilføj skærmbilleder til fremtidige rapporter.

---

## Testscenarier — status (code review)

| Område | Scenario | Status |
|--------|----------|--------|
| **Onboarding** | Swipe gennem 3 trin | OK (FlatList horizontal paging) |
| | "Næste" på hvert trin | OK (C-1/N-4: mulig scroll-robusthed) |
| | "Spring over" | OK |
| | Dots/progress | OK (synkroniseres med onMomentumScrollEnd) |
| **MitID** | "Log ind med MitID" | Kan fejle (forventet uden broker) — fejl vises |
| | "Prøv uden MitID (demo)" | OK |
| | "Fortsæt til TrygKode" efter demo | OK |
| **Hjem** | 4 mock-kontakter | OK (navne med parenteser, se CO-1; M-1 ved sletning af alle) |
| | Velkomstkort, +, klokke, tabs | OK (N-2: klokke gør intet) |
| **Kontakt-detalje** | Vis/skjul kodeord, check-in, nyt kodeord, skriv eget, fjern (annuller), tilbage | OK |
| **Tilføj kontakt** | Navn, telefon, fast/skiftende, eget kodeord, 3 trin, gem, tilbage | C-1 og M-2 |
| **Svindelinfo** | 4 tips, "Læs mere", modal, luk | OK (CO-2: modal-titel) |
| **Indstillinger** | Profilkort, biometri, notifikationer, links | M-3, M-4 for tomme links og blyant |
| **Sprog/UI** | Dansk tekst, farver, layout | OK (N-3: kanelsnegl; N-5: Bedstefar) |

---

## Anbefalede rettelser i rækkefølge

1. **C-1** — Fix genereret kodeord i Tilføj kontakt (state, ikke beregning i render).
2. **M-1** — Seed mock-kontakter kun én gang.
3. **M-2** — Valider kodeordlængde (min. 3 tegn) i Tilføj kontakt.
4. **M-3** — Giv "Privatlivspolitik" og "Hjælp og support" midlertidig eller rigtig handling.
5. **M-4** — Tilføj onPress på rediger-profil (blyant).
6. **M-5** — Fjern eller skjul "Redirect URI" på MitID-fejlskærm.
7. **N-1** til **N-5** og **CO-1** til **CO-4** som tid tillader.

---

*Rapport udarbejdet ud fra code review af TrygKode. Anbefales suppleret med manuel test på enhed/emulator og skærmbilleder.*
