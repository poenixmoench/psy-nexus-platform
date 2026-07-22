# GEOMETRY_ENGINE API-Dokumentation

## Beschreibung
Die Geometrie-Engine bietet vorberechnete mathematische Funktionen für die Generierung komplexer geometrischer Formen, heiliger Geometrien und Fraktale. Die Engine ist als Werkzeug für KI-Agenten verfügbar, um präzise mathematische Designs zu generieren.

## Struktur
\`\`\`typescript
interface IGeometryEngine {
  PLATONIC_SOLIDS: Record<string, IGeometricForm>;
  SACRED_GEOMETRY: Record<string, IGeometricForm>;
  COMPLEX_FORMS: Record<string, IGeometricForm>;
  CALCULATORS: Record<string, Function>;
}
\`\`\`

## Hauptmodule

### PLATONIC_SOLIDS
- **TETRAHEDRON**: 4-flächiges Tetraeder
- **HEXAHEDRON**: 6-flächiger Würfel
- **ICOSAHEDRON**: 20-flächiges Ikosaeder
- **DODECAHEDRON**: 12-flächiges Dodekaeder

### SACRED_GEOMETRY
- **SRI_YANTRA**: 9 ineinandergreifende Dreiecke
- **MERKABA**: Stern-Tetraeder
- **VESICA_PISCIS**: Schnittmenge zweier Kreise
- **FLOWER_OF_LIFE**: Heilige geometrische Muster

### COMPLEX_FORMS
- **TORUS**: Donut-förmige Fläche
- **KOCH_SNOWFLAKE**: Fraktale Schneeflocke
- **LOG_SPIRAL**: Logarithmische Spirale
- **FIB_SPIRAL**: Fibonacci-Spirale

## CALCULATORS-Funktionen

### calculateTetrahedron(size: number = 1)
Gibt IGeometryPoint[] für ein Tetraeder zurück

### calculateTorus(R: number = 2, r: number = 0.5)
Gibt IGeometryPoint[] für einen Torus zurück

### calculateSpiral(turns: number = 1, points: number = 100)
Gibt IGeometryPoint[] für eine generische Spirale zurück

### calculateGoldenRatioRect(width: number = 1)
Gibt IGeometryPoint[] für ein Rechteck im goldenen Verhältnis zurück
- Nutze für Layout-Proportionen
- Höhe = Breite / 1.618033988749895

### calculateMetatronsCube(radius: number = 1)
Gibt IGeometryPoint[] für Metatron's Würfel zurück

### calculateBezierCurve(start: IGeometryPoint, control: IGeometryPoint, end: IGeometryPoint, steps: number = 100)
Gibt IGeometryPoint[] für eine Bézier-Kurve zurück

### calculateLinearInterpolation(start: IGeometryPoint, end: IGeometryPoint, steps: number = 100)
Gibt IGeometryPoint[] für lineare Interpolation zurück

### calculateMandalaSymmetry(baseShape: IGeometryPoint[], repetitions: number = 8)
Gibt IGeometryPoint[] für mandala-symmetrische Formen zurück
- Rotiert die Basisform n-mal im Kreis
- Nutze um aus einfachen Linien komplexe Muster zu erstellen

### calculateSriYantra(layers: number = 9)
Gibt IGeometryPoint[] für das Sri Yantra Muster zurück

### compressPoints(points: IGeometryPoint[], tolerance: number = 0.1)
Komprimiert Punkt-Arrays mit Ramer-Douglas-Peucker Algorithmus

### normalizePoints(points: IGeometryPoint[])
Normalisiert Punkt-Arrays auf Einheitsgröße

## Nutzung durch KI-Agenten

Wenn nach Design gefragt wird:

1. Nutze \`CALCULATORS.calculateGoldenRatioRect\` für Layout-Proportionen
2. Nutze \`CALCULATORS.calculateMandalaSymmetry\`, um aus einfachen Linien komplexe Muster zu erstellen
3. Nutze \`FRACTAL_FORMS\`, wenn nach 'unendlicher Tiefe' oder 'organischem Chaos' gefragt wird
4. Generiere SVG-Pfade basierend auf den IGeometryPoint-Arrays, die die Engine ausgibt
5. Verwende die Formen direkt aus den Modulen für spezifische Anforderungen

## Beispiel für SVG-Generierung
\`\`\`javascript
const rectPoints = GEOMETRY_ENGINE.CALCULATORS.calculateGoldenRatioRect(100);
const svgPath = "M" + rectPoints.map(p => \`\${p.x},\${p.y}\`).join(" L") + " Z";
\`\`\`
