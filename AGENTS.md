# Hermes extraction/classification contract

Gilt für wiederholbare Read-only Prüfungen mit festen Targets und Anchors.

## Endzustand pro Target

[found] target=... | anchor=primary:... | value=... | file=... | context=...
ODER
[missing] target=... | file=... | checked_primary=... | checked_secondary=... | scan=full-file
ODER
[format-error] field=... | value=... | expected=...

## Harte Regeln

- Pro target maximal eine Endzeile.
- found nur auf Basis eines Primärankers.
- missing nur bei Vollscan und null Primärankern.
- Sekundäranker nie als eigene Klassifikation.
- context nur roher lokaler Codeausschnitt, keine Meta-Kommentare.
- value muss direkt aus dem lokalen Kontext des Primärankers stammen.
- file muss im classify-mode aus der Extract-Liste übernommen werden.
- Abweichende Feld- oder Target-Namen werden als format-error behandelt.
