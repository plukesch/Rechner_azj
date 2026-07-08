# Firebase einrichten – Schritt für Schritt

Diese Anleitung machst **du** einmal von Hand. Danach läuft die App.
Alles hier ist mit der **kostenlosen** Firebase-Version (Spark-Plan) möglich.

---

## 1. Firebase-Projekt anlegen

1. Gehe auf https://console.firebase.google.com/
2. **„Projekt hinzufügen"** klicken.
3. Name z. B. `rechner-azj`. Google Analytics kannst du **deaktivieren** (nicht nötig).
4. Projekt erstellen und warten, bis es fertig ist.

## 2. Anmeldung (Authentication) aktivieren

1. Links im Menü: **Build → Authentication → „Los geht's"**.
2. Tab **„Sign-in method"**.
3. **„E-Mail/Passwort"** auswählen → **Aktivieren** (nur den oberen Schalter) → **Speichern**.

> Es gibt keinen öffentlichen Registrierungslink. Anmelden kann sich nur, wer
> in der App ein Konto anlegt – und das geht nur mit dem Zugangscode **AZJ-2026**.

## 3. Firestore-Datenbank anlegen

1. Links: **Build → Firestore Database → „Datenbank erstellen"**.
2. Modus: **„Im Produktionsmodus starten"** (Regeln setzen wir gleich).
3. Standort: **eur3 (europe-west)** oder **europe-west3** wählen (Europa).
4. Erstellen.

## 4. Sicherheitsregeln setzen

1. In Firestore Database oben auf den Tab **„Regeln"**.
2. Den **gesamten Inhalt** der Datei [`firestore.rules`](firestore.rules) aus diesem
   Projekt hineinkopieren (den vorhandenen Text ersetzen).
3. **Veröffentlichen** klicken.

Damit gilt: nur eingeloggte Mitarbeiter dürfen lesen/schreiben.

## 5. Web-App registrieren und Konfiguration holen

1. In der Firebase-Console oben auf das **Zahnrad → Projekteinstellungen**.
2. Runter zu **„Meine Apps"** → auf das **Web-Symbol `</>`** klicken.
3. App-Spitzname z. B. `rechner-azj-web`, **Firebase Hosting NICHT** ankreuzen.
4. **Registrieren**. Es erscheint ein Code-Block mit `firebaseConfig = { ... }`.
5. Diese Werte brauchen wir für die `.env`-Datei (nächster Schritt).

## 6. `.env`-Datei anlegen

1. Im Projektordner die Datei **`.env.example`** kopieren und in **`.env`** umbenennen.
2. Die Werte aus dem `firebaseConfig`-Block eintragen:

```
VITE_FIREBASE_API_KEY=AIza............
VITE_FIREBASE_AUTH_DOMAIN=rechner-azj.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=rechner-azj
VITE_FIREBASE_STORAGE_BUCKET=rechner-azj.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:abcdef123456
VITE_REGISTER_ACCESS_CODE=AZJ-2026
```

> Die `.env` wird **nicht** ins Git hochgeladen (steht in `.gitignore`). Das ist gewollt.

## 7. App starten

Im Projektordner im Terminal:

```
npm install     (nur beim ersten Mal nötig)
npm run dev
```

Dann die angezeigte Adresse (meist http://localhost:5173) im Browser öffnen.

## 8. Ersten Account anlegen

1. Auf **„Registrieren"** klicken.
2. E-Mail, Passwort (mind. 6 Zeichen) und Zugangscode **AZJ-2026** eingeben.
3. Fertig – ab jetzt einloggen.

## 9. Composite-Index für die History

**Nicht nötig.** Die History wird bewusst ohne datenbankseitige Sortierung
geladen und im Browser sortiert – dadurch braucht Firestore keinen
zusammengesetzten Index. Du musst hier also nichts tun.

(Die Datei `firestore.indexes.json` bleibt nur als Referenz liegen, falls die
Sortierung später doch einmal in die Datenbank wandern soll.)

---

## Später: Auf Vercel veröffentlichen

1. Projekt auf GitHub pushen (ist schon verbunden).
2. Auf https://vercel.com mit GitHub einloggen → **„Add New… → Project"** →
   Repository `Rechner_azj` importieren.
3. Framework wird als **Vite** erkannt. Build-Command `npm run build`,
   Output-Verzeichnis `dist` (Standard).
4. Unter **„Environment Variables"** dieselben `VITE_...`-Werte wie in der `.env`
   eintragen.
5. **Deploy**. Danach die Vercel-Domain (z. B. `rechner-azj.vercel.app`) in der
   Firebase-Console unter **Authentication → Settings → Authorized domains**
   hinzufügen, damit der Login dort funktioniert.
