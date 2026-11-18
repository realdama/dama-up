"""Mappa del mondo "a puntini" (stile HUD) da Natural Earth, senza dipendenze.
Uso: python3 dotmap.py ne_110m_land.geojson > dots.txt
Dati: https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_land.geojson
Proiezione equirettangolare: viewBox 0 0 1000 460, lat 78..-56. Stampa un unico path
(ogni punto = "M x y h0", da disegnare con stroke-linecap:round) e, su stderr, le coordinate
SVG dei luoghi in PLACES (per nodi e rotte)."""
import json, sys
W, H, LAT0, LAT1, STEP = 1000, 460, 78, -56, 2.6
PLACES = {'roma': (12.5, 41.9), 'norvegia': (8, 63), 'scozia': (-4, 57), 'canada': (-63, 46), 'usa': (-70, 42),
          'ecuador': (-80, -1.5), 'argentina': (-65, -42), 'senegal': (-16, 14.5), 'sudafrica': (19, -33.5),
          'india': (80, 10), 'vietnam': (106, 12), 'nz': (172, -41)}
X = lambda lon: (lon + 180) / 360 * W
Y = lambda lat: (LAT0 - lat) / (LAT0 - LAT1) * H
def inside(x, y, r):
    c, j = False, len(r) - 1
    for i in range(len(r)):
        (xi, yi), (xj, yj) = r[i], r[j]
        if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi) + xi: c = not c
        j = i
    return c
polys = []
for f in json.load(open(sys.argv[1]))['features']:
    g = f['geometry']
    for poly in ([g['coordinates']] if g['type'] == 'Polygon' else g['coordinates']):
        r = poly[0]; xs = [p[0] for p in r]; ys = [p[1] for p in r]
        polys.append((r, min(xs), max(xs), min(ys), max(ys)))
out, lat = [], LAT0 - 1
while lat > LAT1:
    lon = -180 + STEP / 2
    while lon < 180:
        if any(a <= lon <= b and c <= lat <= e and inside(lon, lat, r) for r, a, b, c, e in polys):
            out.append(f'M{X(lon):.1f} {Y(lat):.1f}h0')
        lon += STEP
    lat -= STEP * 0.95
print(''.join(out))
for k, (lo, la) in PLACES.items(): print(k, round(X(lo), 1), round(Y(la), 1), file=sys.stderr)
