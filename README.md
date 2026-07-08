# Kassen-Rechner AZJ

Kleiner Rückgeld-Rechner für die Praxis (Augenzentrum Jedlersdorf), damit die
Kassa am Ende des Tages stimmt.

## Funktionen

- **Login / Registrierung** – Anmeldung nur mit registriertem Konto.
  Registrierung nur mit Zugangscode **`AZJ-2026`**.
- **Rückgeld-Rechner** – Produkt, Preis und erhaltenen Betrag eingeben; die App
  zeigt das Rückgeld **und die Stückelung** (welche Scheine/Münzen).
- **Zwei Firmen** – Umschalten zwischen **OG** und **See-Well-GmbH**. Jede Firma
  hat ihre **eigene** Produktliste und History.
- **Produkt-Gedächtnis** – ein einmal eingegebenes Produkt wird gespeichert und
  ist beim nächsten Mal per Tippen der ersten Buchstaben auswählbar.
- **Produkt-Verwaltung** – eigene Seite zum Hinzufügen, Bearbeiten (Preis ändern)
  und Löschen.
- **History pro Firma** – alle Verkäufe des laufenden Monats, mit Umsatz-Summe.
- **Excel-Export** – History als `.xlsx` herunterladen (gut lesbar, mit Summe).
- **Monats-Reset** – Button „Monat abschließen": erstellt zuerst automatisch eine
  Excel-Sicherung und leert dann die History, um die (kostenlose) Datenbank
  schlank zu halten.

## Technik

- **Frontend:** React + Vite (JavaScript), reines CSS.
- **Backend/Datenbank:** Firebase Authentication + Firestore.
- **Excel:** SheetJS (`xlsx`).

## Einrichtung

Firebase muss einmal von Hand eingerichtet werden – die komplette Anleitung
steht in **[FIREBASE_SETUP.md](FIREBASE_SETUP.md)**.

Kurzfassung danach:

```bash
npm install
npm run dev
```

Die App braucht eine `.env`-Datei (aus `.env.example` erstellen) mit den
Firebase-Zugangsdaten.

## Projektstruktur

```
src/
  firebase.js          Firebase-Initialisierung (liest .env)
  constants.js         Firmen (OG / GmbH) + Zugangscode
  data.js              Alle Firestore-Zugriffe (Produkte, History)
  context/AuthContext  Login-Status app-weit
  components/          Navbar, Firma-Umschalter
  pages/               Login, Register, Calculator, Products, History
  utils/               Geld-, Rückgeld-, Datums- und Excel-Helfer
  styles.css           Gesamtes Styling (AZJ-Blau)
firestore.rules        Sicherheitsregeln (nur eingeloggt)
firestore.indexes.json Composite-Index für die History
```

## Datenmodell (Firestore)

- **`products`** – `{ name, nameLower, priceCents, company, createdAt, updatedAt }`
- **`history`** – `{ company, productName, priceCents, givenCents, changeCents,
  userEmail, month (YYYY-MM), createdAt }`

Beträge werden intern in **Cent** gespeichert, um Rundungsfehler zu vermeiden.
