// Berechnet das Rückgeld und die optimale Stückelung in Euro-Scheinen/Münzen.

// Alle Euro-Stückelungen in Cent, von groß nach klein.
const DENOMINATIONS = [
  { cents: 50000, label: '500 €', type: 'Schein' },
  { cents: 20000, label: '200 €', type: 'Schein' },
  { cents: 10000, label: '100 €', type: 'Schein' },
  { cents: 5000, label: '50 €', type: 'Schein' },
  { cents: 2000, label: '20 €', type: 'Schein' },
  { cents: 1000, label: '10 €', type: 'Schein' },
  { cents: 500, label: '5 €', type: 'Schein' },
  { cents: 200, label: '2 €', type: 'Münze' },
  { cents: 100, label: '1 €', type: 'Münze' },
  { cents: 50, label: '50 Cent', type: 'Münze' },
  { cents: 20, label: '20 Cent', type: 'Münze' },
  { cents: 10, label: '10 Cent', type: 'Münze' },
  { cents: 5, label: '5 Cent', type: 'Münze' },
  { cents: 2, label: '2 Cent', type: 'Münze' },
  { cents: 1, label: '1 Cent', type: 'Münze' },
]

// priceCents  = Preis in Cent
// givenCents   = vom Kunden erhaltener Betrag in Cent
// Rückgabe: { changeCents, sufficient, breakdown: [{label, type, count, cents}] }
export function calculateChange(priceCents, givenCents) {
  if (
    priceCents === null ||
    givenCents === null ||
    priceCents === undefined ||
    givenCents === undefined
  ) {
    return { changeCents: null, sufficient: false, breakdown: [] }
  }

  const changeCents = givenCents - priceCents
  if (changeCents < 0) {
    return { changeCents, sufficient: false, breakdown: [] }
  }

  let rest = changeCents
  const breakdown = []
  for (const d of DENOMINATIONS) {
    if (rest >= d.cents) {
      const count = Math.floor(rest / d.cents)
      rest -= count * d.cents
      breakdown.push({ label: d.label, type: d.type, count, cents: d.cents })
    }
  }

  return { changeCents, sufficient: true, breakdown }
}
